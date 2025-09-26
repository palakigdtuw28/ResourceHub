import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Home, ChevronRight, BookOpen } from "lucide-react";

export default function YearPage() {
  const { year } = useParams<{ year: string }>();
  const yearNumber = parseInt(year || "1");

  const semesterData = [
    { 
      semester: 1, 
      subjects: 6, 
      resources: 124, 
      notes: 67, 
      pyqs: 57 
    },
    { 
      semester: 2, 
      subjects: 6, 
      resources: 98, 
      notes: 53, 
      pyqs: 45 
    },
  ];

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
              <span className="text-foreground" data-testid="text-current-year">
                {yearNumber}{getOrdinalSuffix(yearNumber)} Year
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-year-title">
                {yearNumber}{getOrdinalSuffix(yearNumber)} Year
              </h2>
              <p className="text-muted-foreground">Select a semester to view subjects and resources</p>
            </div>

            {/* Semester Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {semesterData.map((semester) => (
                <Link 
                  key={semester.semester}
                  href={`/year/${year}/semester/${semester.semester}`}
                  className="block"
                  data-testid={`link-semester-${semester.semester}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="text-primary h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">Semester {semester.semester}</h3>
                          <p className="text-muted-foreground mb-2">
                            {semester.subjects} Subjects • {semester.resources} Resources
                          </p>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                              Notes: {semester.notes}
                            </span>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              PYQs: {semester.pyqs}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="text-muted-foreground h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Back Button */}
            <Link href="/">
              <Button variant="outline" className="inline-flex items-center space-x-2" data-testid="button-back-dashboard">
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
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
