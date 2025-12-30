import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Lock, Globe, Zap, Settings } from "lucide-react";
import { usePolicyRules } from "@/hooks/usePolicyRules";
import { useKillSwitches } from "@/hooks/useKillSwitches";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<string, typeof Zap> = {
  financial: Zap,
  data: Lock,
  approval: Shield,
  compliance: Globe,
  security: Lock,
};

export default function Governance() {
  const { policyRules, loading: policiesLoading, toggleRule } = usePolicyRules();
  const { killSwitches, loading: killSwitchesLoading, activateKillSwitch } = useKillSwitches();
  const { user } = useAuth();

  const loading = policiesLoading || killSwitchesLoading;

  const handleToggleRule = async (id: string, currentEnabled: boolean) => {
    await toggleRule(id, !currentEnabled);
  };

  const handleEmergencyStop = async (id: string) => {
    if (user) {
      await activateKillSwitch(id, user.id);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Governance & Safety">
        <div className="space-y-6">
          <p className="text-muted-foreground">Configure approval thresholds, safety boundaries, and compliance policies</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="col-span-2 h-64" />
          </div>
        </div>
      </MainLayout>
    );
  }

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
              {killSwitches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No kill switches configured</p>
              ) : (
                killSwitches.map((item) => {
                  const targetIds = (item.target_ids as string[] | null) || [];
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{targetIds.length} agents</p>
                      </div>
                      <Button 
                        variant={item.is_active ? "outline" : "destructive"} 
                        size="sm"
                        onClick={() => handleEmergencyStop(item.id)}
                      >
                        {item.is_active ? "Active" : "Emergency Stop"}
                      </Button>
                    </div>
                  );
                })
              )}
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
              {policyRules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No policies configured</p>
              ) : (
                policyRules.map((rule) => {
                  const IconComponent = categoryIcons[rule.category] || Shield;
                  return (
                    <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={rule.enabled} 
                        onCheckedChange={() => handleToggleRule(rule.id, rule.enabled)}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
