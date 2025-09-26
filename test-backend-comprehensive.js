// Backend API Test
// This test verifies the backend functionality without external HTTP calls

import fs from 'fs';
import path from 'path';

async function runBackendTests() {
console.log('🚀 Starting comprehensive backend tests...\n');

// Test 1: Check if server files exist
console.log('📁 Testing file structure...');
const serverFiles = [
    'server/index.ts',
    'server/routes.ts', 
    'server/auth.ts',
    'server/db.ts',
    'shared/schema.ts'
];

let filesExist = true;
serverFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        filesExist = false;
    }
});

// Test 2: Check database file
console.log('\n💾 Testing database...');
if (fs.existsSync('campusvault.db')) {
    const stats = fs.statSync('campusvault.db');
    console.log(`✅ Database exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
    console.log('❌ Database file not found');
}

// Test 3: Check package.json and dependencies
console.log('\n📦 Testing dependencies...');
if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Package: ${pkg.name}@${pkg.version}`);
    
    // Check key backend dependencies
    const backendDeps = ['express', 'drizzle-orm', 'better-sqlite3', 'bcrypt'];
    backendDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            console.log(`✅ ${dep}: ${pkg.dependencies[dep]}`);
        } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
            console.log(`✅ ${dep}: ${pkg.devDependencies[dep]} (dev)`);
        } else {
            console.log(`❌ ${dep}: missing`);
        }
    });
}

// Test 4: Try to load and validate TypeScript files
console.log('\n🔧 Testing TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
    try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        console.log('✅ TypeScript config is valid');
        console.log(`   - Target: ${tsconfig.compilerOptions?.target || 'default'}`);
        console.log(`   - Module: ${tsconfig.compilerOptions?.module || 'default'}`);
    } catch (e) {
        console.log('❌ TypeScript config has errors:', e.message);
    }
}

// Test 5: Check environment setup
console.log('\n🌍 Testing environment...');
console.log(`   - Node version: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Arch: ${process.arch}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// Test 6: Test database connection (if possible)
console.log('\n🔌 Testing database connection...');
try {
    // Try to import better-sqlite3 to test database connectivity
    const { default: Database } = await import('better-sqlite3');
    const db = new Database('campusvault.db', { readonly: true });
    
    // Get table list
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`✅ Database connected successfully`);
    console.log(`   - Tables found: ${tables.map(t => t.name).join(', ')}`);
    
    db.close();
} catch (e) {
    console.log(`❌ Database connection failed: ${e.message}`);
}

console.log('\n✨ Backend structure tests completed!');

// Test 7: Environment and Port Testing
console.log('\n🌐 Environment Analysis:');
console.log(`   - PORT env var: ${process.env.PORT || 'not set (defaults to 5000)'}`);
console.log(`   - Current working directory: ${process.cwd()}`);

// Summary
console.log('\n📊 Test Summary:');
console.log(filesExist ? '✅ All critical files present' : '❌ Some files missing');
console.log('ℹ️  To test HTTP endpoints, ensure server is running with: npm run dev');
console.log('ℹ️  Then visit: http://localhost:5000/api/healthcheck');
}

// Run the tests
runBackendTests().catch(console.error);