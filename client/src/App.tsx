import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/admin-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import UploadPage from "@/pages/upload-page";
import YearPage from "@/pages/year-page";
import SemesterPage from "@/pages/semester-page";
import SubjectPage from "@/pages/subject-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/year/:year" component={YearPage} />
      <ProtectedRoute path="/year/:year/semester/:semester" component={SemesterPage} />
      <ProtectedRoute path="/subject/:subjectId" component={SubjectPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <AdminRoute path="/upload" component={UploadPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
