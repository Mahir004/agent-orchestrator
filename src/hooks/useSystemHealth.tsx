import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SystemHealth = Tables<"system_health">;

export function useSystemHealth() {
  const [healthMetrics, setHealthMetrics] = useState<SystemHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthMetrics();

    const channel = supabase
      .channel("system-health-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_health" },
        () => fetchHealthMetrics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHealthMetrics = async () => {
    // Get latest health record per component
    const { data, error } = await supabase
      .from("system_health")
      .select("*")
      .order("recorded_at", { ascending: false });

    if (error) {
      console.error("Error fetching system health:", error);
    } else {
      // Get unique latest per component
      const latestByComponent = new Map<string, SystemHealth>();
      data?.forEach((record) => {
        if (!latestByComponent.has(record.component)) {
          latestByComponent.set(record.component, record);
        }
      });
      setHealthMetrics(Array.from(latestByComponent.values()));
    }
    setLoading(false);
  };

  return {
    healthMetrics,
    loading,
    refetch: fetchHealthMetrics,
  };
}
