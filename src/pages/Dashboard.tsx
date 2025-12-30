import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AgentActivityChart } from "@/components/dashboard/AgentActivityChart";
import { TopAgentsTable } from "@/components/dashboard/TopAgentsTable";
import { PendingApprovalsCard } from "@/components/dashboard/PendingApprovalsCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { Bot, CheckCircle, Clock, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Real-time Status Banner */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success status-pulse" />
          <span>Live • Last updated just now</span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          ) : (
            <>
              <MetricCard
                title="Active Agents"
                value={stats.activeAgents}
                change={`${stats.activeAgents} running`}
                changeType="positive"
                icon={Bot}
                iconColor="primary"
              />
              <MetricCard
                title="Tasks Completed"
                value={stats.completedTasks.toLocaleString()}
                change={`${stats.successRate}% success rate`}
                changeType="positive"
                icon={CheckCircle}
                iconColor="success"
              />
              <MetricCard
                title="Pending Approval"
                value={stats.pendingApprovals}
                change={stats.pendingApprovals > 0 ? "Needs attention" : "All clear"}
                changeType={stats.pendingApprovals > 0 ? "neutral" : "positive"}
                icon={Clock}
                iconColor="warning"
              />
              <MetricCard
                title="Failed Tasks"
                value={stats.failedTasks}
                change={stats.failedTasks === 0 ? "No failures" : "Review needed"}
                changeType={stats.failedTasks === 0 ? "positive" : "negative"}
                icon={AlertTriangle}
                iconColor="destructive"
              />
              <MetricCard
                title="Today's Cost"
                value={`₹${stats.costToday.toFixed(2)}`}
                change="Within budget"
                changeType="positive"
                icon={DollarSign}
                iconColor="primary"
              />
              <MetricCard
                title="Tasks Today"
                value={stats.tasksToday}
                change="Active processing"
                changeType="positive"
                icon={Activity}
                iconColor="success"
              />
            </>
          )}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AgentActivityChart />
          <TopAgentsTable />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingApprovalsCard />
          <SystemHealthCard />
        </div>
      </div>
    </MainLayout>
  );
}
