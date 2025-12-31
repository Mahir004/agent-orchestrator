import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  authenticateRequest, 
  isTeamMember, 
  corsHeaders, 
  unauthorizedResponse, 
  forbiddenResponse,
  badRequestResponse,
  z 
} from "../_shared/auth.ts";

const ToolRequestSchema = z.object({
  agentId: z.string().uuid(),
  toolId: z.string().uuid(),
  parameters: z.record(z.unknown()),
  bypassApproval: z.boolean().optional(),
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

    // Check if user is a team member
    const isMember = await isTeamMember(user.id);
    if (!isMember) {
      return forbiddenResponse("User is not a team member");
    }

    // Validate request body
    const body = await req.json();
    const parsed = ToolRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { agentId, toolId, parameters, bypassApproval } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Tool Executor] Agent: ${agentId}, Tool: ${toolId}, User: ${user.id}`);

    // Get tool configuration
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .select("*")
      .eq("id", toolId)
      .maybeSingle();

    if (toolError || !tool) {
      return new Response(
        JSON.stringify({ error: "Tool not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if tool is enabled
    if (!tool.enabled) {
      return new Response(
        JSON.stringify({ error: "Tool is disabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get agent to verify permissions
    const { data: agent } = await supabase
      .from("agents")
      .select("tools")
      .eq("id", agentId)
      .maybeSingle();

    if (!agent?.tools?.includes(toolId)) {
      return new Response(
        JSON.stringify({ error: "Agent not authorized to use this tool" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check policy engine first (skip if already approved)
    if (!bypassApproval) {
      const policyCheck = await fetch(`${supabaseUrl}/functions/v1/policy-engine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers.get("authorization") || "",
        },
        body: JSON.stringify({
          agentId,
          action: "tool_execute",
          resource: tool.name,
          context: { toolId, parameters },
        }),
      });

      const policyDecision = await policyCheck.json();

      if (!policyDecision.allowed) {
        console.log(`[Tool Executor] Policy denied: ${policyDecision.reason}`);
        return new Response(
          JSON.stringify({ error: policyDecision.reason, policyDecision }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (policyDecision.requiresApproval) {
        // Create approval request
        const { data: approval, error: approvalError } = await supabase
          .from("approvals")
          .insert({
            agent_id: agentId,
            title: `Tool execution: ${tool.name}`,
            description: `Agent requests to execute ${tool.name} with parameters`,
            status: "pending",
            requested_action: { tool: toolId, parameters },
          })
          .select()
          .single();

        if (approvalError) throw approvalError;

        return new Response(
          JSON.stringify({ 
            status: "pending_approval", 
            approvalId: approval.id,
            message: "Tool execution requires approval" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Execute tool based on type
    let result;
    const startTime = Date.now();

    switch (tool.type) {
      case "api":
        // Simulate API call
        result = { 
          success: true, 
          data: { message: "API call simulated", endpoint: tool.config?.endpoint },
        };
        break;
      case "database":
        // Simulate database query
        result = { 
          success: true, 
          data: { message: "Database query simulated" },
        };
        break;
      case "file":
        // Simulate file operation
        result = { 
          success: true, 
          data: { message: "File operation simulated" },
        };
        break;
      default:
        result = { 
          success: true, 
          data: { message: "Tool executed" },
        };
    }

    const executionTime = Date.now() - startTime;

    // Log audit event with authenticated user ID
    await supabase.rpc("log_audit_event", {
      p_actor_type: "user",
      p_actor_id: user.id,
      p_action: "tool_executed",
      p_resource_type: "tool",
      p_resource_id: toolId,
      p_details: { 
        agent_id: agentId,
        result, 
        execution_time_ms: executionTime 
      },
      p_severity: "info",
    });

    console.log(`[Tool Executor] Tool ${tool.name} executed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({ success: true, result, executionTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Tool Executor] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
