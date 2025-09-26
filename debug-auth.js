import { db } from './server/db.js';
import { users } from './shared/schema.js';

console.log('🔍 Checking database users...');

try {
  const allUsers = await db.select().from(users);
  console.log('📊 Total users in database:', allUsers.length);
  
  if (allUsers.length > 0) {
    allUsers.forEach(user => {
      console.log(`\n👤 User: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔒 Password length: ${user.password.length}`);
      console.log(`🧂 Has salt separator: ${user.password.includes('.') ? 'Yes' : 'No'}`);
      console.log(`🏷️ Role: ${user.role}`);
    });
  } else {
    console.log('⚠️ No users found in database');
  }
} catch (error) {
  console.error('❌ Error checking database:', error);
}