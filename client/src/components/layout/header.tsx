import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
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
    <header className="bg-card border-b border-border px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary" data-testid="link-header-logo">
            <i className="fas fa-lightbulb" />
            <span>ResourceHub</span>
          </Link>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground ml-2">
            <i className="fas fa-home" />
            <span>Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <div className="flex items-center space-x-3">
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
