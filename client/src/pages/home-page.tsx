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
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 w-full min-w-0 p-4 md:p-6">
          <div className="fade-in max-w-full">
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold mb-3 leading-tight" data-testid="text-welcome">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">Choose your year and semester to access resources</p>
            </div>

            {/* Year Selection Grid - maintains desktop-like alignment on mobile */}
            <div className="w-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {years.map((year) => (
                  <Link 
                    key={year} 
                    href={`/year/${year}`}
                    className="block w-full"
                    data-testid={`link-year-${year}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer w-full min-h-[140px] md:min-h-[160px]">
                      <CardContent className="p-4 md:p-6 text-center h-full flex flex-col justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 flex-shrink-0">
                          <span className="text-lg md:text-2xl font-bold text-primary">{year}</span>
                        </div>
                        <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-2 leading-tight flex-shrink-0">{year}{getOrdinalSuffix(year)} Year</h3>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed flex-1">
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
