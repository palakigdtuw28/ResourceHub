import { db } from './server/db.js';
import { users, subjects } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
}

async function testBackend() {
    try {
        console.log('\n🔍 Testing Database Operations...');
        
        // Test User Operations
        console.log('\n👤 Testing User Management:');
        
        // Create test user with hashed password
        const testUser = {
            username: 'test_user',
            password: await hashPassword('test123'),
            email: 'test@example.com',
            fullName: 'Test User',
            year: 2,
            branch: 'CSE',
            isAdmin: false
        };
        
        // Delete if exists
        await db.delete(users).where(eq(users.username, testUser.username));
        
        // Create user
        const newUser = await db.insert(users).values(testUser).returning().get();
        console.log('Create User:', newUser ? '✅' : '❌');
        
        // Fetch user
        const fetchedUser = await db.select().from(users).where(eq(users.username, testUser.username)).get();
        console.log('Fetch User:', fetchedUser && fetchedUser.username === testUser.username ? '✅' : '❌');
        
        // Test Subject Operations
        console.log('\n📚 Testing Subject Management:');
        
        const testSubject = {
            name: 'Test Subject',
            code: 'TEST101',
            year: 2,
            semester: 1,
            branch: 'CSE',
            icon: 'book'
        };
        
        // Create subject
        const newSubject = await db.insert(subjects).values(testSubject).returning().get();
        console.log('Create Subject:', newSubject ? '✅' : '❌');
        
        // Fetch subjects
        const subjectsList = await db.select().from(subjects).get();
        console.log('List Subjects:', Array.isArray(subjectsList) ? '✅' : '❌');
        console.log('Total Subjects:', subjectsList.length);
        
        // Clean up
        console.log('\n🧹 Cleaning up test data...');
        if (newUser) {
            await db.delete(users).where(eq(users.username, testUser.username));
        }
        if (newSubject) {
            await db.delete(subjects).where(eq(subjects.code, testSubject.code));
        }
        
        console.log('\n✨ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test error:', error);
    }
}

// Run tests
console.log('🚀 Starting backend tests...');
testBackend();