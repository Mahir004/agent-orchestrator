import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  authenticateRequest, 
  checkUserRole, 
  corsHeaders, 
  unauthorizedResponse, 
  forbiddenResponse,
  badRequestResponse,
  z 
} from "../_shared/auth.ts";

const KillSwitchRequestSchema = z.object({
  action: z.enum(["activate", "deactivate"]),
  killSwitchId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
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

    // Check if user has kill switch permissions (admin or ops_manager)
    const isAdmin = await checkUserRole(user.id, "admin");
    const isOpsManager = await checkUserRole(user.id, "ops_manager");
    if (!isAdmin && !isOpsManager) {
      return forbiddenResponse("User not authorized to manage kill switches");
    }

    // Validate request body
    const body = await req.json();
    const parsed = KillSwitchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { action, killSwitchId, reason } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Kill Switch] Action: ${action}, ID: ${killSwitchId}, User: ${user.id}`);

    // Get kill switch
    const { data: killSwitch, error: ksError } = await supabase
      .from("kill_switches")
      .select("*")
      .eq("id", killSwitchId)
      .maybeSingle();

    if (ksError || !killSwitch) {
      return new Response(
        JSON.stringify({ error: "Kill switch not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "activate") {
      // Activate kill switch with authenticated user ID
      await supabase
        .from("kill_switches")
        .update({
          is_active: true,
          activated_by: user.id,
          activated_at: new Date().toISOString(),
          reason: reason || "Emergency stop activated",
        })
        .eq("id", killSwitchId);

      // Stop affected agents
      let agentQuery = supabase
        .from("agents")
        .update({ status: "stopped" })
        .eq("status", "running");

      if (killSwitch.target_type === "agent" && killSwitch.target_ids?.length) {
        agentQuery = agentQuery.in("id", killSwitch.target_ids);
      } else if (killSwitch.target_type === "category" && killSwitch.target_ids?.length) {
        agentQuery = agentQuery.in("role", killSwitch.target_ids);
      }
      // For "all", no additional filter needed

      const { data: stoppedAgents, error: stopError } = await agentQuery.select("id");

      if (stopError) {
        console.error("[Kill Switch] Failed to stop agents:", stopError);
      }

      // Cancel pending tasks
      if (stoppedAgents?.length) {
        await supabase
          .from("tasks")
          .update({
            status: "failed",
            error_message: "Cancelled by emergency kill switch",
            completed_at: new Date().toISOString(),
          })
          .in("agent_id", stoppedAgents.map(a => a.id))
          .in("status", ["pending", "in_progress", "awaiting_approval"]);
      }

      // Log audit event with authenticated user ID
      await supabase.rpc("log_audit_event", {
        p_actor_type: "user",
        p_actor_id: user.id,
        p_action: "kill_switch_activated",
        p_resource_type: "kill_switch",
        p_resource_id: killSwitchId,
        p_details: { 
          target_type: killSwitch.target_type,
          target_ids: killSwitch.target_ids,
          stopped_agents: stoppedAgents?.map(a => a.id),
          reason 
        },
        p_severity: "critical",
      });

      console.log(`[Kill Switch] Activated: ${killSwitch.name}, stopped ${stoppedAgents?.length || 0} agents`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          stoppedAgents: stoppedAgents?.length || 0,
          message: `Kill switch activated. ${stoppedAgents?.length || 0} agents stopped.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "deactivate") {
      // Deactivate kill switch
      await supabase
        .from("kill_switches")
        .update({
          is_active: false,
        })
        .eq("id", killSwitchId);

      // Log audit event with authenticated user ID
      await supabase.rpc("log_audit_event", {
        p_actor_type: "user",
        p_actor_id: user.id,
        p_action: "kill_switch_deactivated",
        p_resource_type: "kill_switch",
        p_resource_id: killSwitchId,
        p_details: { reason },
        p_severity: "warning",
      });

      console.log(`[Kill Switch] Deactivated: ${killSwitch.name}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Kill switch deactivated. Agents can be manually restarted."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Kill Switch] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
