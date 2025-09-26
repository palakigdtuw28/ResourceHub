// Production Admin Setup Script
// Creates a secure admin user for deployment
import Database from 'better-sqlite3';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

console.log('🔐 Setting up production admin user...');

async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}

async function createProductionAdmin() {
    try {
        const db = new Database('campusvault.db');
        
        // Production admin credentials
        const adminUsername = 'admin';
        const adminPassword = 'CampusVault2025!'; // Strong password for production
        const adminEmail = 'admin@campusvault.com';
        const adminFullName = 'System Administrator';
        
        // Remove any existing admin user
        db.prepare('DELETE FROM users WHERE username = ?').run(adminUsername);
        console.log('🗑️ Removed existing admin user');
        
        // Hash the password with scrypt
        const hashedPassword = await hashPassword(adminPassword);
        console.log('🔒 Password hashed securely');
        
        // Generate secure ID
        const adminId = `admin_prod_${Date.now()}_${randomBytes(8).toString('hex')}`;
        
        // Insert production admin
        const stmt = db.prepare(`
            INSERT INTO users (id, username, email, password, full_name, year, branch, is_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);
        
        stmt.run(adminId, adminUsername, adminEmail, hashedPassword, adminFullName, 4, 'ADMIN', 1);
        
        console.log('✅ Production admin user created successfully!');
        console.log('');
        console.log('🎯 PRODUCTION ADMIN CREDENTIALS:');
        console.log('=' .repeat(40));
        console.log(`Username: ${adminUsername}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`Email: ${adminEmail}`);
        console.log('=' .repeat(40));
        console.log('');
        console.log('⚠️  IMPORTANT SECURITY NOTES:');
        console.log('   1. Save these credentials in a secure location');
        console.log('   2. Change the password after first login');
        console.log('   3. Do not share these credentials');
        console.log('   4. Consider using environment variables for production');
        
        // Also create a backup admin
        const backupUsername = 'backup_admin';
        const backupPassword = 'BackupAdmin2025!';
        const backupHashedPassword = await hashPassword(backupPassword);
        const backupId = `backup_admin_${Date.now()}_${randomBytes(8).toString('hex')}`;
        
        db.prepare('DELETE FROM users WHERE username = ?').run(backupUsername);
        stmt.run(backupId, backupUsername, 'backup@campusvault.com', backupHashedPassword, 'Backup Administrator', 4, 'ADMIN', 1);
        
        console.log('');
        console.log('🔄 BACKUP ADMIN CREDENTIALS:');
        console.log('=' .repeat(40));
        console.log(`Username: ${backupUsername}`);
        console.log(`Password: ${backupPassword}`);
        console.log('=' .repeat(40));
        
        db.close();
        
        // Verify the creation
        await verifyAdminUsers();
        
    } catch (error) {
        console.error('❌ Error creating admin users:', error.message);
    }
}

async function verifyAdminUsers() {
    try {
        const db = new Database('campusvault.db', { readonly: true });
        
        console.log('\n🔍 Verifying admin users...');
        const admins = db.prepare('SELECT username, email, full_name, is_admin, created_at FROM users WHERE is_admin = 1').all();
        
        console.log(`✅ Found ${admins.length} admin users:`);
        admins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.username} (${admin.full_name})`);
            console.log(`      Email: ${admin.email}`);
            console.log(`      Created: ${admin.created_at}`);
        });
        
        db.close();
        
    } catch (error) {
        console.error('❌ Verification error:', error.message);
    }
}

// Create environment file template
async function createEnvTemplate() {
    const envContent = `# CampusVault Environment Configuration
# Copy this to .env and update the values

# Admin Credentials (Change these after first login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CampusVault2025!

# Database Configuration
DATABASE_URL=./campusvault.db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=production

# Security Headers
CORS_ORIGIN=https://yourdomain.com
`;
    
    try {
        const fs = await import('fs');
        fs.default.writeFileSync('.env.template', envContent);
        console.log('\n📝 Created .env.template file');
        console.log('   Copy this to .env and update values for production');
    } catch (error) {
        console.log('\n📝 Environment template:');
        console.log(envContent);
    }
}

// Run the setup
await createProductionAdmin();
await createEnvTemplate();

console.log('\n🎉 Admin setup complete!');
console.log('💡 Next steps for deployment:');
console.log('   1. Save the admin credentials securely');
console.log('   2. Copy .env.template to .env and configure');
console.log('   3. Change admin password after first login');
console.log('   4. Test login before deploying');