import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const statusStyles = {
  running: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  stopped: "bg-muted text-muted-foreground",
};

export function TopAgentsTable() {
  const { agents, loading: agentsLoading } = useAgents();
  const { getTaskCountByAgent, loading: tasksLoading } = useTasks();

  const loading = agentsLoading || tasksLoading;

  // Sort agents by task count
  const sortedAgents = [...agents]
    .map((agent) => ({
      ...agent,
      taskCount: getTaskCountByAgent(agent.id),
    }))
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Agents by Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Agents by Activity</CardTitle>
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No agents yet
            </p>
          ) : (
            sortedAgents.map((agent) => (
              <Link 
                key={agent.id}
                to={`/agents/${agent.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{agent.taskCount}</p>
                    <p className="text-xs text-muted-foreground">tasks today</p>
                  </div>
                  <Badge variant="outline" className={statusStyles[agent.status]}>
                    {agent.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
