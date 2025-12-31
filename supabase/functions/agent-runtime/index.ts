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

const TaskRequestSchema = z.object({
  agentId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  action: z.enum(["execute", "retry", "cancel"]),
  input: z.record(z.unknown()).optional(),
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
    const rateLimit = checkRateLimit(user.id, RATE_LIMITS.agentRuntime);
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
    const parsed = TaskRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { agentId, taskId, action, input } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Agent Runtime] Action: ${action}, Agent: ${agentId}, Task: ${taskId}, User: ${user.id}`);

    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .maybeSingle();

    if (agentError || !agent) {
      console.error("[Agent Runtime] Agent not found:", agentError);
      return new Response(
        JSON.stringify({ error: "Agent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if agent is running
    if (agent.status !== "running" && action === "execute") {
      return new Response(
        JSON.stringify({ error: "Agent is not in running state" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let task;

    if (action === "execute") {
      // Sanitize input title and description
      const sanitizedTitle = typeof input?.title === "string" 
        ? input.title.slice(0, 200) 
        : "New Task";
      const sanitizedDescription = typeof input?.description === "string" 
        ? input.description.slice(0, 2000) 
        : "";

      // Create new task
      const { data: newTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          agent_id: agentId,
          title: sanitizedTitle,
          description: sanitizedDescription,
          status: "in_progress",
          input_data: input,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (taskError) {
        console.error("[Agent Runtime] Failed to create task:", taskError);
        throw taskError;
      }
      task = newTask;

      // Log audit event with authenticated user
      await supabase.rpc("log_audit_event", {
        p_actor_type: "user",
        p_actor_id: user.id,
        p_action: "task_started",
        p_resource_type: "task",
        p_resource_id: task.id,
        p_details: { agent_id: agentId },
        p_severity: "info",
      });

      // Simulate task execution (in real system, this would call the agent's logic)
      const tokensUsed = Math.floor(Math.random() * 1000) + 100;
      const cost = tokensUsed * 0.00003; // Simplified cost calculation

      // Update task as completed
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          output_data: { result: "Task completed successfully", processed_at: new Date().toISOString() },
          tokens_used: tokensUsed,
          cost,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (updateError) {
        console.error("[Agent Runtime] Failed to update task:", updateError);
      }

      // Record cost
      await supabase.from("cost_records").insert({
        agent_id: agentId,
        task_id: task.id,
        department: agent.owner_team,
        model: agent.model,
        tokens_input: Math.floor(tokensUsed * 0.4),
        tokens_output: Math.floor(tokensUsed * 0.6),
        cost,
      });

      console.log(`[Agent Runtime] Task ${task.id} completed`);
    } else if (action === "retry" && taskId) {
      // Retry failed task
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .maybeSingle();

      if (!existingTask) {
        return new Response(
          JSON.stringify({ error: "Task not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: retryError } = await supabase
        .from("tasks")
        .update({
          status: "in_progress",
          retry_count: (existingTask.retry_count || 0) + 1,
          error_message: null,
          started_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (retryError) throw retryError;
      task = { ...existingTask, status: "in_progress" };
    } else if (action === "cancel" && taskId) {
      // Cancel task
      const { error: cancelError } = await supabase
        .from("tasks")
        .update({
          status: "failed",
          error_message: "Cancelled by user",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (cancelError) throw cancelError;
      task = { id: taskId, status: "failed" };
    }

    return new Response(
      JSON.stringify({ success: true, task }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Agent Runtime] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
