import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, ArrowRight, GitBranch, Clock, CheckCircle } from "lucide-react";

const workflows = [
  {
    id: "1",
    name: "Invoice Processing Pipeline",
    status: "active" as const,
    agents: ["Finance Reviewer", "Compliance Checker", "Procurement Bot"],
    executions: 1247,
    successRate: 98.5,
    avgTime: "2.3 min"
  },
  {
    id: "2",
    name: "Employee Onboarding",
    status: "active" as const,
    agents: ["HR Assistant", "IT Provisioner", "Email Responder"],
    executions: 89,
    successRate: 100,
    avgTime: "15 min"
  },
  {
    id: "3",
    name: "Vendor Approval Chain",
    status: "paused" as const,
    agents: ["Procurement Bot", "Finance Reviewer"],
    executions: 456,
    successRate: 94.2,
    avgTime: "45 min"
  },
];

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Workflows() {
  return (
    <MainLayout title="Workflows">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Design and manage multi-agent workflows</p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={statusStyles[workflow.status]}>
                      {workflow.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  {workflow.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agent Flow */}
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.agents.map((agent, index) => (
                    <div key={agent} className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {agent}
                      </Badge>
                      {index < workflow.agents.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{workflow.executions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Executions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-sm font-medium">{workflow.successRate}%</p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{workflow.avgTime}</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
