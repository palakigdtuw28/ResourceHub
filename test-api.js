import fetch from 'node-fetch';
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m'
};

async function waitForServer(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetch(`${BASE_URL}/api/healthcheck`);
            return true;
        } catch (error) {
            console.log(`Waiting for server (attempt ${i + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return false;
}

async function testAPI() {
    try {
        console.log('\n� Starting API tests...');
        
        // Wait for server
        console.log('Waiting for server to be ready...');
        const serverReady = await waitForServer();
        if (!serverReady) {
            throw new Error('Server not ready after multiple attempts');
        }
        
        console.log('\n🔍 Testing Authentication...');
        
        // Test login
        console.log('\nTesting admin login:');
        const loginRes = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'palak123',
                password: 'admin123'
            })
        });
        
        console.log('Login status:', loginRes.status);
        const loginData = await loginRes.json().catch(() => null);
        console.log('Login response:', loginData ? '✅' : '❌');
        
        // Store cookies for protected routes
        const cookies = loginRes.headers.get('set-cookie');
        
        if (loginRes.ok) {
            console.log('\n🔒 Testing Protected Routes:');
            
            const routes = [
                '/api/user',
                '/api/subjects/2/1',
                '/api/resources/list'
            ];
            
            for (const route of routes) {
                const res = await fetch(`${BASE_URL}${route}`, {
                    headers: cookies ? { 'Cookie': cookies } : {}
                });
                console.log(`${route}:`, res.status, res.ok ? '✅' : '❌');
                
                if (res.ok) {
                    const data = await res.json();
                    console.log(`Data received:`, data ? '✅' : '❌');
                }
            }
        }
        
        console.log('\n✨ API tests completed!');
        
    } catch (error) {
        console.error('\n❌ Test error:', error);
    }
}

// Run tests
testAPI();