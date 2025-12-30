import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AgentActivityChart } from "@/components/dashboard/AgentActivityChart";
import { TopAgentsTable } from "@/components/dashboard/TopAgentsTable";
import { PendingApprovalsCard } from "@/components/dashboard/PendingApprovalsCard";
import { SystemHealthCard } from "@/components/dashboard/SystemHealthCard";
import { Bot, CheckCircle, Clock, AlertTriangle, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
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
          <MetricCard
            title="Active Agents"
            value={24}
            change="+3 from yesterday"
            changeType="positive"
            icon={Bot}
            iconColor="primary"
          />
          <MetricCard
            title="Tasks Completed"
            value="1,247"
            change="+18% this week"
            changeType="positive"
            icon={CheckCircle}
            iconColor="success"
          />
          <MetricCard
            title="Pending Approval"
            value={12}
            change="3 high priority"
            changeType="neutral"
            icon={Clock}
            iconColor="warning"
          />
          <MetricCard
            title="Failed Tasks"
            value={3}
            change="-2 from yesterday"
            changeType="positive"
            icon={AlertTriangle}
            iconColor="destructive"
          />
          <MetricCard
            title="Today's Cost"
            value="₹4,520"
            change="Within budget"
            changeType="positive"
            icon={DollarSign}
            iconColor="primary"
          />
          <MetricCard
            title="Avg Response"
            value="1.2s"
            change="-0.3s improved"
            changeType="positive"
            icon={Activity}
            iconColor="success"
          />
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
