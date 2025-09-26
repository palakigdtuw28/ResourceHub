import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString('hex')}.${salt}`;
}

async function resetAdmin() {
    try {
        // Delete existing admin user
        await db.delete(users).where(users.username === 'admin');
        
        // Create new admin user
        const hashedPassword = await hashPassword('admin123');
        await db.insert(users).values({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@campus.com',
            isAdmin: true,
            fullName: 'Admin User',
            year: 4,
            branch: 'CSE'
        });
        
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

resetAdmin();