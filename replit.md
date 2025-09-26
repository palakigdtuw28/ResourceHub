# Overview

FreeSource.ig is a web application for sharing educational resources among students. The platform allows students to upload, organize, and download academic materials like notes, previous year question papers (PYQs), and assignments, organized by year, semester, branch, and subject. The application features user authentication, file upload/download functionality, and a comprehensive resource management system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Storage**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Password Security**: Built-in crypto module with scrypt for password hashing
- **File Upload**: Multer middleware for handling multipart/form-data
- **API Design**: RESTful endpoints with JSON responses

## Database Layer
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with full TypeScript support
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: WebSocket-enabled connection pooling for serverless deployment

## Data Models
- **Users**: Authentication, profile information (year, branch, full name)
- **Subjects**: Academic subjects organized by year, semester, and branch
- **Resources**: Uploaded files with metadata (title, description, type, approval status)
- **Downloads**: Tracking system for download analytics and user activity

## Security Features
- **Authentication**: Session-based auth with secure password hashing
- **File Validation**: Type and size restrictions on uploads (PDF, DOC, PPT only, 10MB limit)
- **Protected Routes**: Frontend route protection for authenticated users only
- **CSRF Protection**: Session-based protection against cross-site request forgery

## File Management
- **Upload Directory**: Local filesystem storage in `/uploads` directory
- **File Types**: Restricted to educational formats (PDF, DOC, DOCX, PPT, PPTX)
- **Size Limits**: 10MB maximum file size per upload
- **Download Tracking**: Analytics for download counts and user activity

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with WebSocket support
- **Connection Pooling**: @neondatabase/serverless for optimized connections

## Authentication Services
- **Passport.js**: Local authentication strategy
- **Session Management**: Express sessions with PostgreSQL store

## UI/UX Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library built on Radix UI

## Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds

## File Processing
- **Multer**: Multipart form data handling for file uploads
- **Node.js Built-ins**: File system operations and crypto for security

## State Management
- **TanStack React Query**: Server state synchronization and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema parsing