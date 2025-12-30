import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowRequest {
  workflowId: string;
  action: "start" | "pause" | "resume" | "cancel";
  input?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { workflowId, action, input } = await req.json() as WorkflowRequest;

    console.log(`[Orchestration] Action: ${action}, Workflow: ${workflowId}`);

    // Get workflow configuration
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .maybeSingle();

    if (workflowError || !workflow) {
      console.error("[Orchestration] Workflow not found:", workflowError);
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let workflowRun;

    if (action === "start") {
      // Create workflow run
      const { data: newRun, error: runError } = await supabase
        .from("workflow_runs")
        .insert({
          workflow_id: workflowId,
          status: "running",
          current_node: workflow.nodes?.[0]?.id || null,
          execution_log: [{ 
            timestamp: new Date().toISOString(), 
            event: "workflow_started",
            input 
          }],
        })
        .select()
        .single();

      if (runError) throw runError;
      workflowRun = newRun;

      // Update workflow status
      await supabase
        .from("workflows")
        .update({ status: "running" })
        .eq("id", workflowId);

      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_actor_type: "system",
        p_actor_id: null,
        p_action: "workflow_started",
        p_resource_type: "workflow",
        p_resource_id: workflowId,
        p_details: { run_id: workflowRun.id, input },
        p_severity: "info",
      });

      // Process workflow nodes (simplified)
      const nodes = workflow.nodes || [];
      for (const node of nodes) {
        console.log(`[Orchestration] Processing node: ${node.id}`);
        
        // Update current node
        await supabase
          .from("workflow_runs")
          .update({ 
            current_node: node.id,
            execution_log: [
              ...(workflowRun.execution_log || []),
              { timestamp: new Date().toISOString(), event: "node_started", node_id: node.id }
            ]
          })
          .eq("id", workflowRun.id);

        // Simulate node execution
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete workflow
      await supabase
        .from("workflow_runs")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", workflowRun.id);

      await supabase
        .from("workflows")
        .update({ status: "completed" })
        .eq("id", workflowId);

      console.log(`[Orchestration] Workflow ${workflowId} completed`);
    } else if (action === "pause") {
      // Get active run
      const { data: activeRun } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("workflow_id", workflowId)
        .eq("status", "running")
        .maybeSingle();

      if (activeRun) {
        await supabase
          .from("workflow_runs")
          .update({ status: "paused" })
          .eq("id", activeRun.id);

        await supabase
          .from("workflows")
          .update({ status: "paused" })
          .eq("id", workflowId);
      }
      workflowRun = activeRun;
    } else if (action === "cancel") {
      // Cancel active run
      const { data: activeRun } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("workflow_id", workflowId)
        .eq("status", "running")
        .maybeSingle();

      if (activeRun) {
        await supabase
          .from("workflow_runs")
          .update({ 
            status: "cancelled",
            completed_at: new Date().toISOString(),
          })
          .eq("id", activeRun.id);

        await supabase
          .from("workflows")
          .update({ status: "draft" })
          .eq("id", workflowId);
      }
      workflowRun = activeRun;
    }

    return new Response(
      JSON.stringify({ success: true, workflowRun }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Orchestration] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
