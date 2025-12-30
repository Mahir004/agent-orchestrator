import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp } from "lucide-react";

const topAgents = [
  { 
    name: "Finance Reviewer", 
    tasks: 234, 
    status: "running" as const, 
    roi: "+45%",
    model: "GPT-4"
  },
  { 
    name: "Procurement Bot", 
    tasks: 189, 
    status: "running" as const, 
    roi: "+32%",
    model: "Claude 3"
  },
  { 
    name: "HR Assistant", 
    tasks: 156, 
    status: "running" as const, 
    roi: "+28%",
    model: "GPT-4"
  },
  { 
    name: "Compliance Checker", 
    tasks: 134, 
    status: "paused" as const, 
    roi: "+22%",
    model: "Local LLM"
  },
  { 
    name: "Email Responder", 
    tasks: 98, 
    status: "running" as const, 
    roi: "+18%",
    model: "GPT-3.5"
  },
];

const statusStyles = {
  running: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export function TopAgentsTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Agents by Activity</CardTitle>
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topAgents.map((agent, index) => (
            <div 
              key={agent.name}
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
                  <p className="font-semibold text-foreground">{agent.tasks}</p>
                  <p className="text-xs text-success">{agent.roi}</p>
                </div>
                <Badge variant="outline" className={statusStyles[agent.status]}>
                  {agent.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
