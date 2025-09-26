// Simple backend test using basic HTTP requests
import http from 'http';

const BASE_URL = 'http://localhost:5000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        
        req.on('error', (err) => {
            console.log('Request error:', err.message);
            reject(err);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testBackend() {
    console.log('🚀 Starting simple backend tests...');
    
    try {
        // Test 1: Check if server is running
        console.log('\n📡 Testing server connection...');
        const healthCheck = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/health',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (healthCheck.statusCode === 200) {
            console.log('✅ Server is running and responding');
        } else {
            console.log(`❌ Server responded with status: ${healthCheck.statusCode}`);
        }
        
        // Test 2: Test login endpoint
        console.log('\n🔒 Testing login endpoint...');
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };
        
        const loginResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, loginData);
        
        console.log(`Login response status: ${loginResponse.statusCode}`);
        console.log(`Login response body: ${loginResponse.body}`);
        
        // Test 3: Test subjects endpoint
        console.log('\n📚 Testing subjects endpoint...');
        const subjectsResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/subjects',
            method: 'GET',
            headers: {
                'Cookie': loginResponse.headers['set-cookie'] || ''
            }
        });
        
        console.log(`Subjects response status: ${subjectsResponse.statusCode}`);
        console.log(`Subjects response: ${subjectsResponse.body.substring(0, 200)}...`);
        
        // Test 4: Test users endpoint (admin only)
        console.log('\n👥 Testing users endpoint...');
        const usersResponse = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users',
            method: 'GET',
            headers: {
                'Cookie': loginResponse.headers['set-cookie'] || ''
            }
        });
        
        console.log(`Users response status: ${usersResponse.statusCode}`);
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
    
    console.log('\n✨ Backend tests completed!');
}

// Run the tests
testBackend();