import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  authenticateRequest, 
  isTeamMember, 
  corsHeaders, 
  unauthorizedResponse, 
  forbiddenResponse,
  badRequestResponse,
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMITS,
  z 
} from "../_shared/auth.ts";

const FiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  agentId: z.string().uuid().optional(),
  department: z.string().max(100).optional(),
}).optional();

const HealthDataSchema = z.object({
  component: z.string().max(100),
  status: z.string().max(50),
  latency_ms: z.number().int().min(0).max(1000000).optional(),
  error_rate: z.number().min(0).max(100).optional(),
  details: z.record(z.unknown()).optional(),
}).optional();

const TelemetryRequestSchema = z.object({
  action: z.enum(["get_stats", "get_costs", "get_health", "record_health"]),
  filters: FiltersSchema,
  healthData: HealthDataSchema,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const { user, error: authError } = await authenticateRequest(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || "Unauthorized");
    }

    // Rate limiting
    const rateLimit = checkRateLimit(user.id, RATE_LIMITS.telemetry);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt);
    }

    // Check if user is a team member
    const isMember = await isTeamMember(user.id);
    if (!isMember) {
      return forbiddenResponse("User is not a team member");
    }

    // Validate request body
    const body = await req.json();
    const parsed = TelemetryRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { action, filters, healthData } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Telemetry] Action: ${action}, User: ${user.id}`);

    if (action === "get_stats") {
      // Get aggregated statistics
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();

      // Active agents
      const { count: activeAgents } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("status", "running");

      // Tasks today
      const { count: tasksToday } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay);

      // Completed tasks
      const { count: completedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Failed tasks
      const { count: failedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      // Pending approvals
      const { count: pendingApprovals } = await supabase
        .from("approvals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Cost today
      const { data: costData } = await supabase
        .from("cost_records")
        .select("cost")
        .gte("recorded_at", startOfDay);

      const costToday = costData?.reduce((sum, record) => sum + Number(record.cost), 0) || 0;

      // Cost this week
      const { data: weekCostData } = await supabase
        .from("cost_records")
        .select("cost")
        .gte("recorded_at", startOfWeek);

      const costThisWeek = weekCostData?.reduce((sum, record) => sum + Number(record.cost), 0) || 0;

      return new Response(
        JSON.stringify({
          activeAgents: activeAgents || 0,
          tasksToday: tasksToday || 0,
          completedTasks: completedTasks || 0,
          failedTasks: failedTasks || 0,
          pendingApprovals: pendingApprovals || 0,
          costToday,
          costThisWeek,
          successRate: completedTasks && (completedTasks + (failedTasks || 0)) > 0
            ? Math.round((completedTasks / (completedTasks + (failedTasks || 0))) * 100)
            : 100,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_costs") {
      // Get cost breakdown
      let query = supabase
        .from("cost_records")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1000);

      if (filters?.startDate) {
        query = query.gte("recorded_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("recorded_at", filters.endDate);
      }
      if (filters?.agentId) {
        query = query.eq("agent_id", filters.agentId);
      }
      if (filters?.department) {
        query = query.eq("department", filters.department);
      }

      const { data: costs, error } = await query;

      if (error) throw error;

      // Aggregate by department
      const byDepartment: Record<string, number> = {};
      const byModel: Record<string, number> = {};
      let totalCost = 0;
      let totalTokens = 0;

      for (const record of costs || []) {
        const dept = record.department || "Unknown";
        const model = record.model || "Unknown";
        const cost = Number(record.cost);

        byDepartment[dept] = (byDepartment[dept] || 0) + cost;
        byModel[model] = (byModel[model] || 0) + cost;
        totalCost += cost;
        totalTokens += (record.tokens_input || 0) + (record.tokens_output || 0);
      }

      return new Response(
        JSON.stringify({
          totalCost,
          totalTokens,
          byDepartment,
          byModel,
          records: costs?.slice(0, 100),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_health") {
      // Get latest health status for each component
      const { data: healthRecords, error } = await supabase
        .from("system_health")
        .select("*")
        .order("recorded_at", { ascending: false });

      if (error) throw error;

      // Get latest status per component
      const latestByComponent: Record<string, typeof healthRecords[0]> = {};
      for (const record of healthRecords || []) {
        if (!latestByComponent[record.component]) {
          latestByComponent[record.component] = record;
        }
      }

      return new Response(
        JSON.stringify({
          components: Object.values(latestByComponent),
          overall: Object.values(latestByComponent).every(c => c.status === "healthy") 
            ? "healthy" 
            : "degraded",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record_health" && healthData) {
      // Record health metric
      const { data, error } = await supabase
        .from("system_health")
        .insert(healthData)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, record: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Telemetry] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
