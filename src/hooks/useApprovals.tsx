import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Approval = Tables<"approvals">;

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();

    const channel = supabase
      .channel("approvals-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approvals" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setApprovals((prev) => [payload.new as Approval, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setApprovals((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as Approval) : a))
            );
          } else if (payload.eventType === "DELETE") {
            setApprovals((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApprovals = async () => {
    const { data, error } = await supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approvals:", error);
    } else {
      setApprovals(data || []);
    }
    setLoading(false);
  };

  const approveRequest = async (approvalId: string, userId: string) => {
    const { error } = await supabase.functions.invoke("approvals", {
      body: { approvalId, action: "approve", userId },
    });

    if (error) {
      toast.error("Failed to approve request");
      throw error;
    }
    toast.success("Request approved");
  };

  const rejectRequest = async (approvalId: string, userId: string, reason?: string) => {
    const { error } = await supabase.functions.invoke("approvals", {
      body: { approvalId, action: "reject", userId, reason },
    });

    if (error) {
      toast.error("Failed to reject request");
      throw error;
    }
    toast.success("Request rejected");
  };

  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  return {
    approvals,
    pendingApprovals,
    loading,
    approveRequest,
    rejectRequest,
    refetch: fetchApprovals,
  };
}
