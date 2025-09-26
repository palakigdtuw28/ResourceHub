# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the entire project
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose the port your app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S resourcehub -u 1001

# Change ownership of app directory
RUN chown -R resourcehub:nodejs /app
USER resourcehub

# Start the application
CMD ["node", "dist/index.js"]