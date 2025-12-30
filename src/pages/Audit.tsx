import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Filter, CheckCircle, Clock, XCircle, Eye } from "lucide-react";

const auditLogs = [
  {
    id: "LOG-2024-4521",
    timestamp: "2024-12-30 14:32:15",
    agent: "Finance Reviewer",
    action: "Invoice Approved",
    details: "INV-2024-1247 for ₹8,500 auto-approved",
    user: "System",
    result: "success"
  },
  {
    id: "LOG-2024-4520",
    timestamp: "2024-12-30 14:28:03",
    agent: "Procurement Bot",
    action: "Human Escalation",
    details: "Payment ₹2,50,000 requires approval",
    user: "admin@company.com",
    result: "pending"
  },
  {
    id: "LOG-2024-4519",
    timestamp: "2024-12-30 14:15:42",
    agent: "HR Assistant",
    action: "Contract Update",
    details: "Employee contract terms modified",
    user: "hr@company.com",
    result: "success"
  },
  {
    id: "LOG-2024-4518",
    timestamp: "2024-12-30 14:02:18",
    agent: "Compliance Checker",
    action: "Policy Violation Flagged",
    details: "Vendor payment exceeds threshold",
    user: "System",
    result: "flagged"
  },
];

const resultStyles = {
  success: { icon: CheckCircle, class: "text-success" },
  pending: { icon: Clock, class: "text-warning" },
  flagged: { icon: XCircle, class: "text-destructive" },
};

export default function Audit() {
  return (
    <MainLayout title="Audit & Compliance">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-10 w-64 bg-card" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Immutable Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Log ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agent</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const ResultIcon = resultStyles[log.result as keyof typeof resultStyles]?.icon || CheckCircle;
                    const resultClass = resultStyles[log.result as keyof typeof resultStyles]?.class || "text-muted-foreground";
                    
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-foreground">{log.id}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{log.timestamp}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{log.agent}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{log.action}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{log.details}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{log.user}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`${resultClass} bg-transparent`}>
                            <ResultIcon className="w-3 h-3 mr-1" />
                            {log.result}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
