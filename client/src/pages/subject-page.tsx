import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Home, ChevronRight, FileText, HelpCircle, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  type Subject = {
    id: string;
    name: string;
    code: string;
    year: number;
    semester: number;
    icon?: string;
    // add other properties as needed
  };

  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ["/api/subject", subjectId],
    enabled: !!subjectId,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/resources", subjectId],
    enabled: !!subjectId,
  });

  const downloadMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      // Record the download
      await apiRequest("POST", "/api/downloads", { resourceId });
      // Trigger file download
      window.open(`/api/download/${resourceId}`, '_blank');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources", subjectId] });
      toast({
        title: "Download started",
        description: "Your file download has begun.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = (resourceId: string) => {
    downloadMutation.mutate(resourceId);
  };


  const resourcesArray = Array.isArray(resources) ? resources : [];
  const notesResources = resourcesArray.filter(r => r.resourceType === "notes");
  const pyqResources = resourcesArray.filter(r => r.resourceType === "pyqs");

  // State to control expanded notes view
  const [showAllNotes, setShowAllNotes] = useState(false);

  if (subjectLoading || resourcesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-2 gap-8">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Subject not found.</p>
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
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 mb-6 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-foreground">Dashboard</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/year/${subject.year}`} className="hover:text-foreground">
                {subject.year}{getOrdinalSuffix(subject.year)} Year
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/year/${subject.year}/semester/${subject.semester}`} className="hover:text-foreground">
                Semester {subject.semester}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground" data-testid="text-subject-name">
                {subject.name}
              </span>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <i className={`${subject.icon || 'fas fa-book'} text-primary text-2xl`} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold" data-testid="text-subject-title">
                    {subject.name}
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-subject-details">
                    {subject.code} • {subject.year}{getOrdinalSuffix(subject.year)} Year - Semester {subject.semester}
                  </p>
                </div>
              </div>

              {/* Add Notes Button */}
              {user?.isAdmin && (
                <Link href={`/upload?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}&subjectCode=${encodeURIComponent(subject.code)}&year=${subject.year}&semester=${subject.semester}`}>
                  <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-notes">
                    <i className="fas fa-plus mr-2" />
                    Add Notes
                  </Button>
                </Link>
              )}
            </div>

            {/* Resource Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notes Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="text-accent mr-2 h-5 w-5" />
                    Notes ({notesResources.length})
                  </h3>
                  <div className="space-y-3">
                    {notesResources.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No notes available yet.
                      </p>
                    ) : (
                      (showAllNotes ? notesResources : notesResources.slice(0, 3)).map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center space-x-3">
                            <i className="fas fa-file-pdf text-red-500" />
                            <div>
                              <p className="font-medium" data-testid={`text-resource-title-${resource.id}`}>
                                {resource.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(resource.fileSize)} • Uploaded {formatDate(resource.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-accent font-medium">
                              {resource.downloadCount} downloads
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownload(resource.id)}
                              disabled={downloadMutation.isPending}
                              data-testid={`button-download-${resource.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    {notesResources.length > 3 && (
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        data-testid="button-view-all-notes"
                        onClick={() => setShowAllNotes((prev) => !prev)}
                      >
                        {showAllNotes ? `Show Less` : `View All Notes (${notesResources.length})`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PYQs Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <HelpCircle className="text-primary mr-2 h-5 w-5" />
                    Previous Year Questions ({pyqResources.length})
                  </h3>
                  <div className="space-y-3">
                    {pyqResources.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No PYQs available yet.
                      </p>
                    ) : (
                      pyqResources.slice(0, 3).map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center space-x-3">
                            <i className="fas fa-file-pdf text-red-500" />
                            <div>
                              <p className="font-medium" data-testid={`text-resource-title-${resource.id}`}>
                                {resource.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(resource.fileSize)} • Uploaded {formatDate(resource.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-accent font-medium">
                              {resource.downloadCount} downloads
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownload(resource.id)}
                              disabled={downloadMutation.isPending}
                              data-testid={`button-download-${resource.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {pyqResources.length > 3 && (
                      <Button variant="ghost" className="w-full" data-testid="button-view-all-pyqs">
                        View All PYQs ({pyqResources.length})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Navigation */}
            <div className="mt-8">
              <Link href={`/year/${subject.year}/semester/${subject.semester}`}>
                <Button variant="outline" className="inline-flex items-center space-x-2" data-testid="button-back-subjects">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back to Subjects</span>
                </Button>
              </Link>
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

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}
