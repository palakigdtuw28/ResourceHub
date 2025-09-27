import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "wouter";
import { MobileMenu } from "./mobile-menu";

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
    <header className="bg-card border-b border-border px-3 md:px-4 py-3 md:py-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 md:space-x-6 flex-1 min-w-0">
          <MobileMenu />
          <Link href="/" className="flex items-center space-x-2 text-lg md:text-2xl font-bold text-primary" data-testid="link-header-logo">
            <i className="fas fa-lightbulb flex-shrink-0 text-primary" />
            <span className="text-lg md:text-2xl">ResourceHub</span>
          </Link>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground ml-2">
            <i className="fas fa-home" />
            <span>Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-4 flex-shrink-0">
          {/* User Menu */}
          <div className="flex items-center space-x-1 md:space-x-3">
            <Link 
              href="/profile" 
              className="flex items-center space-x-1 md:space-x-2 cursor-pointer hover:bg-muted rounded-md p-1 md:p-2 transition-colors"
              data-testid="link-header-profile"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-xs md:text-sm flex-shrink-0">
                <span data-testid="text-header-user-initials">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </span>
              </div>
              <span className="hidden sm:block font-medium text-sm md:text-base truncate max-w-[100px] md:max-w-none" data-testid="text-header-username">
                {user?.fullName || 'User'}
              </span>
              <i className="hidden md:inline fas fa-chevron-down text-xs flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
