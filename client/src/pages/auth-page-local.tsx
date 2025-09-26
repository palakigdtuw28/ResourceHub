import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-local";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  year: number;
  branch: string;
}

export default function AuthPageLocal() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      year: 1,
      branch: "CSE",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      setLocation("/");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Redirect if already logged in
  if (user) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2" data-testid="text-app-title">
              ResourceHub Local
            </h1>
            <p className="text-muted-foreground">Your Offline Resource Hub</p>
            <p className="text-xs text-muted-foreground mt-2">No server required - all data stored locally!</p>
          </div>
          
          <div className="mb-6">
            <div className="flex border-b border-border">
              <button 
                className={`tab-btn flex-1 py-2 px-4 text-center font-medium transition-colors border-b-2 ${
                  activeTab === "login" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("login")}
                data-testid="button-login-tab"
              >
                Login
              </button>
              <button 
                className={`tab-btn flex-1 py-2 px-4 text-center font-medium transition-colors border-b-2 ${
                  activeTab === "register" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("register")}
                data-testid="button-register-tab"
              >
                Register
              </button>
            </div>
          </div>

          {activeTab === "login" ? (
            <div>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="form-login">
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="admin"
                    {...loginForm.register("username")}
                    data-testid="input-login-username"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="any password"
                    {...loginForm.register("password")}
                    data-testid="input-login-password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo: Use "admin" as username, any password works
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4" data-testid="form-register">
              <div>
                <Label htmlFor="register-fullName">Full Name</Label>
                <Input
                  id="register-fullName"
                  type="text"
                  placeholder="John Doe"
                  {...registerForm.register("fullName")}
                  data-testid="input-register-fullname"
                />
              </div>
              <div>
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="your.username"
                  {...registerForm.register("username")}
                  data-testid="input-register-username"
                />
              </div>
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your.email@college.edu"
                  {...registerForm.register("email")}
                  data-testid="input-register-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="register-year">Year</Label>
                  <Select onValueChange={(value) => registerForm.setValue("year", parseInt(value))}>
                    <SelectTrigger data-testid="select-register-year">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="register-branch">Branch</Label>
                  <Select onValueChange={(value) => registerForm.setValue("branch", value)}>
                    <SelectTrigger data-testid="select-register-branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">Computer Science & Engineering (CSE)</SelectItem>
                      <SelectItem value="AIML">Artificial Intelligence & Machine Learning (AIML)</SelectItem>
                      <SelectItem value="ECE">Electronics & Communication Engineering (ECE)</SelectItem>
                      <SelectItem value="ECE AI">ECE with AI Specialization (ECE AI)</SelectItem>
                      <SelectItem value="MAE">Mechanical & Automation Engineering (MAE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                  data-testid="input-register-password"
                />
              </div>
              <div>
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <Input
                  id="register-confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("confirmPassword")}
                  data-testid="input-register-confirm-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
                data-testid="button-register-submit"
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">🚀 Local Mode Features:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• No server required - runs entirely in your browser</li>
              <li>• All data stored in browser's local storage</li>
              <li>• File uploads work with base64 encoding</li>
              <li>• Perfect for offline usage and demos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}