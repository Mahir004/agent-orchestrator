import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Agent = Tables<"agents">;

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();

    const channel = supabase
      .channel("agents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAgents((prev) => [payload.new as Agent, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAgents((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as Agent) : a))
            );
          } else if (payload.eventType === "DELETE") {
            setAgents((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    } else {
      setAgents(data || []);
    }
    setLoading(false);
  };

  const createAgent = async (agent: Omit<Partial<Agent>, "id" | "created_at" | "updated_at"> & { name: string; role: string }) => {
    const { data, error } = await supabase
      .from("agents")
      .insert([agent])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create agent");
      throw error;
    }
    toast.success("Agent created successfully");
    return data;
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const { error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update agent");
      throw error;
    }
    toast.success("Agent updated successfully");
  };

  const deleteAgent = async (id: string) => {
    const { error } = await supabase.from("agents").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete agent");
      throw error;
    }
    toast.success("Agent deleted successfully");
  };

  const startAgent = async (id: string) => {
    await updateAgent(id, { status: "running" });
  };

  const stopAgent = async (id: string) => {
    await updateAgent(id, { status: "stopped" });
  };

  const pauseAgent = async (id: string) => {
    await updateAgent(id, { status: "paused" });
  };

  return {
    agents,
    loading,
    createAgent,
    updateAgent,
    deleteAgent,
    startAgent,
    stopAgent,
    pauseAgent,
    refetch: fetchAgents,
  };
}
