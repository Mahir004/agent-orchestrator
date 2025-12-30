import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Integration = Tables<"integrations">;

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();

    const channel = supabase
      .channel("integrations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "integrations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setIntegrations((prev) => [payload.new as Integration, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setIntegrations((prev) =>
              prev.map((i) => (i.id === payload.new.id ? (payload.new as Integration) : i))
            );
          } else if (payload.eventType === "DELETE") {
            setIntegrations((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching integrations:", error);
    } else {
      setIntegrations(data || []);
    }
    setLoading(false);
  };

  const createIntegration = async (integration: { name: string; type: string; api_endpoint?: string }) => {
    const { data, error } = await supabase
      .from("integrations")
      .insert([integration])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create integration");
      throw error;
    }
    toast.success("Integration created successfully");
    return data;
  };

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    const { error } = await supabase
      .from("integrations")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update integration");
      throw error;
    }
    toast.success("Integration updated successfully");
  };

  const deleteIntegration = async (id: string) => {
    const { error } = await supabase.from("integrations").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete integration");
      throw error;
    }
    toast.success("Integration deleted successfully");
  };

  return {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    refetch: fetchIntegrations,
  };
}
