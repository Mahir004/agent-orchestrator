import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  Shield,
  Clock,
  DollarSign,
  Zap,
  Database,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

const agentData = {
  id: "1",
  name: "Finance Reviewer",
  role: "Invoice Processing & Validation",
  description: "Automatically processes incoming invoices, validates against purchase orders, flags discrepancies, and routes for approval based on configurable thresholds.",
  status: "running" as const,
  model: "GPT-4",
  owner: "Finance Team",
  deployedAt: "Production",
  autonomyLevel: "supervised" as const,
  createdAt: "Dec 15, 2024",
  lastActive: "2 minutes ago",
};

const capabilities = [
  { name: "Invoice OCR", type: "tool" },
  { name: "PO Matching", type: "tool" },
  { name: "Vendor Database", type: "data" },
  { name: "ERP System", type: "api" },
  { name: "Email Notifications", type: "api" },
];

const boundaries = [
  { rule: "Approve payments up to ₹10,000", status: "active" },
  { rule: "Cannot modify vendor master data", status: "active" },
  { rule: "Requires human approval for new vendors", status: "active" },
  { rule: "Cannot access employee salary data", status: "active" },
];

const executionHistory = [
  { 
    id: 1, 
    action: "Approved invoice INV-2024-1247", 
    result: "success", 
    time: "2 min ago",
    details: "Amount: ₹8,500 • Vendor: Tech Solutions Ltd"
  },
  { 
    id: 2, 
    action: "Flagged invoice INV-2024-1246 for review", 
    result: "pending", 
    time: "15 min ago",
    details: "Amount mismatch detected: Expected ₹12,000, Found ₹15,000"
  },
  { 
    id: 3, 
    action: "Processed invoice INV-2024-1245", 
    result: "success", 
    time: "32 min ago",
    details: "Amount: ₹3,200 • Vendor: Office Supplies Co"
  },
  { 
    id: 4, 
    action: "Rejected duplicate invoice INV-2024-1244", 
    result: "rejected", 
    time: "1 hour ago",
    details: "Duplicate of INV-2024-1198"
  },
];

const resultIcons = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  pending: <Clock className="w-4 h-4 text-warning" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
  error: <AlertTriangle className="w-4 h-4 text-destructive" />,
};

export default function AgentDetail() {
  const { id } = useParams();

  return (
    <MainLayout title="Agent Details">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Link to="/agents">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </Button>
        </Link>

        {/* Agent Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{agentData.name}</h1>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success status-pulse mr-1.5" />
                  Running
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{agentData.role}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Owner: {agentData.owner}</span>
                <span>•</span>
                <span>Last active: {agentData.lastActive}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </Button>
            <Button className="gap-2">
              <Activity className="w-4 h-4" />
              View Logs
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="boundaries">Decision Boundaries</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
            <TabsTrigger value="costs">Cost Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{agentData.description}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      <span>Model</span>
                    </div>
                    <span className="font-medium">{agentData.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Autonomy Level</span>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      {agentData.autonomyLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>Deployed At</span>
                    </div>
                    <span className="font-medium">{agentData.deployedAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                    <span className="font-medium">{agentData.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Tools & Data Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capabilities.map((cap) => (
                    <div key={cap.name} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                      {cap.type === "tool" && <Zap className="w-5 h-5 text-primary" />}
                      {cap.type === "data" && <Database className="w-5 h-5 text-success" />}
                      {cap.type === "api" && <Globe className="w-5 h-5 text-warning" />}
                      <div>
                        <p className="font-medium text-foreground">{cap.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cap.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boundaries" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Decision Boundaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {boundaries.map((boundary, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-foreground">{boundary.rule}</span>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {boundary.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executionHistory.map((execution) => (
                    <div key={execution.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {resultIcons[execution.result as keyof typeof resultIcons]}
                          <div>
                            <p className="font-medium text-foreground">{execution.action}</p>
                            <p className="text-sm text-muted-foreground mt-1">{execution.details}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{execution.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Avg Cost/Task</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹2.50</p>
                  <p className="text-sm text-success mt-1">-12% vs last week</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Total Spend (30d)</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">₹18,450</p>
                  <p className="text-sm text-muted-foreground mt-1">7,380 tasks completed</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-warning" />
                    <span className="text-sm text-muted-foreground">Token Usage</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">2.4M</p>
                  <p className="text-sm text-muted-foreground mt-1">Avg 325 tokens/task</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
