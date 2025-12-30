import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Server, Database, Cpu, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const healthMetrics: { name: string; value: number; icon: typeof Server; status: "healthy" | "warning" | "error" }[] = [
  { name: "API Gateway", value: 99.8, icon: Wifi, status: "healthy" },
  { name: "Agent Runtime", value: 97.2, icon: Cpu, status: "healthy" },
  { name: "Database", value: 99.9, icon: Database, status: "healthy" },
  { name: "Model Services", value: 94.5, icon: Server, status: "warning" },
];

const statusColors = {
  healthy: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

export function SystemHealthCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {healthMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={cn("w-4 h-4", statusColors[metric.status])} />
                  <span className="text-sm font-medium text-foreground">{metric.name}</span>
                </div>
                <span className={cn("text-sm font-semibold", statusColors[metric.status])}>
                  {metric.value}%
                </span>
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
