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

const ApprovalRequestSchema = z.object({
  approvalId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
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

    // Check if user has approval permissions (admin or ops_manager)
    const isAdmin = await checkUserRole(user.id, "admin");
    const isOpsManager = await checkUserRole(user.id, "ops_manager");
    if (!isAdmin && !isOpsManager) {
      return forbiddenResponse("User not authorized to manage approvals");
    }

    // Validate request body
    const body = await req.json();
    const parsed = ApprovalRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { approvalId, action, reason } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Approvals] Action: ${action}, Approval: ${approvalId}, User: ${user.id}`);

    // Get approval request
    const { data: approval, error: approvalError } = await supabase
      .from("approvals")
      .select("*, agent:agents(*), task:tasks(*)")
      .eq("id", approvalId)
      .maybeSingle();

    if (approvalError || !approval) {
      return new Response(
        JSON.stringify({ error: "Approval not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (approval.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Approval already processed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update approval status with authenticated user ID
    const updateData: Record<string, unknown> = {
      status: action === "approve" ? "approved" : "rejected",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    if (action === "reject" && reason) {
      updateData.rejection_reason = reason;
    }

    const { error: updateError } = await supabase
      .from("approvals")
      .update(updateData)
      .eq("id", approvalId);

    if (updateError) throw updateError;

    // Log audit event with authenticated user ID
    await supabase.rpc("log_audit_event", {
      p_actor_type: "user",
      p_actor_id: user.id,
      p_action: action === "approve" ? "approval_granted" : "approval_denied",
      p_resource_type: "approval",
      p_resource_id: approvalId,
      p_details: { 
        agent_id: approval.agent_id,
        task_id: approval.task_id,
        reason 
      },
      p_severity: "info",
    });

    // If approved, execute the pending action
    if (action === "approve" && approval.requested_action) {
      const requestedAction = approval.requested_action;

      if (requestedAction.tool) {
        // Execute tool
        console.log(`[Approvals] Executing approved tool: ${requestedAction.tool}`);
        
        // Call tool executor
        await fetch(`${supabaseUrl}/functions/v1/tool-executor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            agentId: approval.agent_id,
            toolId: requestedAction.tool,
            parameters: requestedAction.parameters,
            bypassApproval: true,
          }),
        });
      }

      if (approval.task_id) {
        // Resume task
        await supabase
          .from("tasks")
          .update({ 
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", approval.task_id);
      }
    }

    // If rejected and there's a task, mark it as failed
    if (action === "reject" && approval.task_id) {
      await supabase
        .from("tasks")
        .update({ 
          status: "failed",
          error_message: `Approval rejected: ${reason || "No reason provided"}`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", approval.task_id);
    }

    console.log(`[Approvals] Approval ${approvalId} ${action}d by ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: action === "approve" ? "approved" : "rejected" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Approvals] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
