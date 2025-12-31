import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type KillSwitch = Tables<"kill_switches">;

export function useKillSwitches() {
  const [killSwitches, setKillSwitches] = useState<KillSwitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKillSwitches();

    const channel = supabase
      .channel("kill-switches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kill_switches" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setKillSwitches((prev) => [payload.new as KillSwitch, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setKillSwitches((prev) =>
              prev.map((k) => (k.id === payload.new.id ? (payload.new as KillSwitch) : k))
            );
          } else if (payload.eventType === "DELETE") {
            setKillSwitches((prev) => prev.filter((k) => k.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKillSwitches = async () => {
    const { data, error } = await supabase
      .from("kill_switches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching kill switches:", error);
    } else {
      setKillSwitches(data || []);
    }
    setLoading(false);
  };

  const activateKillSwitch = async (id: string, reason?: string) => {
    const { error } = await supabase.functions.invoke("kill-switch", {
      body: { killSwitchId: id, action: "activate", reason },
    });

    if (error) {
      toast.error("Failed to activate kill switch");
      throw error;
    }
    toast.success("Kill switch activated - agents stopped");
  };

  const deactivateKillSwitch = async (id: string) => {
    const { error } = await supabase.functions.invoke("kill-switch", {
      body: { killSwitchId: id, action: "deactivate" },
    });

    if (error) {
      toast.error("Failed to deactivate kill switch");
      throw error;
    }
    toast.success("Kill switch deactivated - agents resumed");
  };

  return {
    killSwitches,
    loading,
    activateKillSwitch,
    deactivateKillSwitch,
    refetch: fetchKillSwitches,
  };
}
