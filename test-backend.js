import { db } from './server/db.js';
import { users, subjects, resources } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const BASE_URL = 'http://localhost:5000';
let adminCookies = '';
let userCookies = '';

// Test users
const adminUser = {
    username: 'admin_test',
    password: 'admin123',
    email: 'admin@test.com',
    fullName: 'Admin Test',
    year: 4,
    branch: 'CSE',
    isAdmin: true
};

const regularUser = {
    username: 'user_test',
    password: 'user123',
    email: 'user@test.com',
    fullName: 'User Test',
    year: 2,
    branch: 'CSE',
    isAdmin: false
};

// Test subject
const testSubject = {
    name: 'Test Subject',
    code: 'TEST101',
    year: 2,
    semester: 1,
    branch: 'CSE',
    icon: 'fas fa-book'
};

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
}

async function setupTestUsers() {
    console.log('\n🔧 Setting up test users...');
    
    // Delete existing test users
    await db.delete(users).where(eq(users.username, adminUser.username));
    await db.delete(users).where(eq(users.username, regularUser.username));
    
    // Create admin user
    const adminHash = await hashPassword(adminUser.password);
    await db.insert(users).values({ ...adminUser, password: adminHash });
    
    // Create regular user
    const userHash = await hashPassword(regularUser.password);
    await db.insert(users).values({ ...regularUser, password: userHash });
    
    console.log('✅ Test users created successfully');
}

async function testAuth(user, password) {
    console.log(`\n🔒 Testing login for ${user.username}...`);
    
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                username: user.username, 
                password: password 
            })
        });
        
        console.log(`Status: ${response.status}`);
        const data = await response.json().catch(() => null);
        
        if (response.status === 200 && data) {
            console.log('✅ Login successful');
            console.log('User data:', data);
            return response.headers.get('set-cookie');
        } else {
            console.log('❌ Login failed');
            if (data) console.log('Error:', data);
            return null;
        }
    } catch (error) {
        console.error('Login error:', error.message);
        return null;
    }
}

async function testAdminFeatures(cookies) {
    console.log('\n👑 Testing admin features...');
    
    // Test subject creation
    const subjectRes = await fetch(`${BASE_URL}/api/subjects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
        },
        body: JSON.stringify(testSubject)
    });
    
    console.log('Create subject:', subjectRes.status === 201 ? '✅' : '❌');
    
    // Test user management
    const usersRes = await fetch(`${BASE_URL}/api/users`, {
        headers: { 'Cookie': cookies }
    });
    
    console.log('List users:', usersRes.status === 200 ? '✅' : '❌');
}

async function testUserFeatures(cookies) {
    console.log('\n👤 Testing user features...');
    
    // Test profile access
    const profileRes = await fetch(`${BASE_URL}/api/user`, {
        headers: { 'Cookie': cookies }
    });
    
    console.log('Get profile:', profileRes.status === 200 ? '✅' : '❌');
    
    // Test subjects access
    const subjectsRes = await fetch(`${BASE_URL}/api/subjects/2/1`, {
        headers: { 'Cookie': cookies }
    });
    
    console.log('List subjects:', subjectsRes.status === 200 ? '✅' : '❌');
}

async function runTests() {
    try {
        // Setup test users
        await setupTestUsers();
        
        // Test admin login and features
        adminCookies = await testAuth(adminUser, adminUser.password);
        if (adminCookies) {
            await testAdminFeatures(adminCookies);
        }
        
        // Test regular user login and features
        userCookies = await testAuth(regularUser, regularUser.password);
        if (userCookies) {
            await testUserFeatures(userCookies);
        }
        
        console.log('\n✨ All tests completed!');
    } catch (error) {
        console.error('\n❌ Test error:', error);
    }
}

// Run all tests
console.log('🚀 Starting backend tests...');
runTests();