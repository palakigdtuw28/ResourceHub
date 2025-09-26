# 🐳 Docker Deployment Guide for ResourceHub

## Quick Start with Docker

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Clone your repository (if not already done)
git clone https://github.com/palakigdtuw28/ResourceHub.git
cd ResourceHub

# Build and start the application
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down
```

### 2. Build and Run with Docker Commands

```bash
# Build the Docker image
docker build -t resourcehub .

# Create directories for data persistence
mkdir -p data uploads

# Run the container
docker run -d \
  --name resourcehub-app \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -e NODE_ENV=production \
  -e SESSION_SECRET=your-secure-secret-here \
  resourcehub

# View logs
docker logs -f resourcehub-app

# Stop the container
docker stop resourcehub-app
docker rm resourcehub-app
```

## 🌍 Access Your Application

Once running, your ResourceHub application will be available at:
- **URL**: http://localhost:5000
- **Admin Login**: 
  - Username: `palak123`
  - Password: `admin123` (change this immediately!)

## 🔧 Configuration

### Environment Variables

The Docker setup uses these key environment variables:

- `NODE_ENV=production`
- `PORT=5000`
- `SESSION_SECRET` - **MUST be changed for security!**
- `DATABASE_URL=./resourcehub.db`
- `UPLOAD_DIR=./uploads`

### Data Persistence

Docker volumes are configured for:
- **Database**: `./data/resourcehub.db` (SQLite database file)
- **Uploads**: `./uploads` (User uploaded files)

## 🚀 Production Deployment

### Deploy on Cloud Platforms

#### 1. DigitalOcean/AWS/Azure VM
```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone https://github.com/palakigdtuw28/ResourceHub.git
cd ResourceHub
docker-compose up -d --build
```

#### 2. Docker Hub Deployment
```bash
# Build and tag for Docker Hub
docker build -t yourusername/resourcehub:latest .
docker push yourusername/resourcehub:latest

# Deploy anywhere with:
docker run -d -p 5000:5000 yourusername/resourcehub:latest
```

## 🔒 Security Checklist

### Before Production:
- [ ] Change `SESSION_SECRET` to a secure random string
- [ ] Change default admin password
- [ ] Set up reverse proxy (nginx) for HTTPS
- [ ] Configure firewall rules
- [ ] Set up regular backups of database and uploads
- [ ] Monitor container logs and resources

### Production docker-compose.yml Example:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=your-very-secure-secret-here
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

## 🔍 Troubleshooting

### Common Issues:

1. **Permission denied for uploads**:
   ```bash
   sudo chown -R 1001:1001 uploads/
   ```

2. **Database locked**:
   ```bash
   docker-compose down
   sudo rm data/resourcehub.db-wal data/resourcehub.db-shm
   docker-compose up -d
   ```

3. **Port already in use**:
   ```bash
   # Change port in docker-compose.yml or stop conflicting service
   sudo lsof -ti:5000 | xargs sudo kill -9
   ```

### View Application Status:
```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs app

# Access container shell
docker-compose exec app sh

# Monitor resource usage
docker stats resourcehub-app
```

## 📊 Monitoring

### Basic Health Check:
```bash
# Check if app is responding
curl http://localhost:5000/api/health
```

### Log Management:
```bash
# Rotate logs to prevent disk space issues
docker-compose logs --tail=100 app > app.log
```

## 🔄 Updates and Maintenance

### Update Application:
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Data:
```bash
# Backup database and uploads
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/
```

---

**Your ResourceHub is now running in Docker! 🎉**

Access your application at http://localhost:5000 and start sharing educational resources!