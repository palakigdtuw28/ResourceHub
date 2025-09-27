import Database from 'better-sqlite3';
const db = new Database('./campusvault.db');

console.log('=== FIXING BRANCH MISMATCH ===');

console.log('\nBefore fix:');
const beforeStats = db.prepare(`
  SELECT branch, COUNT(*) as count 
  FROM subjects 
  GROUP BY branch
`).all();
console.table(beforeStats);

// Update all subjects from 'Computer Science' to 'CSE'
const updateResult = db.prepare(`
  UPDATE subjects 
  SET branch = 'CSE' 
  WHERE branch = 'Computer Science'
`).run();

console.log(`\nUpdated ${updateResult.changes} subjects from 'Computer Science' to 'CSE'`);

console.log('\nAfter fix:');
const afterStats = db.prepare(`
  SELECT branch, COUNT(*) as count 
  FROM subjects 
  GROUP BY branch
`).all();
console.table(afterStats);

// Test the fix
console.log('\n=== TESTING BRANCH FILTERING AFTER FIX ===');

const testQueries = [
  { year: 2, semester: 2, branch: 'CSE' },
  { year: 3, semester: 1, branch: 'CSE' },
  { year: 2, semester: 2, branch: 'ECE' },
];

for (const query of testQueries) {
  const subjects = db.prepare(`
    SELECT id, name, code, year, semester, branch 
    FROM subjects 
    WHERE year = ? AND semester = ? AND branch = ?
    ORDER BY name
  `).all(query.year, query.semester, query.branch);
  
  console.log(`\nYear ${query.year}, Semester ${query.semester}, Branch ${query.branch}: ${subjects.length} subjects`);
  if (subjects.length > 0) {
    subjects.forEach(s => console.log(`  - ${s.name} (${s.code})`));
  }
}

db.close();

console.log('\n✅ Branch mismatch fixed! Users should now see subjects for their branch.');