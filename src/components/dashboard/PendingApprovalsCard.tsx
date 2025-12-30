import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const pendingApprovals = [
  {
    id: 1,
    agent: "Procurement Bot",
    action: "Approve vendor payment of ₹2,50,000",
    priority: "high" as const,
    timeAgo: "5 min ago"
  },
  {
    id: 2,
    agent: "HR Assistant",
    action: "Update employee contract terms",
    priority: "medium" as const,
    timeAgo: "12 min ago"
  },
  {
    id: 3,
    agent: "Finance Reviewer",
    action: "Flag transaction for compliance review",
    priority: "high" as const,
    timeAgo: "23 min ago"
  },
];

const priorityStyles = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground",
};

export function PendingApprovalsCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
          <Badge variant="secondary" className="bg-destructive/10 text-destructive">
            {pendingApprovals.length}
          </Badge>
        </div>
        <AlertTriangle className="w-5 h-5 text-warning" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div 
              key={approval.id}
              className="p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{approval.agent}</p>
                  <p className="text-sm text-muted-foreground mt-1">{approval.action}</p>
                </div>
                <Badge variant="outline" className={priorityStyles[approval.priority]}>
                  {approval.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {approval.timeAgo}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    Reject
                  </Button>
                  <Button size="sm" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
