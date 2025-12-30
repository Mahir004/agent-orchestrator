import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Workflow = Tables<"workflows">;

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();

    const channel = supabase
      .channel("workflows-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workflows" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setWorkflows((prev) => [payload.new as Workflow, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setWorkflows((prev) =>
              prev.map((w) => (w.id === payload.new.id ? (payload.new as Workflow) : w))
            );
          } else if (payload.eventType === "DELETE") {
            setWorkflows((prev) => prev.filter((w) => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWorkflows = async () => {
    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to load workflows");
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  const createWorkflow = async (workflow: { name: string; description?: string }) => {
    const { data, error } = await supabase
      .from("workflows")
      .insert([workflow])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create workflow");
      throw error;
    }
    toast.success("Workflow created successfully");
    return data;
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    const { error } = await supabase
      .from("workflows")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update workflow");
      throw error;
    }
    toast.success("Workflow updated successfully");
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase.from("workflows").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete workflow");
      throw error;
    }
    toast.success("Workflow deleted successfully");
  };

  const toggleWorkflowStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateWorkflow(id, { status: newStatus });
  };

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    refetch: fetchWorkflows,
  };
}
