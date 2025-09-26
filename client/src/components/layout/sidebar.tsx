import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FileText, Upload, User, LogOut } from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();



  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:block w-64 bg-card border-r border-border min-h-screen p-6 flex-col">
      <nav className="space-y-2 flex-1">
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
        
        {user?.isAdmin && (
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
        )}
        
        {/* Credits */}
        <div style={{ paddingTop: '12px', paddingBottom: '8px', borderTop: '1px solid #e5e5e5', marginTop: '12px' }}>
          <p style={{ fontSize: '11px', color: '#666', textAlign: 'left', margin: 0 }}>
            made by @palakigdtuw28
          </p>
        </div>
        
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
    </aside>
  );
}
