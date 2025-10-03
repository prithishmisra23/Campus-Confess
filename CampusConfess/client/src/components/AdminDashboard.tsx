import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Bot,
  BarChart3,
  Clock
} from "lucide-react";

interface AdminDashboardProps {
  reports: any[];
  isLoading: boolean;
  filter: string;
}

export default function AdminDashboard({ reports, isLoading, filter }: AdminDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/reports/${reportId}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({
        title: "Report Updated",
        description: "Report status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report status.",
        variant: "destructive",
      });
    },
  });

  const deleteConfessionMutation = useMutation({
    mutationFn: async (confessionId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/confessions/${confessionId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
      toast({
        title: "Confession Deleted",
        description: "The confession has been removed from the platform.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete confession.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateReport = (reportId: string, status: string) => {
    updateReportMutation.mutate({ reportId, status });
  };

  const handleDeleteConfession = (confessionId: string) => {
    if (confirm("Are you sure you want to delete this confession? This action cannot be undone.")) {
      deleteConfessionMutation.mutate(confessionId);
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case "pending": return "border-red-500";
      case "reviewed": return "border-yellow-500";
      case "dismissed": return "border-green-500";
      default: return "border-border";
    }
  };

  const getPriorityBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-500">HIGH PRIORITY</Badge>;
      case "reviewed":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">REVIEWED</Badge>;
      case "dismissed":
        return <Badge variant="outline" className="bg-green-500/20 text-green-500">DISMISSED</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glassmorphism">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="glassmorphism">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">All Clear!</h3>
          <p className="text-muted-foreground">
            No reports to review at the moment. Great job keeping the community safe!
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter((report: any) => report.status === filter);

  return (
    <div className="space-y-6">
      {filteredReports.map((report: any, index: number) => (
        <Card key={report.id} className={`glassmorphism border-l-4 ${getPriorityColor(report.status)}`} data-testid={`report-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  {getPriorityBadge(report.status)}
                  <Badge variant="outline" className="bg-secondary/20 text-secondary">
                    {report.reason || "User Reported"}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Report ID:</span>
                  <code className="px-2 py-1 bg-card rounded text-xs" data-testid="text-report-id">
                    {report.id.slice(0, 8)}...
                  </code>
                  <span className="text-muted-foreground">|</span>
                  <span>Confession: {report.confessionId?.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {report.description && (
              <div className="mb-4 p-4 bg-card rounded-lg">
                <h4 className="font-semibold mb-2">Reported Content</h4>
                <p className="text-foreground" data-testid="text-reported-content">
                  {report.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="font-semibold" data-testid="text-report-reason">
                      {report.reason || "Inappropriate Content"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold capitalize" data-testid="text-report-status">
                      {report.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reporter:</span>
                    <span className="font-semibold">Anonymous</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-secondary flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  System Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-semibold">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-semibold">Content Report</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto-flagged:</span>
                    <span className="font-semibold">No</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleDeleteConfession(report.confessionId)}
                disabled={deleteConfessionMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:shadow-lg transition-all"
                data-testid="button-delete-confession"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </Button>
              
              <Button
                onClick={() => handleUpdateReport(report.id, "reviewed")}
                disabled={updateReportMutation.isPending || report.status === "reviewed"}
                variant="outline"
                className="bg-accent/20 text-accent hover:bg-accent/30 transition-all border-accent/30"
                data-testid="button-warn-user"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Reviewed
              </Button>
              
              <Button
                onClick={() => handleUpdateReport(report.id, "dismissed")}
                disabled={updateReportMutation.isPending || report.status === "dismissed"}
                variant="outline"
                className="bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-all"
                data-testid="button-dismiss-report"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Dismiss Report
              </Button>
              
              <Button
                variant="outline"
                className="glassmorphism text-foreground hover:border-primary transition-all"
                data-testid="button-view-context"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Context
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
