development-setup.md

```markdown
# Development Environment Setup

This guide will help you set up a local development environment for the THOGMi Digital Platform.

## Prerequisites

### Required Software
- **Node.js** 18.0 or higher
- **Python** 3.11 or higher
- **PostgreSQL** 15 or higher
- **Redis** 7.0 or higher
- **Git** 2.25 or higher

### Optional but Recommended
- **Docker** & **Docker Compose** (for containerized setup)
- **VS Code** with recommended extensions
- **Postman** or **Insomnia** for API testing

## Quick Start (Docker Recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/thogmi/church-platform.git
cd church-platform
```

2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

3. Start Services with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

4. Run Initial Setup

```bash
# Access backend container
docker-compose exec backend bash

# Run database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Seed initial data (optional)
python manage.py seed_data
```

5. Access Applications

· Frontend: http://localhost:3000
· Backend API: http://localhost:8000
· Admin Panel: http://localhost:8000/admin
· API Documentation: http://localhost:8000/api/docs

Manual Setup (Advanced)

1. Backend Setup

Database Configuration

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE thogmi_platform;
CREATE USER thogmi_dev WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE thogmi_platform TO thogmi_dev;
\q
```

Python Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd apps/backend
pip install -r requirements/dev.txt

# Environment variables
export DATABASE_URL="postgresql://thogmi_dev:your_password@localhost:5432/thogmi_platform"
export REDIS_URL="redis://localhost:6379/0"
export SECRET_KEY="your-secret-key-here"
export DEBUG=True
```

Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data
python manage.py loaddata initial_churches
python manage.py loaddata initial_groups
```

Start Backend Services

```bash
# Start Django development server
python manage.py runserver

# Start Celery worker (new terminal)
celery -A core worker -l info

# Start Celery beat (new terminal)
celery -A core beat -l info
```

2. Frontend Setup

Web Applications

```bash
# Install dependencies
cd apps/web
npm install

# Environment setup
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

Mobile App (React Native)

```bash
# Install dependencies
cd apps/mobile
npm install

# iOS (Mac only)
cd ios
pod install
cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

3. External Services Setup

Redis

```bash
# Install Redis
# Ubuntu/Debian
sudo apt update && sudo apt install redis-server

# macOS
brew install redis
brew services start redis

# Verify installation
redis-cli ping  # Should return "PONG"
```

Email (Development)

```bash
# For development, use console backend
export EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend"

# Or use MailHog for testing
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

Project Structure Overview

```
church-platform/
├── 📁 apps/
│   ├── 📁 web/                 # Next.js frontend applications
│   │   ├── 📁 public-site/     # thogmi.org website
│   │   ├── 📁 member-portal/   # Member web app
│   │   ├── 📁 branch-admin/    # Branch management
│   │   └── 📁 global-admin/    # Central administration
│   │
│   ├── 📁 backend/             # Django REST API
│   │   ├── 📁 core/            # Project settings
│   │   ├── 📁 authentication/  # Auth system
│   │   ├── 📁 churches/        # Branch management
│   │   ├── 📁 cmas/            # Member acquisition system
│   │   └── ... (other modules)
│   │
│   └── 📁 mobile/              # React Native app
│       ├── 📁 ios/             # iOS specific code
│       ├── 📁 android/         # Android specific code
│       └── 📁 src/             # Shared React code
│
├── 📁 docker/                  # Docker configurations
│   ├── nginx.conf              # Web server config
│   ├── django/                 # Backend Dockerfile
│   ├── frontend/               # Frontend Dockerfile
│   └── postgres/               # Database init scripts
│
├── 📁 docs/                    # Documentation
└── 📁 scripts/                 # Deployment and utility scripts
```

Common Development Tasks

Running Tests

```bash
# Backend tests
cd apps/backend
python manage.py test

# Frontend tests
cd apps/web
npm run test

# All tests with coverage
./scripts/run_tests.sh
```

Database Operations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
./scripts/reset_db.sh
```

Code Quality

```bash
# Backend linting
flake8 .
black .
isort .

# Frontend linting
cd apps/web
npm run lint
npm run format
```

Environment Variables

Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/thogmi_platform
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# External Services
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
STRIPE_SECRET_KEY=your-stripe-secret
PAYSTACK_SECRET_KEY=your-paystack-secret

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=dev@thogmi.org
```

Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

Troubleshooting

Common Issues

Port Already in Use

```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U thogmi_dev -d thogmi_platform
```

Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Getting Help

1. Check the project documentation in /docs
2. Search existing GitHub issues
3. Contact the development team on Slack/Teams
4. Create a new issue with detailed error information

Next Steps

After setup, proceed to:

1. API Documentation - Understand the API structure
2. Module Specifications - Learn about specific features
3. Contributing Guide - Development workflow
4. Testing Guide - Writing and running tests

Your development environment is now ready! 🎉

```
