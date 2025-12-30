import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Shield, Settings } from "lucide-react";

const users = [
  {
    name: "Rahul Sharma",
    email: "rahul@company.com",
    role: "CTO",
    permissions: ["Full Access", "Admin"],
    status: "active"
  },
  {
    name: "Priya Patel",
    email: "priya@company.com",
    role: "AI Engineer",
    permissions: ["Agent Builder", "Monitoring"],
    status: "active"
  },
  {
    name: "Amit Kumar",
    email: "amit@company.com",
    role: "Ops Manager",
    permissions: ["Workflows", "Approvals"],
    status: "active"
  },
  {
    name: "Sneha Gupta",
    email: "sneha@company.com",
    role: "Compliance Officer",
    permissions: ["Audit", "Governance"],
    status: "active"
  },
];

const roles = [
  { name: "Admin", users: 2, color: "bg-destructive/10 text-destructive" },
  { name: "AI Engineer", users: 5, color: "bg-primary/10 text-primary" },
  { name: "Ops Manager", users: 8, color: "bg-warning/10 text-warning" },
  { name: "Viewer", users: 15, color: "bg-muted text-muted-foreground" },
];

export default function UsersRoles() {
  return (
    <MainLayout title="Users & Roles">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Overview */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Roles
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <Badge className={role.color}>{role.name}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{role.users} users</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="col-span-2 bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Members
              </CardTitle>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Invite User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">{user.role}</Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
