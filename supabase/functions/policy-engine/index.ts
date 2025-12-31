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

const PolicyCheckRequestSchema = z.object({
  agentId: z.string().uuid(),
  action: z.string().max(100),
  resource: z.string().max(200),
  context: z.record(z.unknown()).optional(),
});

interface PolicyDecision {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
  appliedPolicies: string[];
}

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
    const parsed = PolicyCheckRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse("Invalid request body");
    }

    const { agentId, action, resource, context } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Policy Engine] Checking: Agent ${agentId}, Action: ${action}, Resource: ${resource}, User: ${user.id}`);

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .maybeSingle();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: "Agent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check kill switches
    const { data: killSwitches } = await supabase
      .from("kill_switches")
      .select("*")
      .eq("is_active", true);

    for (const killSwitch of killSwitches || []) {
      if (
        killSwitch.target_type === "all" ||
        (killSwitch.target_type === "agent" && killSwitch.target_ids?.includes(agentId)) ||
        (killSwitch.target_type === "category" && killSwitch.target_ids?.includes(agent.role))
      ) {
        console.log(`[Policy Engine] Kill switch active: ${killSwitch.name}`);
        return new Response(
          JSON.stringify({
            allowed: false,
            requiresApproval: false,
            reason: `Kill switch active: ${killSwitch.name}`,
            appliedPolicies: [killSwitch.name],
          } as PolicyDecision),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get applicable policy rules
    const { data: policies } = await supabase
      .from("policy_rules")
      .select("*")
      .eq("enabled", true);

    const decision: PolicyDecision = {
      allowed: true,
      requiresApproval: false,
      appliedPolicies: [],
    };

    // Evaluate policies
    for (const policy of policies || []) {
      const conditions = policy.conditions || {};
      let policyApplies = false;

      // Check if policy applies to this action/resource
      if (conditions.actions?.includes(action) || conditions.resources?.includes(resource)) {
        policyApplies = true;
      }

      // Check agent autonomy level
      if (agent.autonomy_level === "approval_required") {
        decision.requiresApproval = true;
        decision.appliedPolicies.push("autonomy_level_policy");
      }

      // Check decision boundaries
      const boundaries = agent.decision_boundaries || {};
      if (boundaries.maxAmount && context?.amount) {
        if ((context.amount as number) > boundaries.maxAmount) {
          decision.requiresApproval = true;
          decision.reason = `Amount exceeds agent limit of ${boundaries.maxAmount}`;
          decision.appliedPolicies.push("amount_threshold_policy");
        }
      }

      // Check data access
      if (boundaries.restrictedData?.includes(resource)) {
        decision.allowed = false;
        decision.reason = `Agent not permitted to access ${resource}`;
        decision.appliedPolicies.push("data_restriction_policy");
      }

      if (policyApplies) {
        decision.appliedPolicies.push(policy.name);
        
        // Apply policy actions
        if (policy.actions?.require_approval) {
          decision.requiresApproval = true;
        }
        if (policy.actions?.deny) {
          decision.allowed = false;
          decision.reason = policy.description;
        }
      }
    }

    // Log policy decision
    await supabase.rpc("log_audit_event", {
      p_actor_type: "user",
      p_actor_id: user.id,
      p_action: "policy_check",
      p_resource_type: "agent",
      p_resource_id: agentId,
      p_details: { 
        action, 
        resource, 
        decision
      },
      p_severity: decision.allowed ? "info" : "warning",
    });

    console.log(`[Policy Engine] Decision: allowed=${decision.allowed}, requiresApproval=${decision.requiresApproval}`);

    return new Response(
      JSON.stringify(decision),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Policy Engine] Error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
