import Database from 'better-sqlite3';

// This script should be run in production to fix the branch mismatch
// Use the same database path as the main application
const dbPath = process.env.DATABASE_URL || './campusvault.db';

try {
  console.log('Connecting to database:', dbPath);
  const db = new Database(dbPath);
  
  console.log('Migrating subject branches from "Computer Science" to "CSE"...');
  
  const result = db.prepare(`
    UPDATE subjects 
    SET branch = 'CSE' 
    WHERE branch = 'Computer Science'
  `).run();
  
  console.log(`✅ Updated ${result.changes} subjects`);
  
  // Verify the fix
  const cseCount = db.prepare(`SELECT COUNT(*) as count FROM subjects WHERE branch = 'CSE'`).get();
  const csCount = db.prepare(`SELECT COUNT(*) as count FROM subjects WHERE branch = 'Computer Science'`).get();
  
  console.log(`CSE subjects: ${cseCount.count}`);
  console.log(`Computer Science subjects: ${csCount.count}`);
  
  db.close();
  
  console.log('✅ Branch migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}