# ResourceHub Deployment Guide

This guide covers different deployment options for ResourceHub.

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and npm
- Git (for version control)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/resourcehub.git
cd resourcehub

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Access at: http://localhost:5173 (frontend) and http://localhost:5000 (backend)

## 🌐 Production Deployment

### Option 1: VPS/Cloud Server (Recommended)

#### Requirements
- Ubuntu/CentOS server with 1GB+ RAM
- Node.js 18+, nginx, PM2
- Domain name (optional)

#### Setup Steps

1. **Server Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install nginx
   sudo apt-get install nginx
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/resourcehub.git
   cd resourcehub
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Set up environment
   cp .env.example .env
   # Edit .env for production
   
   # Initialize database
   npm run db:push
   
   # Start with PM2
   pm2 start dist/index.js --name resourcehub
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/resourcehub
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Setup (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: Heroku

1. **Prepare Application**
   ```bash
   # Create Procfile
   echo "web: node dist/index.js" > Procfile
   
   # Update package.json
   # Add "heroku-postbuild": "npm run build" to scripts
   ```

2. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI
   # Create Heroku app
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-secret-here
   
   # Deploy
   git push heroku main
   ```

### Option 3: Vercel (Frontend Only)

For frontend-only deployment with local backend:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   CMD ["node", "dist/index.js"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
       volumes:
         - ./uploads:/app/uploads
         - ./resourcehub.db:/app/resourcehub.db
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## 🔐 Production Security Checklist

### Environment Variables
- [ ] Change default admin credentials
- [ ] Use strong SESSION_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain

### Server Security
- [ ] Enable firewall (UFW/iptables)
- [ ] Use SSL/HTTPS
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor server resources

### Application Security
- [ ] File upload validation
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Error logging (not exposure)
- [ ] Session security

## 📊 Monitoring & Maintenance

### PM2 Monitoring
```bash
# Check status
pm2 status

# View logs
pm2 logs resourcehub

# Restart app
pm2 restart resourcehub

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Create backup
cp resourcehub.db "resourcehub_backup_$(date +%Y%m%d_%H%M%S).db"

# Automated backup (crontab)
0 2 * * * cp /path/to/resourcehub.db "/path/to/backups/resourcehub_$(date +\%Y\%m\%d).db"
```

### Log Rotation
```bash
# Install logrotate configuration
sudo tee /etc/logrotate.d/resourcehub << EOF
/home/ubuntu/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 ubuntu ubuntu
}
EOF
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. **Permission denied (uploads)**
   ```bash
   chmod 755 uploads/
   chown -R www-data:www-data uploads/
   ```

3. **Database locked**
   ```bash
   # Stop application
   pm2 stop resourcehub
   
   # Remove lock files
   rm resourcehub.db-wal resourcehub.db-shm
   
   # Restart
   pm2 start resourcehub
   ```

4. **Build failures**
   ```bash
   # Clear cache
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Performance Optimization

1. **Enable gzip compression in nginx**
2. **Set up CDN for static files**
3. **Optimize database with indexes**
4. **Monitor memory usage**
5. **Set up caching headers**

## 📞 Support

- Create an issue on GitHub for bugs
- Check existing documentation
- Review logs for error details
- Test in development environment first

---

Happy deploying! 🚀