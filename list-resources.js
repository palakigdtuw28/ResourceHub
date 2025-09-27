import Database from 'better-sqlite3';
const db = new Database('./campusvault.db');

console.log('=== RESOURCES FULL ===');
const resources = db.prepare('SELECT * FROM resources ORDER BY created_at DESC').all();
console.table(resources);

console.log('\n=== RESOURCES FOR ENGINEERING MATERIALS (subject id: 1cf3b669-91c9-4dd6-b871-5d65bb83a736) ===');
const resourcesForSubject = db.prepare("SELECT * FROM resources WHERE subject_id = '1cf3b669-91c9-4dd6-b871-5d65bb83a736'").all();
console.table(resourcesForSubject);

db.close();
