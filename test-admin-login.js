// Test admin login
import Database from 'better-sqlite3';
import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

console.log('🧪 Testing admin login...');

async function testAdminPassword(username, password) {
    try {
        const db = new Database('campusvault.db', { readonly: true });
        
        // Get user from database
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (!user) {
            console.log(`❌ User ${username} not found`);
            return false;
        }
        
        console.log(`✅ User ${username} found`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Admin: ${user.is_admin ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${user.created_at}`);
        
        // Test password
        const [hashed, salt] = user.password.split(".");
        if (!hashed || !salt) {
            console.log('❌ Invalid password format in database');
            return false;
        }
        
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(password, salt, 64));
        
        const isValid = timingSafeEqual(hashedBuf, suppliedBuf);
        
        if (isValid) {
            console.log('✅ Password is correct!');
            return true;
        } else {
            console.log('❌ Password is incorrect');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        return false;
    }
}

// Test both admin accounts
console.log('Testing primary admin...');
const primaryTest = await testAdminPassword('admin', 'CampusVault2025!');

console.log('\nTesting backup admin...');
const backupTest = await testAdminPassword('backup_admin', 'BackupAdmin2025!');

console.log('\n📊 Test Results:');
console.log(`Primary admin: ${primaryTest ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Backup admin: ${backupTest ? '✅ PASS' : '❌ FAIL'}`);

if (primaryTest && backupTest) {
    console.log('\n🎉 All admin accounts are ready for deployment!');
} else {
    console.log('\n⚠️ Some admin accounts have issues - check the setup');
}