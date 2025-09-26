import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Edit, Calendar, Key, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProfileFormData {
  fullName: string;
  year: number;
  branch: string;
}

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);



  interface UserResource {
    id: string;
    title: string;
    resourceType: string;
    fileSize: number;
    downloadCount: number;
  }

  const { data: userResources, isLoading: resourcesLoading } = useQuery<UserResource[]>({
    queryKey: ["/api/resources/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/resources/user/${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch user resources");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.fullName || "",
      year: user?.year || 1,
      branch: user?.branch || "CSE",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        year: user.year || 1,
        branch: user.branch || "CSE",
      });
    }
  }, [user, form]);

  const passwordForm = useForm<PasswordChangeFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", `/api/user/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords don't match");
      }
      
      const response = await apiRequest("PUT", `/api/user/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    changePasswordMutation.mutate(data);
  };

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/resources/${resourceId}`);
        
        // Check if response is HTML (indicates redirect to login)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('You need to log in again to delete resources.');
        }
        
        return response.json();
      } catch (error: any) {
        // Handle JSON parsing errors (when server returns HTML)
        if (error.message.includes('Unexpected token') && error.message.includes('<!DOCTYPE')) {
          throw new Error('You need to log in again to delete resources.');
        }
        
        // Handle specific HTTP error cases
        if (error.message.includes('401')) {
          throw new Error('You need to log in again to delete resources.');
        }
        if (error.message.includes('403')) {
          throw new Error('You do not have permission to delete this resource.');
        }
        if (error.message.includes('404')) {
          throw new Error('Resource not found. It may have already been deleted.');
        }
        throw new Error(`Failed to delete resource: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources/user", user?.id] });
      toast({
        title: "Resource deleted",
        description: "The resource has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteResource = (resourceId: string, resourceTitle: string) => {
    if (window.confirm(`⚠️ Delete Resource\n\nAre you sure you want to delete "${resourceTitle}"?\n\nThis will permanently delete:\n- The file from the server\n- All download records\n- This cannot be undone\n\nClick OK to confirm deletion.`)) {
      deleteResourceMutation.mutate(resourceId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-profile-title">My Profile</h2>
              <p className="text-muted-foreground">
                {user?.isAdmin ? "Manage your account settings and uploaded resources" : "Manage your account settings"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            {...form.register("fullName")}
                            data-testid="input-profile-fullname"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-muted"
                            data-testid="input-profile-email"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="year">Year</Label>
                          <Select 
                            value={form.watch("year")?.toString()} 
                            onValueChange={(value) => form.setValue("year", parseInt(value))}
                          >
                            <SelectTrigger data-testid="select-profile-year">
                              <SelectValue placeholder={`${user.year}${getOrdinalSuffix(user.year)} Year`} />
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
                          <Label htmlFor="branch">Branch</Label>
                          <Select 
                            value={form.watch("branch")} 
                            onValueChange={(value) => form.setValue("branch", value)}
                          >
                            <SelectTrigger data-testid="select-profile-branch">
                              <SelectValue placeholder={user.branch} />
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
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-update-profile"
                      >
                        {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* My Resources - Only for Admin Users */}
                {user?.isAdmin && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">My Uploaded Resources</h3>
                      <div className="space-y-3">
                        {resourcesLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md animate-pulse">
                                <div className="flex items-center space-x-3">
                                  <div className="h-6 w-6 bg-gray-300 rounded" />
                                  <div>
                                    <div className="h-4 w-32 bg-gray-300 rounded mb-1" />
                                    <div className="h-3 w-24 bg-gray-200 rounded" />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="h-4 w-16 bg-gray-300 rounded" />
                                  <div className="h-8 w-8 bg-gray-200 rounded" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(userResources) && userResources.length === 0 ? (
                          <div className="text-center py-8">
                            <i className="fas fa-folder-open text-4xl text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No resources uploaded yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Upload your first resource to see it here</p>
                          </div>
                        ) : (
                          Array.isArray(userResources) && userResources.slice(0, 5).map((resource: UserResource) => (
                            <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                              <div className="flex items-center space-x-3">
                                <i className="fas fa-file-pdf text-red-500" />
                                <div>
                                  <p className="font-medium" data-testid={`text-my-resource-title-${resource.id}`}>
                                    {resource.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {resource.resourceType} • {formatFileSize(resource.fileSize)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-accent font-medium">
                                  {resource.downloadCount} downloads
                                </span>
                                <Button size="sm" variant="outline" data-testid={`button-edit-resource-${resource.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteResource(resource.id, resource.title)}
                                  disabled={deleteResourceMutation.isPending}
                                  data-testid={`button-delete-resource-${resource.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                        
                        {Array.isArray(userResources) && userResources.length > 5 && (
                          <Button variant="ghost" className="w-full" data-testid="button-view-all-resources">
                            View All My Resources ({userResources.length})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Account Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium" data-testid="text-member-since">
                          {user.createdAt ? formatMemberSince(user.createdAt) : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Branch</span>
                        <span className="font-medium text-primary">
                          {user.branch || "Not Set"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" className="w-full justify-start" data-testid="button-change-password">
                            <Key className="mr-2 h-4 w-4" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <div>
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                {...passwordForm.register("currentPassword", { required: "Current password is required" })}
                                data-testid="input-current-password"
                              />
                              {passwordForm.formState.errors.currentPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {passwordForm.formState.errors.currentPassword.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                {...passwordForm.register("newPassword", { 
                                  required: "New password is required",
                                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                                })}
                                data-testid="input-new-password"
                              />
                              {passwordForm.formState.errors.newPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {passwordForm.formState.errors.newPassword.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                {...passwordForm.register("confirmPassword", { required: "Please confirm your new password" })}
                                data-testid="input-confirm-password"
                              />
                              {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {passwordForm.formState.errors.confirmPassword.message}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsPasswordDialogOpen(false)}
                                data-testid="button-cancel-password"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={changePasswordMutation.isPending}
                                data-testid="button-update-password"
                              >
                                {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return "th";
  }
  
  switch (lastDigit) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatMemberSince(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
