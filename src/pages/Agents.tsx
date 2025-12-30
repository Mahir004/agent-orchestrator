import { MainLayout } from "@/components/layout/MainLayout";
import { AgentCard } from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    id: "1",
    name: "Finance Reviewer",
    role: "Invoice Processing & Validation",
    status: "running" as const,
    model: "GPT-4",
    tasksToday: 234,
    costPerTask: "₹2.50",
    autonomyLevel: "supervised" as const,
  },
  {
    id: "2",
    name: "Procurement Bot",
    role: "Vendor Management & Ordering",
    status: "running" as const,
    model: "Claude 3",
    tasksToday: 189,
    costPerTask: "₹3.20",
    autonomyLevel: "supervised" as const,
  },
  {
    id: "3",
    name: "HR Assistant",
    role: "Employee Queries & Onboarding",
    status: "running" as const,
    model: "GPT-4",
    tasksToday: 156,
    costPerTask: "₹1.80",
    autonomyLevel: "full" as const,
  },
  {
    id: "4",
    name: "Compliance Checker",
    role: "Policy Verification & Auditing",
    status: "paused" as const,
    model: "Local LLM",
    tasksToday: 134,
    costPerTask: "₹0.50",
    autonomyLevel: "manual" as const,
  },
  {
    id: "5",
    name: "Email Responder",
    role: "Customer Email Triage",
    status: "running" as const,
    model: "GPT-3.5",
    tasksToday: 98,
    costPerTask: "₹0.80",
    autonomyLevel: "full" as const,
  },
  {
    id: "6",
    name: "Document Analyzer",
    role: "Contract & Legal Review",
    status: "error" as const,
    model: "Claude 3",
    tasksToday: 45,
    costPerTask: "₹4.50",
    autonomyLevel: "supervised" as const,
  },
];

export default function Agents() {
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
            {agents.filter(a => a.status === "running").length} Running
          </Badge>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {agents.filter(a => a.status === "paused").length} Paused
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            {agents.filter(a => a.status === "error").length} Error
          </Badge>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
