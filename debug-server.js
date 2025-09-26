import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { setupAuth } from './server/auth';
import { db } from './server/db';
import { users } from './shared/schema';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Set up authentication
setupAuth(app);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
app.listen(5000, async () => {
  console.log('Test server running on port 5000');
  
  try {
    // Check if admin user exists
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'palak123')
    });
    
    console.log('\nAdmin user status:', adminUser ? 'Found' : 'Not found');
    if (adminUser) {
      console.log('Username:', adminUser.username);
      console.log('Has password:', !!adminUser.password);
      console.log('Password format:', adminUser.password);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
});