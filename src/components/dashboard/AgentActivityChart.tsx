import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "00:00", tasks: 45, cost: 12 },
  { time: "04:00", tasks: 23, cost: 8 },
  { time: "08:00", tasks: 78, cost: 24 },
  { time: "12:00", tasks: 156, cost: 45 },
  { time: "16:00", tasks: 134, cost: 38 },
  { time: "20:00", tasks: 89, cost: 28 },
  { time: "Now", tasks: 67, cost: 19 },
];

export function AgentActivityChart() {
  return (
    <Card className="col-span-2 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Agent Activity (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorTasks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
