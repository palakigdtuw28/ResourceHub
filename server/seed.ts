import { db } from "./db";
import { subjects, resources, users } from "../shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if subjects already exist
    const existingSubjects = await db.select().from(subjects);
    if (existingSubjects.length > 0) {
      console.log("📚 Database already has subjects, skipping seeding");
      return;
    }

    // Create sample subjects for each year and semester
    const sampleSubjects = [
      // 1st Year - Semester 1
      { name: "Mathematics I", code: "MA101", year: 1, semester: 1, branch: "Computer Science", icon: "fas fa-calculator" },
      { name: "Physics", code: "PH101", year: 1, semester: 1, branch: "Computer Science", icon: "fas fa-atom" },
      { name: "Programming Fundamentals", code: "CS101", year: 1, semester: 1, branch: "Computer Science", icon: "fas fa-code" },
      { name: "English Communication", code: "EN101", year: 1, semester: 1, branch: "Computer Science", icon: "fas fa-book-open" },
      { name: "Engineering Drawing", code: "ME101", year: 1, semester: 1, branch: "Computer Science", icon: "fas fa-drafting-compass" },

      // 1st Year - Semester 2
      { name: "Mathematics II", code: "MA102", year: 1, semester: 2, branch: "Computer Science", icon: "fas fa-calculator" },
      { name: "Chemistry", code: "CH101", year: 1, semester: 2, branch: "Computer Science", icon: "fas fa-flask" },
      { name: "Data Structures", code: "CS102", year: 1, semester: 2, branch: "Computer Science", icon: "fas fa-project-diagram" },
      { name: "Digital Logic", code: "CS103", year: 1, semester: 2, branch: "Computer Science", icon: "fas fa-microchip" },
      { name: "Environmental Science", code: "ES101", year: 1, semester: 2, branch: "Computer Science", icon: "fas fa-leaf" },

      // 2nd Year - Semester 1
      { name: "Algorithms", code: "CS201", year: 2, semester: 1, branch: "Computer Science", icon: "fas fa-sitemap" },
      { name: "Computer Organization", code: "CS202", year: 2, semester: 1, branch: "Computer Science", icon: "fas fa-memory" },
      { name: "Object Oriented Programming", code: "CS203", year: 2, semester: 1, branch: "Computer Science", icon: "fas fa-object-group" },
      { name: "Database Systems", code: "CS204", year: 2, semester: 1, branch: "Computer Science", icon: "fas fa-database" },
      { name: "Discrete Mathematics", code: "MA201", year: 2, semester: 1, branch: "Computer Science", icon: "fas fa-infinity" },

      // 2nd Year - Semester 2
      { name: "Operating Systems", code: "CS205", year: 2, semester: 2, branch: "Computer Science", icon: "fas fa-desktop" },
      { name: "Computer Networks", code: "CS206", year: 2, semester: 2, branch: "Computer Science", icon: "fas fa-network-wired" },
      { name: "Software Engineering", code: "CS207", year: 2, semester: 2, branch: "Computer Science", icon: "fas fa-tools" },
      { name: "Web Development", code: "CS208", year: 2, semester: 2, branch: "Computer Science", icon: "fas fa-globe" },
      { name: "Statistics", code: "MA202", year: 2, semester: 2, branch: "Computer Science", icon: "fas fa-chart-bar" },

      // 3rd Year - Semester 1
      { name: "Artificial Intelligence", code: "CS301", year: 3, semester: 1, branch: "Computer Science", icon: "fas fa-robot" },
      { name: "Machine Learning", code: "CS302", year: 3, semester: 1, branch: "Computer Science", icon: "fas fa-brain" },
      { name: "Compiler Design", code: "CS303", year: 3, semester: 1, branch: "Computer Science", icon: "fas fa-cog" },
      { name: "Computer Graphics", code: "CS304", year: 3, semester: 1, branch: "Computer Science", icon: "fas fa-paint-brush" },
      { name: "Cybersecurity", code: "CS305", year: 3, semester: 1, branch: "Computer Science", icon: "fas fa-shield-alt" },

      // 3rd Year - Semester 2
      { name: "Distributed Systems", code: "CS306", year: 3, semester: 2, branch: "Computer Science", icon: "fas fa-server" },
      { name: "Cloud Computing", code: "CS307", year: 3, semester: 2, branch: "Computer Science", icon: "fas fa-cloud" },
      { name: "Mobile App Development", code: "CS308", year: 3, semester: 2, branch: "Computer Science", icon: "fas fa-mobile-alt" },
      { name: "Data Mining", code: "CS309", year: 3, semester: 2, branch: "Computer Science", icon: "fas fa-search" },
      { name: "Human Computer Interaction", code: "CS310", year: 3, semester: 2, branch: "Computer Science", icon: "fas fa-users" },

      // 4th Year - Semester 1
      { name: "Advanced Algorithms", code: "CS401", year: 4, semester: 1, branch: "Computer Science", icon: "fas fa-chess" },
      { name: "Blockchain Technology", code: "CS402", year: 4, semester: 1, branch: "Computer Science", icon: "fas fa-link" },
      { name: "IoT Systems", code: "CS403", year: 4, semester: 1, branch: "Computer Science", icon: "fas fa-wifi" },
      { name: "Project Management", code: "MG401", year: 4, semester: 1, branch: "Computer Science", icon: "fas fa-tasks" },
      { name: "Research Methodology", code: "RM401", year: 4, semester: 1, branch: "Computer Science", icon: "fas fa-microscope" },

      // 4th Year - Semester 2
      { name: "Final Year Project", code: "CS404", year: 4, semester: 2, branch: "Computer Science", icon: "fas fa-graduation-cap" },
      { name: "Industry Internship", code: "IN401", year: 4, semester: 2, branch: "Computer Science", icon: "fas fa-briefcase" },
      { name: "Advanced Topics in AI", code: "CS405", year: 4, semester: 2, branch: "Computer Science", icon: "fas fa-lightbulb" },
      { name: "Entrepreneurship", code: "EN401", year: 4, semester: 2, branch: "Computer Science", icon: "fas fa-rocket" },
    ];

    // Insert subjects
    console.log("📚 Creating subjects...");
    await db.insert(subjects).values(sampleSubjects);

    console.log(`✅ Successfully created ${sampleSubjects.length} subjects!`);
    console.log("🎉 Database seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seeding
seedDatabase();