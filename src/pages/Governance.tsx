import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Lock, Globe, Zap, Settings } from "lucide-react";

const policyRules = [
  {
    id: 1,
    name: "Autonomous Invoice Approval",
    description: "Allow agents to auto-approve invoices under ₹10,000",
    enabled: true,
    category: "financial"
  },
  {
    id: 2,
    name: "Vendor Data Modification Lock",
    description: "Prevent agents from modifying vendor master data",
    enabled: true,
    category: "data"
  },
  {
    id: 3,
    name: "Human-in-the-Loop for Contracts",
    description: "Require human approval for any contract modifications",
    enabled: true,
    category: "approval"
  },
  {
    id: 4,
    name: "Region-Based Data Access",
    description: "Restrict data access based on geographic regions",
    enabled: false,
    category: "compliance"
  },
  {
    id: 5,
    name: "Model Usage Restrictions",
    description: "Limit certain models for sensitive data processing",
    enabled: true,
    category: "security"
  },
];

const killSwitches = [
  { name: "Finance Agents", status: "active", agents: 5 },
  { name: "HR Agents", status: "active", agents: 3 },
  { name: "All Agents", status: "active", agents: 24 },
];

export default function Governance() {
  return (
    <MainLayout title="Governance & Safety">
      <div className="space-y-6">
        <p className="text-muted-foreground">Configure approval thresholds, safety boundaries, and compliance policies</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kill Switches */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Kill Switches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {killSwitches.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.agents} agents</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Emergency Stop
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Policy Rules */}
          <Card className="col-span-2 bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Policy Rules
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {policyRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {rule.category === "financial" && <Zap className="w-5 h-5 text-warning" />}
                      {rule.category === "data" && <Lock className="w-5 h-5 text-destructive" />}
                      {rule.category === "approval" && <Shield className="w-5 h-5 text-primary" />}
                      {rule.category === "compliance" && <Globe className="w-5 h-5 text-success" />}
                      {rule.category === "security" && <Lock className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <Switch checked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
