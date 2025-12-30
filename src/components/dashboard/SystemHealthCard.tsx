import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Server, Database, Cpu, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { Skeleton } from "@/components/ui/skeleton";

const defaultMetrics = [
  { component: "API Gateway", icon: Wifi },
  { component: "Agent Runtime", icon: Cpu },
  { component: "Database", icon: Database },
  { component: "Model Services", icon: Server },
];

const statusColors = {
  healthy: "text-success",
  warning: "text-warning",
  error: "text-destructive",
  degraded: "text-warning",
};

const getStatusFromErrorRate = (errorRate: number | null): "healthy" | "warning" | "error" => {
  if (errorRate === null) return "healthy";
  if (errorRate < 1) return "healthy";
  if (errorRate < 5) return "warning";
  return "error";
};

export function SystemHealthCard() {
  const { healthMetrics, loading } = useSystemHealth();

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Merge database metrics with defaults
  const displayMetrics = defaultMetrics.map((defaultMetric) => {
    const dbMetric = healthMetrics.find(
      (m) => m.component.toLowerCase() === defaultMetric.component.toLowerCase()
    );
    const errorRate = dbMetric?.error_rate ?? 0;
    const uptime = 100 - (errorRate ?? 0);
    const status = dbMetric?.status as "healthy" | "warning" | "error" | undefined 
      ?? getStatusFromErrorRate(errorRate);

    return {
      name: defaultMetric.component,
      icon: defaultMetric.icon,
      value: Math.max(0, Math.min(100, uptime)),
      status,
      latency: dbMetric?.latency_ms,
    };
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {displayMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={cn("w-4 h-4", statusColors[metric.status])} />
                  <span className="text-sm font-medium text-foreground">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {metric.latency && (
                    <span className="text-xs text-muted-foreground">{metric.latency}ms</span>
                  )}
                  <span className={cn("text-sm font-semibold", statusColors[metric.status])}>
                    {metric.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={metric.value} 
                className={cn(
                  "h-2",
                  metric.status === "healthy" && "[&>div]:bg-success",
                  metric.status === "warning" && "[&>div]:bg-warning",
                  metric.status === "error" && "[&>div]:bg-destructive"
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
