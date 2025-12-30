import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, AlertTriangle, Zap } from "lucide-react";

const costByDepartment = [
  { name: "Finance", cost: 12500 },
  { name: "HR", cost: 8200 },
  { name: "Procurement", cost: 15800 },
  { name: "IT", cost: 6400 },
  { name: "Operations", cost: 9100 },
];

const costByModel = [
  { name: "GPT-4", value: 45, color: "hsl(var(--primary))" },
  { name: "Claude 3", value: 28, color: "hsl(var(--success))" },
  { name: "GPT-3.5", value: 18, color: "hsl(var(--warning))" },
  { name: "Local LLM", value: 9, color: "hsl(var(--muted))" },
];

export default function Monitoring() {
  return (
    <MainLayout title="Monitoring & Costs">
      <div className="space-y-6">
        {/* Cost Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">This Month</span>
              </div>
              <p className="text-3xl font-bold text-foreground">₹52,000</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Budget used</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2 [&>div]:bg-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">Forecasted</span>
              </div>
              <p className="text-3xl font-bold text-foreground">₹78,000</p>
              <p className="text-sm text-warning mt-2">₹8,000 over budget</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-warning" />
                <span className="text-sm text-muted-foreground">Avg Cost/Task</span>
              </div>
              <p className="text-3xl font-bold text-foreground">₹2.10</p>
              <p className="text-sm text-success mt-2">-8% vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="text-sm text-muted-foreground">Cost Alerts</span>
              </div>
              <p className="text-3xl font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground mt-2">Procurement, IT</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Cost by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value) => [`₹${value}`, "Cost"]}
                    />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Cost by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByModel}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {costByModel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value) => [`${value}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {costByModel.map((model) => (
                  <div key={model.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                    <span className="text-sm text-muted-foreground">{model.name} ({model.value}%)</span>
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
