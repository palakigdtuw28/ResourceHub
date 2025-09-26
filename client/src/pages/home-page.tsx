import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

const years = [1, 2, 3, 4];

export default function HomePage() {
  const { user } = useAuth();

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
              {years.map((year) => (
                <Link 
                  key={year} 
                  href={`/year/${year}`}
                  className="block"
                  data-testid={`link-year-${year}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">{year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{year}{getOrdinalSuffix(year)} Year</h3>
                      <p className="text-muted-foreground">
                        {year === 1 ? "Foundation Courses" :
                         year === 2 ? "Core Subjects" :
                         year === 3 ? "Advanced Topics" :
                         "Specialization"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Clean Dashboard - No Activity Tracking */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">🎯 Clean Interface Active</h3>
                <p className="text-muted-foreground">
                  Browse and access your academic resources by selecting a year above. 
                  This version has notifications and activity tracking completely removed for a cleaner, distraction-free experience.
                </p>
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
