import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, User } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-primary" data-testid="link-header-logo">
            FreeSource.ig
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <i className="fas fa-home" />
            <span>Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search resources..."
              className="pl-10 pr-4 py-2 w-64"
              data-testid="input-header-search"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative p-2" data-testid="button-header-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <Link 
              href="/profile" 
              className="flex items-center space-x-2 cursor-pointer hover:bg-muted rounded-md p-2 transition-colors"
              data-testid="link-header-profile"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                <span data-testid="text-header-user-initials">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </span>
              </div>
              <span className="font-medium" data-testid="text-header-username">
                {user?.fullName || 'User'}
              </span>
              <i className="fas fa-chevron-down text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
