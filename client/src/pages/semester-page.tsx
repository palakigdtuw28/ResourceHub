import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Home, ChevronRight, Code, Calculator, Database, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SemesterPage() {
  const { year, semester } = useParams<{ year: string; semester: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const yearNumber = parseInt(year || "1");
  const semesterNumber = parseInt(semester || "1");

  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", icon: "" });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects", yearNumber, semesterNumber, user?.branch],
    queryFn: async () => {
      const response = await fetch(`/api/subjects/${yearNumber}/${semesterNumber}?branch=${user?.branch || 'CSE'}`);
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return response.json();
    },
    enabled: !!user,
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; code: string; icon: string }) => {
      const response = await fetch(`/api/subjects/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, code: data.code, icon: data.icon }),
      });
      if (!response.ok) throw new Error("Failed to update subject");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", yearNumber, semesterNumber, user?.branch] });
      setEditingSubject(null);
      toast({ title: "Success", description: "Subject updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update subject", variant: "destructive" });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete subject");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", yearNumber, semesterNumber, user?.branch] });
      toast({ title: "Success", description: "Subject deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditClick = (subject: any) => {
    setEditingSubject(subject);
    setEditForm({
      name: subject.name,
      code: subject.code,
      icon: subject.icon || "fas fa-book"
    });
  };

  const handleDeleteClick = (subject: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      deleteSubjectMutation.mutate(subject.id);
    }
  };

  const handleSave = () => {
    if (!editingSubject) return;
    updateSubjectMutation.mutate({
      id: editingSubject.id,
      name: editForm.name,
      code: editForm.code,
      icon: editForm.icon,
    });
  };

  const getSubjectIcon = (subjectName: string) => {
    if (subjectName.toLowerCase().includes("data") || subjectName.toLowerCase().includes("programming")) {
      return <Code className="text-primary h-6 w-6" />;
    }
    if (subjectName.toLowerCase().includes("math") || subjectName.toLowerCase().includes("calculus")) {
      return <Calculator className="text-accent h-6 w-6" />;
    }
    if (subjectName.toLowerCase().includes("database")) {
      return <Database className="text-primary h-6 w-6" />;
    }
    return <Code className="text-primary h-6 w-6" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
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
              <Link href={`/year/${year}`} className="hover:text-foreground">
                {yearNumber}{getOrdinalSuffix(yearNumber)} Year
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground" data-testid="text-current-semester">
                Semester {semesterNumber}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-semester-title">
                {yearNumber}{getOrdinalSuffix(yearNumber)} Year - Semester {semesterNumber}
              </h2>
              <p className="text-muted-foreground">Browse subjects and download resources</p>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array.isArray(subjects) && subjects.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No subjects found for this semester.</p>
                  <p className="text-sm mt-2">Check back later or contact administration.</p>
                </div>
              ) : (
                Array.isArray(subjects) &&
                subjects.map((subject) => (
                  <Link key={subject.id} href={`/subject/${subject.id}`} className="block">
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer" data-testid={`card-subject-${subject.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getSubjectIcon(subject.name)}
                            </div>
                            <div>
                              <h3 className="font-semibold" data-testid={`text-subject-name-${subject.id}`}>
                                {subject.name}
                              </h3>
                              <p className="text-sm text-muted-foreground" data-testid={`text-subject-code-${subject.id}`}>
                                {subject.code}
                              </p>
                            </div>
                          </div>
                          {user?.isAdmin && (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditClick(subject);
                                }}
                                className="opacity-70 hover:opacity-100 transition-opacity"
                                title="Edit subject"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteClick(subject, e)}
                                className="opacity-70 hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                                title="Delete subject"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-muted-foreground">
                            Access notes, assignments, and previous year questions for this subject
                          </div>
                        </div>

                        <Button className="w-full" data-testid={`button-view-subject-${subject.id}`}>
                          View Resources
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {/* Navigation */}
            <div className="flex space-x-4">
              <Link href={`/year/${year}`}>
                <Button variant="outline" className="inline-flex items-center space-x-2" data-testid="button-back-semester">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back to Semesters</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
            <div>
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input
                id="subject-code"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                placeholder="Enter subject code"
              />
            </div>
            <div>
              <Label htmlFor="subject-icon">Icon (FontAwesome class)</Label>
              <Input
                id="subject-icon"
                value={editForm.icon}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                placeholder="e.g. fas fa-code"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSave} disabled={updateSubjectMutation.isPending}>
                {updateSubjectMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditingSubject(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
