import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import fetch from 'node-fetch';

const scryptAsync = promisify(scrypt);
const BASE_URL = 'http://localhost:5000';
let adminCookies = null;
let userCookies = null;

// Test users
const adminUser = {
    username: 'test_admin',
    password: 'admin123',
    email: 'admin@test.com',
    fullName: 'Test Admin',
    year: 4,
    branch: 'CSE',
    isAdmin: true
};

const regularUser = {
    username: 'test_user',
    password: 'user123',
    email: 'user@test.com',
    fullName: 'Test User',
    year: 2,
    branch: 'CSE',
    isAdmin: false
};

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString('hex')}.${salt}`;
}

async function setupTestUsers() {
    console.log('\n🔧 Setting up test users...');
    try {
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
        return true;
    } catch (error) {
        console.error('❌ Error setting up test users:', error);
        return false;
    }
}

async function testAuth() {
    console.log('\n🔒 Testing Authentication...');

    // Test admin login
    try {
        const adminRes = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: adminUser.username,
                password: adminUser.password
            })
        });

        console.log(`Admin Login: ${adminRes.ok ? '✅' : '❌'} (${adminRes.status})`);
        if (adminRes.ok) {
            adminCookies = adminRes.headers.get('set-cookie');
            console.log('Admin session established');
        }

        // Test user login
        const userRes = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: regularUser.username,
                password: regularUser.password
            })
        });

        console.log(`User Login: ${userRes.ok ? '✅' : '❌'} (${userRes.status})`);
        if (userRes.ok) {
            userCookies = userRes.headers.get('set-cookie');
            console.log('User session established');
        }

        return adminRes.ok && userRes.ok;
    } catch (error) {
        console.error('❌ Authentication error:', error.message);
        return false;
    }
}

async function testAdminFeatures() {
    if (!adminCookies) {
        console.log('❌ Skipping admin tests - no admin session');
        return false;
    }

    console.log('\n👑 Testing Admin Features...');
    let success = true;

    const tests = [
        {
            name: 'Get All Users',
            endpoint: '/api/users',
            method: 'GET'
        },
        {
            name: 'Create Subject',
            endpoint: '/api/subjects',
            method: 'POST',
            body: {
                name: 'Test Subject',
                code: 'TEST101',
                year: 2,
                semester: 1,
                branch: 'CSE'
            }
        }
    ];

    for (const test of tests) {
        try {
            const res = await fetch(`${BASE_URL}${test.endpoint}`, {
                method: test.method,
                headers: {
                    'Cookie': adminCookies,
                    'Content-Type': 'application/json'
                },
                body: test.body ? JSON.stringify(test.body) : undefined
            });

            console.log(`${test.name}: ${res.ok ? '✅' : '❌'} (${res.status})`);
            if (!res.ok) success = false;

        } catch (error) {
            console.error(`❌ Error in ${test.name}:`, error.message);
            success = false;
        }
    }

    return success;
}

async function testUserFeatures() {
    if (!userCookies) {
        console.log('❌ Skipping user tests - no user session');
        return false;
    }

    console.log('\n👤 Testing User Features...');
    let success = true;

    const tests = [
        {
            name: 'Get Profile',
            endpoint: '/api/user',
            method: 'GET'
        },
        {
            name: 'List Subjects',
            endpoint: '/api/subjects/2/1',
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            const res = await fetch(`${BASE_URL}${test.endpoint}`, {
                method: test.method,
                headers: {
                    'Cookie': userCookies
                }
            });

            console.log(`${test.name}: ${res.ok ? '✅' : '❌'} (${res.status})`);
            if (!res.ok) success = false;

        } catch (error) {
            console.error(`❌ Error in ${test.name}:`, error.message);
            success = false;
        }
    }

    return success;
}

async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    try {
        await db.delete(users).where(eq(users.username, adminUser.username));
        await db.delete(users).where(eq(users.username, regularUser.username));
        console.log('✅ Test users removed');
        return true;
    } catch (error) {
        console.error('❌ Cleanup error:', error);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting backend tests...');
    
    // Setup test users
    if (!await setupTestUsers()) {
        console.error('❌ Failed to setup test users');
        process.exit(1);
    }

    // Run authentication tests
    if (!await testAuth()) {
        console.error('❌ Authentication tests failed');
        await cleanup();
        process.exit(1);
    }

    // Run admin features tests
    if (!await testAdminFeatures()) {
        console.error('❌ Admin features tests failed');
    }

    // Run user features tests
    if (!await testUserFeatures()) {
        console.error('❌ User features tests failed');
    }

    // Clean up
    if (!await cleanup()) {
        console.error('❌ Cleanup failed');
        process.exit(1);
    }

    console.log('\n✨ All tests completed!');
    process.exit(0);
}

// Run all tests
runAllTests();