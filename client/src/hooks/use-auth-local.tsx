import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { localDB } from "@/lib/localDB";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  year: number;
  branch: string;
  isAdmin: boolean;
  createdAt: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  year: number;
  branch: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user on mount
  useEffect(() => {
    const currentUser = localDB.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const user = await localDB.loginUser(data.username, data.password);
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const user = await localDB.createUser({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        year: data.year,
        branch: data.branch,
        isAdmin: false, // Regular users are not admin by default
      });
      
      // Auto-login after registration
      await localDB.loginUser(data.username, data.password);
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Registration successful",
        description: `Welcome to CampusVault, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localDB.logout();
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}