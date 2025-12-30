import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle, Plus, Settings, Database, Mail, Cloud, CreditCard } from "lucide-react";

const integrations = [
  {
    name: "SAP ERP",
    description: "Enterprise resource planning integration",
    icon: Database,
    status: "connected",
    lastSync: "5 min ago"
  },
  {
    name: "Microsoft 365",
    description: "Email and calendar integration",
    icon: Mail,
    status: "connected",
    lastSync: "2 min ago"
  },
  {
    name: "AWS Services",
    description: "Cloud infrastructure and storage",
    icon: Cloud,
    status: "connected",
    lastSync: "Just now"
  },
  {
    name: "Stripe",
    description: "Payment processing integration",
    icon: CreditCard,
    status: "disconnected",
    lastSync: null
  },
];

const statusStyles = {
  connected: "bg-success/10 text-success border-success/20",
  disconnected: "bg-muted text-muted-foreground",
};

export default function Integrations() {
  return (
    <MainLayout title="Integrations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Connect external services and APIs to your agents</p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Integration
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.name} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <integration.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusStyles[integration.status as keyof typeof statusStyles]}>
                      {integration.status === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {integration.status}
                    </Badge>
                    {integration.lastSync && (
                      <span className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
