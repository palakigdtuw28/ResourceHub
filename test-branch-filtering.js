import Database from 'better-sqlite3';
const db = new Database('./campusvault.db');

console.log('=== BRANCH FILTERING TEST ===');

// Test branch filtering as it would happen in the API
const testBranches = ['CSE', 'ECE', 'MAE', 'ADMIN', 'Computer Science'];

for (const branch of testBranches) {
  console.log(`\n--- Testing branch: ${branch} ---`);
  
  // Test Year 2, Semester 2 (as shown in logs: GET /api/subjects/2/2)
  const subjects = db.prepare(`
    SELECT id, name, code, year, semester, branch 
    FROM subjects 
    WHERE year = 2 AND semester = 2 AND branch = ?
    ORDER BY name
  `).all(branch);
  
  console.log(`Found ${subjects.length} subjects for Year 2, Semester 2, Branch: ${branch}`);
  if (subjects.length > 0) {
    console.table(subjects);
  }
  
  // Also check Year 3, Semester 1 (as shown in logs: GET /api/subjects/3/1)
  const subjects31 = db.prepare(`
    SELECT id, name, code, year, semester, branch 
    FROM subjects 
    WHERE year = 3 AND semester = 1 AND branch = ?
    ORDER BY name
  `).all(branch);
  
  console.log(`Found ${subjects31.length} subjects for Year 3, Semester 1, Branch: ${branch}`);
  if (subjects31.length > 0) {
    console.table(subjects31);
  }
}

console.log('\n=== USER BRANCH ANALYSIS ===');
const userBranches = db.prepare(`
  SELECT id, username, branch, is_admin 
  FROM users 
  ORDER BY branch, username
`).all();
console.table(userBranches);

console.log('\n=== SUBJECT BRANCH ANALYSIS ===');
const subjectBranches = db.prepare(`
  SELECT DISTINCT branch, COUNT(*) as count 
  FROM subjects 
  GROUP BY branch 
  ORDER BY count DESC
`).all();
console.table(subjectBranches);

console.log('\n=== MISMATCH DETECTION ===');
// Check if there are users with branches that don't have subjects
const userBranchesOnly = db.prepare('SELECT DISTINCT branch FROM users').all().map(u => u.branch);
const subjectBranchesOnly = db.prepare('SELECT DISTINCT branch FROM subjects').all().map(s => s.branch);

console.log('User branches:', userBranchesOnly);
console.log('Subject branches:', subjectBranchesOnly);

const missingSubjectBranches = userBranchesOnly.filter(branch => !subjectBranchesOnly.includes(branch));
const unusedSubjectBranches = subjectBranchesOnly.filter(branch => !userBranchesOnly.includes(branch));

if (missingSubjectBranches.length > 0) {
  console.log('⚠️  Users have branches with NO subjects:', missingSubjectBranches);
}

if (unusedSubjectBranches.length > 0) {
  console.log('⚠️  Subjects have branches with NO users:', unusedSubjectBranches);
}

db.close();