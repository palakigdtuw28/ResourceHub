import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Home, ChevronRight, Code, Calculator, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SemesterPage() {
  const { year, semester } = useParams<{ year: string; semester: string }>();
  const { user } = useAuth();
  const yearNumber = parseInt(year || "1");
  const semesterNumber = parseInt(semester || "1");

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["/api/subjects", yearNumber, semesterNumber],
    enabled: !!user,
  });

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

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-6 w-fit">
              <Button size="sm" className="shadow-sm" data-testid="button-filter-all">
                All Resources
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-filter-notes">
                Notes
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-filter-pyqs">
                PYQs
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-filter-assignments">
                Assignments
              </Button>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {subjects?.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p>No subjects found for this semester.</p>
                  <p className="text-sm mt-2">Check back later or contact administration.</p>
                </div>
              ) : (
                subjects?.map((subject) => (
                  <Link key={subject.id} href={`/subject/${subject.id}`} className="block">
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer" data-testid={`card-subject-${subject.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
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
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Notes</span>
                            <span className="font-medium">12 files</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PYQs</span>
                            <span className="font-medium">8 files</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span className="font-medium">2 days ago</span>
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
