import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  activeAgents: number;
  tasksToday: number;
  completedTasks: number;
  failedTasks: number;
  pendingApprovals: number;
  costToday: number;
  costThisWeek: number;
  successRate: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    tasksToday: 0,
    completedTasks: 0,
    failedTasks: 0,
    pendingApprovals: 0,
    costToday: 0,
    costThisWeek: 0,
    successRate: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Set up realtime subscriptions for live updates
    const agentsChannel = supabase
      .channel("dashboard-agents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        () => fetchStats()
      )
      .subscribe();

    const tasksChannel = supabase
      .channel("dashboard-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchStats()
      )
      .subscribe();

    const approvalsChannel = supabase
      .channel("dashboard-approvals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approvals" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(approvalsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();

      // Fetch counts in parallel
      const [
        agentsResult,
        tasksTodayResult,
        completedResult,
        failedResult,
        approvalsResult,
        costTodayResult,
        costWeekResult,
      ] = await Promise.all([
        supabase.from("agents").select("*", { count: "exact", head: true }).eq("status", "running"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).gte("created_at", startOfDay),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cost_records").select("cost").gte("recorded_at", startOfDay),
        supabase.from("cost_records").select("cost").gte("recorded_at", startOfWeek),
      ]);

      const activeAgents = agentsResult.count || 0;
      const tasksToday = tasksTodayResult.count || 0;
      const completedTasks = completedResult.count || 0;
      const failedTasks = failedResult.count || 0;
      const pendingApprovals = approvalsResult.count || 0;
      const costToday = costTodayResult.data?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;
      const costThisWeek = costWeekResult.data?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;
      const totalTasks = completedTasks + failedTasks;
      const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

      setStats({
        activeAgents,
        tasksToday,
        completedTasks,
        failedTasks,
        pendingApprovals,
        costToday,
        costThisWeek,
        successRate,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
