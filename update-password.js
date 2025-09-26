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

async function updateUserPassword() {
    try {
        const username = 'palak123';
        const newPassword = 'admin123';
        
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update the user's password
        await db
            .update(users)
            .set({ 
                password: hashedPassword,
                updatedAt: new Date().toISOString()
            })
            .where(users.username === username);
        
        // Verify the update
        const user = await db
            .select()
            .from(users)
            .where(users.username === username)
            .get();
        
        console.log('Password updated successfully');
        console.log('Username:', username);
        console.log('New password hash length:', user.password.length);
        console.log('Has salt separator:', user.password.includes('.'));
    } catch (error) {
        console.error('Error updating password:', error);
    }
}

updateUserPassword();