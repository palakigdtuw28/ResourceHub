import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { FileUpload } from "@/components/ui/file-upload";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface UploadFormData {
  title: string;
  description: string;
  year: number;
  semester: number;
  subjectName: string;
  subjectCode: string;
  resourceType: string;
  file: File | null;
  agreeToTerms: boolean;
}

export default function UploadPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const form = useForm<UploadFormData>({
    defaultValues: {
      title: "",
      description: "",
      year: user?.year || 1,
      semester: 1,
      subjectName: "",
      subjectCode: "",
      resourceType: "",
      file: null,
      agreeToTerms: false,
    },
  });

  const watchedYear = form.watch("year");
  const watchedSemester = form.watch("semester");

  // No longer need to fetch subjects since we're creating them

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      // First check if subject already exists
      const subjectData = {
        name: data.subjectName,
        code: data.subjectCode,
        year: data.year,
        semester: data.semester,
        branch: user?.branch || "CSE",
        icon: "fas fa-book"
      };

      // Try to find existing subject first
      const existingSubjectsResponse = await fetch(`/api/subjects/${data.year}/${data.semester}?branch=${user?.branch || "CSE"}`, {
        credentials: "include",
      });

      let subject;
      
      if (existingSubjectsResponse.ok) {
        const existingSubjects = await existingSubjectsResponse.json();
        const existingSubject = existingSubjects.find((s: any) => 
          s.name === data.subjectName && s.code === data.subjectCode
        );
        
        if (existingSubject) {
          // Use existing subject
          subject = existingSubject;
          subject.isNewSubject = false;
        } else {
          // Create new subject
          const subjectResponse = await fetch("/api/subjects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subjectData),
            credentials: "include",
          });

          if (!subjectResponse.ok) {
            const error = await subjectResponse.text();
            throw new Error(error || "Failed to create subject");
          }

          subject = await subjectResponse.json();
          subject.isNewSubject = true;
        }
      } else {
        // Fallback: create new subject
        const subjectResponse = await fetch("/api/subjects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subjectData),
          credentials: "include",
        });

        if (!subjectResponse.ok) {
          const error = await subjectResponse.text();
          throw new Error(error || "Failed to create subject");
        }

        subject = await subjectResponse.json();
        subject.isNewSubject = true;
      }

      // Then upload the resource
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("subjectId", subject.id);
      formData.append("resourceType", data.resourceType);
      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await fetch("/api/resources", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      const uploadResult = await response.json();
      return { ...uploadResult, isNewSubject: subject.isNewSubject };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/resources/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      
      toast({
        title: "Resource uploaded successfully",
        description: result.isNewSubject 
          ? "New subject created and resource uploaded." 
          : "Resource added to existing subject.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadFormData) => {
    if (!data.file) {
      toast({
        title: "File required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!data.subjectName || !data.subjectCode) {
      toast({
        title: "Subject details required",
        description: "Please fill in both subject name and code.",
        variant: "destructive",
      });
      return;
    }

    if (!data.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-upload-title">Upload Resource</h2>
              <p className="text-muted-foreground">Upload a resource to an existing subject or create a new subject</p>
            </div>

            <div className="max-w-2xl">
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Select 
                          onValueChange={(value) => {
                            const year = parseInt(value);
                            form.setValue("year", year);
                            setSelectedYear(year);
                            form.setValue("subjectName", ""); // Reset subject fields
                            form.setValue("subjectCode", ""); // Reset subject fields
                          }}
                        >
                          <SelectTrigger data-testid="select-upload-year">
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
                        <Label htmlFor="semester">Semester</Label>
                        <Select 
                          onValueChange={(value) => {
                            const semester = parseInt(value);
                            form.setValue("semester", semester);
                            setSelectedSemester(semester);
                            form.setValue("subjectName", ""); // Reset subject fields
                            form.setValue("subjectCode", ""); // Reset subject fields
                          }}
                        >
                          <SelectTrigger data-testid="select-upload-semester">
                            <SelectValue placeholder="Select Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subjectName">Subject Name</Label>
                        <Input
                          id="subjectName"
                          placeholder="e.g., Data Structures"
                          {...form.register("subjectName", { required: "Subject name is required" })}
                          data-testid="input-upload-subject-name"
                        />
                        {form.formState.errors.subjectName && (
                          <p className="text-sm text-destructive mt-1" data-testid="error-upload-subject-name">
                            {form.formState.errors.subjectName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="subjectCode">Subject Code</Label>
                        <Input
                          id="subjectCode"
                          placeholder="e.g., CS201"
                          {...form.register("subjectCode", { required: "Subject code is required" })}
                          data-testid="input-upload-subject-code"
                        />
                        {form.formState.errors.subjectCode && (
                          <p className="text-sm text-destructive mt-1" data-testid="error-upload-subject-code">
                            {form.formState.errors.subjectCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="resourceType">Resource Type</Label>
                        <Select onValueChange={(value) => form.setValue("resourceType", value)}>
                          <SelectTrigger data-testid="select-upload-type">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notes">Notes</SelectItem>
                            <SelectItem value="pyqs">Previous Year Questions</SelectItem>
                            <SelectItem value="assignments">Assignment</SelectItem>
                            <SelectItem value="lab_manual">Lab Manual</SelectItem>
                            <SelectItem value="presentation">Presentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter resource title"
                        {...form.register("title", { required: "Title is required" })}
                        data-testid="input-upload-title"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive mt-1" data-testid="error-upload-title">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        rows={3}
                        placeholder="Brief description of the resource"
                        {...form.register("description")}
                        data-testid="textarea-upload-description"
                      />
                    </div>

                    {/* File Upload Area */}
                    <div>
                      <Label>Upload File</Label>
                      <FileUpload
                        onFileSelect={(file) => form.setValue("file", file)}
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        maxSize={100 * 1024 * 1024} // 100MB
                        data-testid="file-upload-area"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={form.watch("agreeToTerms")}
                        onCheckedChange={(checked) => form.setValue("agreeToTerms", !!checked)}
                        data-testid="checkbox-upload-terms"
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground">
                        I confirm that I have the right to share this resource and it doesn't violate any copyright laws.
                      </Label>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={uploadMutation.isPending}
                        data-testid="button-upload-submit"
                      >
                        {uploadMutation.isPending ? "Creating Subject & Uploading..." : "Create Subject & Upload Resource"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => setLocation("/")}
                        data-testid="button-upload-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
