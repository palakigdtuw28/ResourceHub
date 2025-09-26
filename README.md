# ResourceHub

ResourceHub is a comprehensive web application designed for sharing educational resources among college students. The platform allows students to upload, organize, and download academic materials like notes, previous year question papers (PYQs), and assignments, organized by year, semester, branch, and subject.

## 🌟 Features

### 📚 Resource Management
- **Upload & Download**: Share notes, books, question papers, and assignments
- **Organized Structure**: Resources organized by year, semester, branch, and subject
- **File Support**: Support for PDF, DOCX, PPT, and other document formats
- **Large File Support**: Up to 100MB file uploads

### 👥 User Management
- **Student Registration**: Easy account creation with branch selection
- **Admin Panel**: Administrative controls for content moderation
- **Profile Management**: Update profile details and change passwords
- **Branch-Specific Access**: Students only see resources from their branch

### 🔐 Security & Authentication
- **Secure Login**: bcrypt password hashing
- **Session Management**: Persistent login sessions
- **Admin Controls**: Protected admin routes and functions
- **Data Protection**: Secure file storage and user data handling

### 🎯 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Updates**: Instant feedback on uploads and downloads
- **Search & Filter**: Easy resource discovery

## 🏗️ Technical Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: bcryptjs for password hashing
- **File Upload**: Multer middleware
- **Session Management**: Express sessions

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation

### Database Schema
- **Users**: Student and admin accounts with branch associations
- **Subjects**: Course subjects linked to academic structure
- **Resources**: Files with metadata and download tracking
- **Downloads**: Activity logs for analytics

## 📋 Supported Branches

- Computer Science and Engineering (CSE)
- Artificial Intelligence and Machine Learning (AIML)
- Electronics and Communication Engineering (ECE)
- Electronics and Communication Engineering with AI (ECE AI)
- Mechanical and Automation Engineering (MAE)
- Mechanical Engineering

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resourcehub.git
   cd resourcehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

### Project Structure

```
resourcehub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication middleware
│   ├── storage.ts        # Database operations
│   └── db.ts            # Database connection
├── shared/               # Shared TypeScript schemas
├── migrations/           # Database migrations
└── uploads/             # File storage directory
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=./resourcehub.db
SESSION_SECRET=your-secret-key-here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### Admin Account

The default admin account:
- **Username**: `palak123`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login!

## 📱 Usage Guide

### For Students

1. **Register**: Create an account with your college details
2. **Browse**: Navigate by year → semester → subject
3. **Download**: Access resources uploaded by others
4. **Upload**: Share your notes and materials
5. **Profile**: Manage your uploads and account settings

### For Admins

1. **Login**: Use admin credentials to access admin features
2. **Subject Management**: Create, edit, or delete subjects
3. **Content Moderation**: Monitor and manage uploaded resources
4. **User Management**: View user activity and statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**@palakigdtuw28**

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better resource sharing in educational institutions
- Special thanks to the open-source community

---

**ResourceHub** - Making educational resources accessible to all students! 🎓