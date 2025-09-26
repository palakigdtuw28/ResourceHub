import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FileText, Upload, User, LogOut } from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-6">
      <nav className="space-y-2">
        <Link href="/">
          <Button 
            variant={isActive("/") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="nav-dashboard"
          >
            <Home className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button 
            variant={isActive("/profile") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="nav-profile"
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </Button>
        </Link>
        
        <Link href="/upload">
          <Button 
            variant={isActive("/upload") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="nav-upload"
          >
            <Upload className="mr-3 h-4 w-4" />
            Upload Resource
          </Button>
        </Link>
        
        <Button 
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          data-testid="nav-logout"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </nav>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-muted rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Downloads</span>
              <span className="text-lg font-semibold text-accent" data-testid="stat-downloads">
                {stats?.downloads || 0}
              </span>
            </div>
          </div>
          <div className="bg-muted rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uploads</span>
              <span className="text-lg font-semibold text-primary" data-testid="stat-uploads">
                {stats?.uploads || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
