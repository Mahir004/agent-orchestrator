import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  approvalId: string;
  action: "approve" | "reject";
  userId: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { approvalId, action, userId, reason } = await req.json() as ApprovalRequest;

    console.log(`[Approvals] Action: ${action}, Approval: ${approvalId}, User: ${userId}`);

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

    // Update approval status
    const updateData: Record<string, unknown> = {
      status: action === "approve" ? "approved" : "rejected",
      approved_by: userId,
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

    // Log audit event
    await supabase.rpc("log_audit_event", {
      p_actor_type: "user",
      p_actor_id: userId,
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

    console.log(`[Approvals] Approval ${approvalId} ${action}d by ${userId}`);

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
