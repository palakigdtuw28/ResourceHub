import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      year: 1,
      branch: "Computer Science",
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
    try {
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      setLocation("/");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2" data-testid="text-app-title">
              FreeSource.ig
            </h1>
            <p className="text-muted-foreground">Your College Resource Hub</p>
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
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4" data-testid="form-login">
              <div>
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="your.username"
                  {...loginForm.register("username")}
                  data-testid="input-login-username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-login-username">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  data-testid="input-login-password"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-login-password">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
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
                {registerForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-register-fullname">
                    {registerForm.formState.errors.fullName.message}
                  </p>
                )}
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
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-register-username">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
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
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-register-email">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
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
                  {registerForm.formState.errors.year && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-register-year">
                      {registerForm.formState.errors.year.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="register-branch">Branch</Label>
                  <Select onValueChange={(value) => registerForm.setValue("branch", value)}>
                    <SelectTrigger data-testid="select-register-branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                  {registerForm.formState.errors.branch && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-register-branch">
                      {registerForm.formState.errors.branch.message}
                    </p>
                  )}
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
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-register-password">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
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
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1" data-testid="error-register-confirm-password">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
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
        </CardContent>
      </Card>
    </div>
  );
}
