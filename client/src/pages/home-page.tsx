import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Download, Upload } from "lucide-react";

interface YearStats {
  year: number;
  resourceCount: number;
}

export default function HomePage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const yearStats: YearStats[] = [
    { year: 1, resourceCount: 156 },
    { year: 2, resourceCount: 203 },
    { year: 3, resourceCount: 187 },
    { year: 4, resourceCount: 142 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-welcome">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-muted-foreground">Choose your year and semester to access resources</p>
            </div>

            {/* Year Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {yearStats.map((yearData) => (
                <Link 
                  key={yearData.year} 
                  href={`/year/${yearData.year}`}
                  className="block"
                  data-testid={`link-year-${yearData.year}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">{yearData.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{yearData.year}{getOrdinalSuffix(yearData.year)} Year</h3>
                      <p className="text-muted-foreground mb-4">
                        {yearData.year === 1 ? "Foundation Courses" :
                         yearData.year === 2 ? "Core Subjects" :
                         yearData.year === 3 ? "Advanced Topics" :
                         "Specialization"}
                      </p>
                      <div className="text-sm text-accent">
                        <span data-testid={`text-year-${yearData.year}-resources`}>
                          {yearData.resourceCount}
                        </span> Resources
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-muted rounded-md">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Download className="text-accent h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Downloaded "Data Structures Notes"</p>
                      <p className="text-sm text-muted-foreground">2nd Year • Semester 1 • Computer Science</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>

                  <div className="flex items-center space-x-4 p-3 bg-muted rounded-md">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Uploaded "Linear Algebra PYQs"</p>
                      <p className="text-sm text-muted-foreground">1st Year • Semester 2 • Mathematics</p>
                    </div>
                    <span className="text-sm text-muted-foreground">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
