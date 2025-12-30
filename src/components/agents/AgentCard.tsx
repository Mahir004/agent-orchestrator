import { Bot, MoreHorizontal, Activity, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface AgentCardProps {
  id: string;
  name: string;
  role: string;
  status: "running" | "paused" | "error";
  model: string;
  tasksToday: number;
  costPerTask: string;
  autonomyLevel: "full" | "supervised" | "manual";
}

const statusStyles = {
  running: "bg-success/10 text-success border-success/20 glow-success",
  paused: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20 glow-destructive",
};

const autonomyStyles = {
  full: "bg-primary/10 text-primary",
  supervised: "bg-warning/10 text-warning",
  manual: "bg-muted text-muted-foreground",
};

export function AgentCard({
  id,
  name,
  role,
  status,
  model,
  tasksToday,
  costPerTask,
  autonomyLevel
}: AgentCardProps) {
  return (
    <Link to={`/agents/${id}`}>
      <Card className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
              <DropdownMenuItem>View Logs</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stop Agent</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className={cn(statusStyles[status])}>
              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status === "running" && "bg-success status-pulse", status === "paused" && "bg-warning", status === "error" && "bg-destructive")} />
              {status}
            </Badge>
            <Badge variant="outline" className={autonomyStyles[autonomyLevel]}>
              {autonomyLevel}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Model</span>
              </div>
              <span className="font-medium text-foreground">{model}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>Tasks Today</span>
              </div>
              <span className="font-medium text-foreground">{tasksToday}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Cost/Task</span>
              </div>
              <span className="font-medium text-foreground">{costPerTask}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
