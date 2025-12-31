import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function PendingApprovalsCard() {
  const { pendingApprovals, loading, approveRequest, rejectRequest } = useApprovals();
  const { user } = useAuth();

  const handleApprove = async (id: string) => {
    await approveRequest(id);
  };

  const handleReject = async (id: string) => {
    await rejectRequest(id);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending approvals
            </p>
          ) : (
            pendingApprovals.slice(0, 5).map((approval) => (
              <div 
                key={approval.id}
                className="p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{approval.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {approval.description || "No description"}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    pending
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => handleReject(approval.id)}
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleApprove(approval.id)}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
