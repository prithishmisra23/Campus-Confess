import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/NavigationBar";
import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Shield, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>("all");

  // Fetch reports for admin
  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reports", filter !== "all" ? filter : undefined],
    enabled: !!user?.isAdmin,
  });

  // Redirect if not admin
  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen">
        <NavigationBar />
        <div className="container mx-auto px-4 py-16">
          <Card className="glassmorphism max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access the admin panel.
              </p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-primary to-accent text-white"
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <NavigationBar />
        <div className="container mx-auto px-4 py-16">
          <Card className="glassmorphism max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Admin Login Required</h1>
              <p className="text-muted-foreground mb-6">
                Please log in with your admin account to access the dashboard.
              </p>
              <Button 
                onClick={() => setLocation("/")}
                className="bg-gradient-to-r from-primary to-accent text-white"
                data-testid="button-go-login"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavigationBar />
      
      {/* Admin Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="glassmorphism rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-destructive to-accent flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage and moderate community content
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
              <div className="text-3xl font-bold text-destructive" data-testid="text-pending-count">
                {reports?.filter((r: any) => r.status === 'pending').length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" 
              ? "bg-destructive text-destructive-foreground" 
              : "glassmorphism hover:border-destructive"
            }
            data-testid="filter-all"
          >
            All Flagged ({reports?.length || 0})
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
            className={filter === "pending" 
              ? "bg-destructive text-destructive-foreground" 
              : "glassmorphism hover:border-destructive"
            }
            data-testid="filter-pending"
          >
            High Priority ({reports?.filter((r: any) => r.status === 'pending').length || 0})
          </Button>
          <Button
            onClick={() => setFilter("reviewed")}
            variant={filter === "reviewed" ? "default" : "outline"}
            className={filter === "reviewed" 
              ? "bg-destructive text-destructive-foreground" 
              : "glassmorphism hover:border-destructive"
            }
            data-testid="filter-reviewed"
          >
            Reviewed ({reports?.filter((r: any) => r.status === 'reviewed').length || 0})
          </Button>
        </div>

        {/* Admin Dashboard Component */}
        <AdminDashboard reports={reports} isLoading={isLoading} filter={filter} />
      </div>
    </div>
  );
}
