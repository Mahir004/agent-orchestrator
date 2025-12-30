import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"tasks">;

export function useTasks(agentId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as Task;
            if (!agentId || newTask.agent_id === agentId) {
              setTasks((prev) => [newTask, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  const fetchTasks = async () => {
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  // Count tasks by agent for today
  const getTaskCountByAgent = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (t) => t.agent_id === id && t.created_at.startsWith(today)
    ).length;
  };

  return {
    tasks,
    loading,
    getTaskCountByAgent,
    refetch: fetchTasks,
  };
}
