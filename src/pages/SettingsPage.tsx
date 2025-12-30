import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Palette, Globe, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <MainLayout title="Settings">
      <div className="space-y-6 max-w-4xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Organization Name</p>
                <p className="text-sm text-muted-foreground">Your company or team name</p>
              </div>
              <Input defaultValue="Acme Corporation" className="w-64 bg-background" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Time Zone</p>
                <p className="text-sm text-muted-foreground">Set your local timezone</p>
              </div>
              <Input defaultValue="Asia/Kolkata (IST)" className="w-64 bg-background" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Agent Failures</p>
                <p className="text-sm text-muted-foreground">Get notified when agents fail</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Pending Approvals</p>
                <p className="text-sm text-muted-foreground">Notifications for items needing review</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Cost Alerts</p>
                <p className="text-sm text-muted-foreground">Alert when budget thresholds are reached</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-foreground">Production API Key</p>
                <p className="text-sm font-mono text-muted-foreground">sk-prod-****-****-****-1234</p>
              </div>
              <Button variant="outline">Regenerate</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-foreground">Development API Key</p>
                <p className="text-sm font-mono text-muted-foreground">sk-dev-****-****-****-5678</p>
              </div>
              <Button variant="outline">Regenerate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
