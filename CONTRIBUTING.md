# Contributing to ResourceHub

Thank you for your interest in contributing to ResourceHub! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub Issues tab to report bugs or request features
- Provide detailed information about the issue
- Include steps to reproduce if reporting a bug
- Use appropriate labels (bug, enhancement, question, etc.)

### Submitting Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/resourcehub.git
   cd resourcehub
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run dev
   npm run check
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature" # or "fix: resolve issue"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add type annotations where helpful
- Use ESLint and Prettier for code formatting

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop typing with TypeScript
- Keep components focused and reusable

### Database
- Use Drizzle ORM for database operations
- Follow the existing schema patterns
- Include proper foreign key relationships
- Add migrations for schema changes

### API Routes
- Follow RESTful conventions
- Include proper error handling
- Add appropriate status codes
- Document new endpoints

## 🏗️ Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Project Structure Guidelines

### Frontend (client/)
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # Base UI components (buttons, inputs, etc.)
│   │   └── layout/    # Layout components (header, sidebar)
│   ├── pages/         # Application pages/routes
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   └── types/         # TypeScript type definitions
```

### Backend (server/)
```
server/
├── index.ts          # Server entry point
├── routes.ts         # API route definitions
├── auth.ts           # Authentication middleware
├── storage.ts        # Database operations
└── db.ts            # Database connection setup
```

## 🔍 Code Review Process

### What We Look For
- **Functionality**: Does the code work as expected?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance concerns?
- **Security**: Does the code follow security best practices?
- **Testing**: Are there appropriate tests for the changes?
- **Documentation**: Is the code properly documented?

### Review Criteria
- Code follows existing patterns and conventions
- No breaking changes without proper migration path
- Proper error handling and edge case coverage
- Responsive design for frontend changes
- Database changes include proper migrations

## 🚀 Feature Requests

When requesting new features:

1. **Check Existing Issues**: Make sure the feature hasn't been requested already
2. **Describe the Use Case**: Explain why this feature would be valuable
3. **Provide Details**: Include mockups, examples, or detailed descriptions
4. **Consider Implementation**: Think about how it might fit into the existing architecture

## 🐛 Bug Reports

When reporting bugs:

1. **Describe the Bug**: Clear and concise description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Screenshots**: If applicable, add screenshots
5. **Environment**: Include browser, OS, and app version information

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 💬 Getting Help

- Create an issue for bug reports or feature requests
- Join discussions in existing issues
- Check the README.md for setup instructions

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation where applicable

Thank you for contributing to ResourceHub! 🚀