import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type PolicyRule = Tables<"policy_rules">;

export function usePolicyRules() {
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicyRules();

    const channel = supabase
      .channel("policy-rules-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "policy_rules" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPolicyRules((prev) => [payload.new as PolicyRule, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setPolicyRules((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as PolicyRule) : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPolicyRules((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPolicyRules = async () => {
    const { data, error } = await supabase
      .from("policy_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching policy rules:", error);
    } else {
      setPolicyRules(data || []);
    }
    setLoading(false);
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("policy_rules")
      .update({ enabled })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update policy");
      throw error;
    }
    toast.success(`Policy ${enabled ? "enabled" : "disabled"}`);
  };

  return {
    policyRules,
    loading,
    toggleRule,
    refetch: fetchPolicyRules,
  };
}
