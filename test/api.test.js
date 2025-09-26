import { expect } from 'chai';
import { db } from '../server/db.js';
import { users, subjects } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test Data
const testUser = {
    username: 'test_user',
    password: 'test123',
    email: 'test@example.com',
    fullName: 'Test User',
    year: 2,
    branch: 'CSE',
    isAdmin: false
};

const testSubject = {
    name: 'Test Subject',
    code: 'TEST101',
    year: 2,
    semester: 1,
    branch: 'CSE',
    icon: 'book'
};

// Helper functions
async function setupTestDatabase() {
    // Create admin user if it doesn't exist
    const admin = await db.select()
        .from(users)
        .where(eq(users.username, 'palak123'))
        .get();
        
    if (!admin) {
        await db.insert(users).values({
            username: 'palak123',
            password: '$2b$10$K7L6w6CkG8tXtIZPe.MTVOzgN1of7Z5tY5LH3d9d9q3sR5uZ2z7Uu', // admin123
            email: 'palak@admin.com',
            fullName: 'Admin User',
            year: 4,
            branch: 'CSE',
            isAdmin: true
        });
    }
}

// Test Suite
describe('CampusVault API Tests', () => {
    let adminCookies = '';
    let userCookies = '';
    
    before(async () => {
        // Set up test database
        await setupTestDatabase();
    });

    // Database Tests
    describe('Database Connection', () => {
        it('should connect to the database', async () => {
            const result = await db.select().from(users).get();
            expect(result).to.exist;
        });

        it('should have admin user', async () => {
            const admin = await db.select()
                .from(users)
                .where(eq(users.username, 'palak123'))
                .get();
            
            expect(admin).to.exist;
            expect(admin.isAdmin).to.be.true;
        });
    });

    // Authentication Tests
    describe('Authentication', () => {
        it('should login as admin', async () => {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'palak123',
                    password: 'admin123'
                })
            });

            expect(response.status).to.equal(200);
            adminCookies = response.headers.get('set-cookie');
            expect(adminCookies).to.exist;
        });

        it('should reject invalid login', async () => {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'invalid',
                    password: 'invalid'
                })
            });

            expect(response.status).to.equal(401);
        });
    });

    // Protected Routes Tests
    describe('Protected Routes', () => {
        it('should access user profile with valid session', async () => {
            const response = await fetch(`${BASE_URL}/api/user`, {
                headers: {
                    'Cookie': adminCookies
                }
            });

            expect(response.status).to.equal(200);
            const user = await response.json();
            expect(user).to.have.property('username');
        });

        it('should block access without session', async () => {
            const response = await fetch(`${BASE_URL}/api/user`);
            expect(response.status).to.equal(401);
        });
    });

    // Subject Management Tests
    describe('Subject Management', () => {
        it('should list subjects', async () => {
            const response = await fetch(`${BASE_URL}/api/subjects/2/1`, {
                headers: {
                    'Cookie': adminCookies
                }
            });

            expect(response.status).to.equal(200);
            const subjects = await response.json();
            expect(Array.isArray(subjects)).to.be.true;
        });

        it('should create new subject (admin only)', async () => {
            const response = await fetch(`${BASE_URL}/api/subjects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': adminCookies
                },
                body: JSON.stringify(testSubject)
            });

            expect(response.status).to.equal(201);
            const subject = await response.json();
            expect(subject).to.have.property('code', testSubject.code);
        });
    });
});