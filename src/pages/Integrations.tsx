import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Settings, Database, Mail, Cloud, CreditCard, Plug } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const statusStyles = {
  connected: "bg-success/10 text-success border-success/20",
  disconnected: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcons: Record<string, typeof Database> = {
  database: Database,
  email: Mail,
  cloud: Cloud,
  payment: CreditCard,
  erp: Database,
  default: Plug,
};

export default function Integrations() {
  const { integrations, loading } = useIntegrations();

  if (loading) {
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

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

        {integrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No integrations yet. Add your first integration!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => {
              const IconComponent = typeIcons[integration.type] || typeIcons.default;
              const status = integration.status as keyof typeof statusStyles;

              return (
                <Card key={integration.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} integration
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusStyles[status] || statusStyles.disconnected}>
                          {status === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {integration.status}
                        </Badge>
                        {integration.last_sync_at && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Configure
                      </Button>
                    </div>
                    {integration.error_message && (
                      <p className="text-sm text-destructive mt-2">{integration.error_message}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
