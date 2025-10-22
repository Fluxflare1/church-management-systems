deployment-guide.md

```markdown
# Deployment Guide

This guide covers the deployment process for the THOGMi Digital Platform across different environments.

## Deployment Overview

### Environment Strategy
- **Development** - Local development and feature testing
- **Staging** - Pre-production testing and client review
- **Production** - Live system serving real users

### Deployment Architecture
```

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│Developer     │ -> │   Staging        │ -> │   Production    │
│Environment   │    │   Environment    │    │   Environment   │
└─────────────────┘└──────────────────┘    └─────────────────┘
│                       │                       │
▼                       ▼                       ▼
┌─────────────────┐┌──────────────────┐    ┌─────────────────┐
│Local Docker  │    │   Cloud Staging  │    │   Cloud Prod    │
│or Manual     │    │   Server/Cluster │    │   Server/Cluster│
└─────────────────┘└──────────────────┘    └─────────────────┘

```

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Server with minimum 4GB RAM, 2 CPU cores
- [ ] PostgreSQL 15+ database
- [ ] Redis 7.0+ instance
- [ ] Domain names configured (thogmi.org, api.thogmi.org)
- [ ] SSL certificates provisioned
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

### Configuration Checklist
- [ ] Environment variables set
- [ ] Database migrations prepared
- [ ] Static files collected
- [ ] Media storage configured
- [ ] SSL certificates installed
- [ ] CDN configured (if applicable)
- [ ] Backup procedures tested

## Staging Deployment

### 1. Server Preparation

#### Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Directory Structure

```bash
# Create application directory
sudo mkdir -p /opt/thogmi-platform
sudo chown $USER:$USER /opt/thogmi-platform
cd /opt/thogmi-platform

# Clone repository
git clone https://github.com/thogmi/church-platform.git .
git checkout staging
```

2. Environment Configuration

Create Environment File

```bash
cp .env.example .env
nano .env
```

Staging Environment Variables

```bash
# Application
DEBUG=False
DJANGO_SETTINGS_MODULE=core.settings.staging
SECRET_KEY=your-staging-secret-key
ALLOWED_HOSTS=staging.thogmi.org,api-staging.thogmi.org

# Database
DATABASE_URL=postgresql://thogmi_staging:password@localhost:5432/thogmi_staging
REDIS_URL=redis://localhost:6379/1

# External Services
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
STRIPE_SECRET_KEY=sk_test_...
PAYSTACK_SECRET_KEY=psk_test_...

# URLs
FRONTEND_URL=https://staging.thogmi.org
BACKEND_URL=https://api-staging.thogmi.org
```

3. Database Setup

PostgreSQL Configuration

```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE thogmi_staging;"
sudo -u postgres psql -c "CREATE USER thogmi_staging WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE thogmi_staging TO thogmi_staging;"

# Enable required extensions
sudo -u postgres psql -d thogmi_staging -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d thogmi_staging -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
```

4. Docker Deployment

Start Services

```bash
# Build and start containers
docker-compose -f docker-compose.staging.yml up -d --build

# Check service status
docker-compose -f docker-compose.staging.yml ps

# View logs
docker-compose -f docker-compose.staging.yml logs -f
```

Run Initial Setup

```bash
# Run migrations
docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.staging.yml exec backend python manage.py createsuperuser

# Load initial data
docker-compose -f docker-compose.staging.yml exec backend python manage.py loaddata initial_churches
docker-compose -f docker-compose.staging.yml exec backend python manage.py loaddata initial_groups
```

5. NGINX Configuration

Staging NGINX Config

```nginx
# /etc/nginx/sites-available/staging.thogmi.org
server {
    listen 80;
    server_name staging.thogmi.org api-staging.thogmi.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.thogmi.org api-staging.thogmi.org;
    
    ssl_certificate /etc/letsencrypt/live/staging.thogmi.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.thogmi.org/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Frontend application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /opt/thogmi-platform/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /opt/thogmi-platform/media/;
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

Production Deployment

1. Production Server Setup

Server Requirements

· CPU: 4+ cores
· RAM: 8GB+
· Storage: 100GB+ SSD
· OS: Ubuntu 22.04 LTS

Security Hardening

```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

2. Production Environment

Environment Variables

```bash
# Application
DEBUG=False
DJANGO_SETTINGS_MODULE=core.settings.production
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=thogmi.org,www.thogmi.org,api.thogmi.org

# Database
DATABASE_URL=postgresql://thogmi_prod:secure_password@localhost:5432/thogmi_production
REDIS_URL=redis://localhost:6379/0

# External Services (Production keys)
SENDGRID_API_KEY=your-production-sendgrid-key
TWILIO_ACCOUNT_SID=your-production-twilio-sid
TWILIO_AUTH_TOKEN=your-production-twilio-token
STRIPE_SECRET_KEY=sk_live_...
PAYSTACK_SECRET_KEY=psk_live_...

# URLs
FRONTEND_URL=https://thogmi.org
BACKEND_URL=https://api.thogmi.org
```

3. Database Configuration

Production PostgreSQL

```bash
# Create production database
sudo -u postgres psql -c "CREATE DATABASE thogmi_production;"
sudo -u postgres psql -c "CREATE USER thogmi_prod WITH PASSWORD 'very_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE thogmi_production TO thogmi_prod;"

# Configure PostgreSQL for production
sudo nano /etc/postgresql/15/main/postgresql.conf

# Important settings:
# max_connections = 100
# shared_buffers = 2GB
# effective_cache_size = 6GB
# work_mem = 16MB
```

4. Production Docker Deployment

Production Compose File

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/production.conf:/etc/nginx/nginx.conf
      - ./staticfiles:/static
      - ./media:/media
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.production
    environment:
      - DATABASE_URL=postgresql://thogmi_prod:${DB_PASSWORD}@db:5432/thogmi_production
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./media:/app/media
    depends_on:
      - db
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.production
    restart: unless-stopped

  celery:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.production
    command: celery -A core worker -l info
    environment:
      - DATABASE_URL=postgresql://thogmi_prod:${DB_PASSWORD}@db:5432/thogmi_production
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  celery-beat:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.production
    command: celery -A core beat -l info
    environment:
      - DATABASE_URL=postgresql://thogmi_prod:${DB_PASSWORD}@db:5432/thogmi_production
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=thogmi_production
      - POSTGRES_USER=thogmi_prod
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

Deploy Production

```bash
# Pull latest changes
git checkout main
git pull origin main

# Deploy with production compose
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations
docker-compose -f docker-compose.production.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput

# Restart services
docker-compose -f docker-compose.production.yml restart
```

5. SSL Certificate

Let's Encrypt Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d thogmi.org -d www.thogmi.org -d api.thogmi.org

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

Deployment Automation

GitHub Actions CI/CD

Staging Deployment Workflow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/thogmi-platform
            git pull origin staging
            docker-compose -f docker-compose.staging.yml up -d --build
            docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate
            docker-compose -f docker-compose.staging.yml exec backend python manage.py collectstatic --noinput
```

Manual Deployment Scripts

Quick Deploy Script

```bash
#!/bin/bash
# scripts/deploy.sh

echo "Starting deployment..."

# Pull latest changes
git pull origin $1

# Build and start containers
docker-compose -f docker-compose.$1.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.$1.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.$1.yml exec backend python manage.py collectstatic --noinput

# Restart services
docker-compose -f docker-compose.$1.yml restart

echo "Deployment completed successfully!"
```

Post-Deployment Verification

Health Checks

```bash
# Application health
curl https://api.thogmi.org/health/

# Database connection
docker-compose exec backend python manage.py check --database default

# Celery status
docker-compose exec backend celery -A core inspect ping

# Service status
docker-compose ps
```

Performance Testing

```bash
# Basic load test
docker-compose exec backend python manage.py test --tag=performance

# API endpoint testing
./scripts/test_endpoints.sh
```

Rollback Procedures

Database Rollback

```bash
# Revert last migration
docker-compose exec backend python manage.py migrate app_name previous_migration

# Restore database backup
./scripts/restore_backup.sh latest_backup.sql
```

Application Rollback

```bash
# Revert to previous git commit
git log --oneline -5
git reset --hard <previous_commit_hash>

# Restart with previous version
docker-compose -f docker-compose.production.yml up -d --build
```

Monitoring and Maintenance

Log Management

```bash
# View application logs
docker-compose logs -f backend

# View nginx logs
tail -f /var/log/nginx/access.log

# Set up log rotation
sudo nano /etc/logrotate.d/thogmi-platform
```

Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

# Database backup
docker-compose exec db pg_dump -U thogmi_prod thogmi_production > backup_$(date +%Y%m%d).sql

# Media files backup
tar -czf media_backup_$(date +%Y%m%d).tar.gz media/

# Upload to cloud storage
# (Implement based on your cloud provider)
```

Troubleshooting

Common Deployment Issues

Database Connection Errors

```bash
# Check database status
docker-compose logs db

# Test connection
docker-compose exec backend python manage.py dbshell
```

Static Files Not Loading

```bash
# Recollect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Check nginx configuration
sudo nginx -t
```

SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

This deployment guide ensures a smooth and reliable deployment process for the THOGMi Digital Platform across all environments.

```
