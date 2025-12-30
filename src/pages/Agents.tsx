import { MainLayout } from "@/components/layout/MainLayout";
import { AgentCard } from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAgents } from "@/hooks/useAgents";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Agents() {
  const { agents, loading: agentsLoading } = useAgents();
  const { getTaskCountByAgent, loading: tasksLoading } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");

  const loading = agentsLoading || tasksLoading;

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningCount = agents.filter((a) => a.status === "running").length;
  const pausedCount = agents.filter((a) => a.status === "paused").length;
  const errorCount = agents.filter((a) => a.status === "error").length;

  return (
    <MainLayout title="Agent Registry">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search agents..." 
                className="pl-10 w-64 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="rounded-none">
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-none border-l border-border">
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {runningCount} Running
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {pausedCount} Paused
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            {errorCount} Error
          </Badge>
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No agents match your search" : "No agents yet. Create your first agent!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                id={agent.id}
                name={agent.name}
                role={agent.role}
                status={agent.status}
                model={agent.model}
                tasksToday={getTaskCountByAgent(agent.id)}
                costPerTask={`₹${(agent.cost_per_task ?? 0).toFixed(2)}`}
                autonomyLevel={agent.autonomy_level}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
