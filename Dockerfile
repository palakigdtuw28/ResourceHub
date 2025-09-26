# Use Node.js 20 Alpine (required for dependencies)
FROM node:20-alpine

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++ 

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy the entire project
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Create uploads directory and set permissions
RUN mkdir -p uploads

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S resourcehub -u 1001

# Change ownership of app directory (including database and uploads)
RUN chown -R resourcehub:nodejs /app

# Switch to non-root user
USER resourcehub

# Expose the port your app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]