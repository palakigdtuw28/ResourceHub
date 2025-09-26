# CampusVault Setup Guide

## Prerequisites
- Node.js installed
- A Neon database (or local PostgreSQL)

## Setup Steps

1. **Database Setup**:
   - Visit https://console.neon.tech/
   - Create a free account and new project
   - Copy your connection string from the dashboard
   - Update the DATABASE_URL in your .env file

2. **Install Dependencies** (Already Done):
   ```bash
   npm install
   ```

3. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Your Application Structure
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **UI**: Tailwind CSS + Radix UI components

## Ports
- Development server will run on port 5000 (or PORT environment variable)
- The server handles both API routes and serves the React frontend

## Next Steps
1. Get your DATABASE_URL from Neon
2. Update the .env file
3. Run `npm run db:push` to set up your database schema
4. Run `npm run dev` to start the application