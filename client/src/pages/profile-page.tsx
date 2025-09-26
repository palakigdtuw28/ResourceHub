import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Edit, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormData {
  fullName: string;
  year: number;
  branch: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const { data: userResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/resources/user", user?.id],
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.fullName || "",
      year: user?.year || 1,
      branch: user?.branch || "Computer Science",
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

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
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
              <p className="text-muted-foreground">Manage your account settings and view your activity</p>
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
                          <Select onValueChange={(value) => form.setValue("year", parseInt(value))}>
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
                          <Select onValueChange={(value) => form.setValue("branch", value)}>
                            <SelectTrigger data-testid="select-profile-branch">
                              <SelectValue placeholder={user.branch} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Computer Science">Computer Science</SelectItem>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Mechanical">Mechanical</SelectItem>
                              <SelectItem value="Civil">Civil</SelectItem>
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

                {/* My Resources */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">My Uploaded Resources</h3>
                    <div className="space-y-3">
                      {resourcesLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                          ))}
                        </div>
                      ) : userResources?.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          You haven't uploaded any resources yet.
                        </p>
                      ) : (
                        userResources?.slice(0, 5).map((resource) => (
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
                            </div>
                          </div>
                        ))
                      )}
                      
                      {userResources && userResources.length > 5 && (
                        <Button variant="ghost" className="w-full" data-testid="button-view-all-resources">
                          View All My Resources ({userResources.length})
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Account Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium" data-testid="text-member-since">
                          {user.createdAt ? formatMemberSince(user.createdAt) : "Recently"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Resources Uploaded</span>
                        <span className="font-medium text-primary" data-testid="text-stats-uploads">
                          {statsLoading ? "..." : stats?.uploads || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Resources Downloaded</span>
                        <span className="font-medium text-accent" data-testid="text-stats-downloads">
                          {statsLoading ? "..." : stats?.downloads || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Downloads of My Files</span>
                        <span className="font-medium text-primary" data-testid="text-stats-total-downloads">
                          {statsLoading ? "..." : stats?.totalDownloads || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" data-testid="button-quick-upload">
                        <i className="fas fa-upload mr-2" />
                        Upload Resource
                      </Button>
                      <Button variant="secondary" className="w-full justify-start" data-testid="button-change-password">
                        <i className="fas fa-key mr-2" />
                        Change Password
                      </Button>
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
