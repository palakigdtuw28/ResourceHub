import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Home, Upload, User, LogOut } from "lucide-react";

export function MobileMenu() {
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-left">
              <div className="flex items-center space-x-2">
                <i className="fas fa-lightbulb text-primary" />
                <span>ResourceHub</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <nav className="flex flex-col space-y-2 mt-6">
            <Link href="/" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/profile" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
            
            {user?.isAdmin && (
              <Link href="/upload" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resources
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
          
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm text-muted-foreground">
              <p>Logged in as</p>
              <p className="font-medium text-foreground">{user?.fullName}</p>
              <p className="text-xs">{user?.email}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}