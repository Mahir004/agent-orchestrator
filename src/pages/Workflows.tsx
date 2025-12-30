import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, ArrowRight, GitBranch, Clock, CheckCircle } from "lucide-react";
import { useWorkflows } from "@/hooks/useWorkflows";
import { Skeleton } from "@/components/ui/skeleton";

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Workflows() {
  const { workflows, loading, toggleWorkflowStatus } = useWorkflows();

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    await toggleWorkflowStatus(id, currentStatus);
  };

  if (loading) {
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

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

        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No workflows yet. Create your first workflow!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => {
              const nodes = (workflow.nodes as { name?: string }[] | null) || [];
              const agentNames = nodes
                .map((n) => n.name || "Agent")
                .slice(0, 3);
              const config = (workflow.config as { executions?: number; successRate?: number; avgTime?: string } | null) || {};

              return (
                <Card key={workflow.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={statusStyles[workflow.status as keyof typeof statusStyles] || statusStyles.draft}
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleToggleStatus(workflow.id, workflow.status)}
                    >
                      {workflow.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Agent Flow */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {agentNames.length > 0 ? (
                        agentNames.map((agent, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {agent}
                            </Badge>
                            {index < agentNames.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No agents configured</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{(config.executions || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Executions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-sm font-medium">{config.successRate || 0}%</p>
                          <p className="text-xs text-muted-foreground">Success</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{config.avgTime || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
