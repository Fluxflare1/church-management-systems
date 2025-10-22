2. README.md

```markdown
# THOGMi Digital Platform

A comprehensive church management and engagement system built with modern web technologies for The House of God Ministry.

## 🚀 Overview

The THOGMi Digital Platform provides a unified digital ecosystem enabling seamless management of multiple branches, member relationships, guest acquisition, and church operations across a global ministry network.

## 🏗️ System Architecture

```

┌─────────────────────────────────────────────────────────────────────────┐
│CHURCH MEMBER ACQUISITION SYSTEM (CMAS)                 │
│Strategic Orchestration & Analytics Layer                │
└───────────────────────────────┬─────────────────────────────────────────┘
│ Orchestrates & Monitors
▼
┌───────────────────────────────────┬───────────────────────────────────┐
││                                   │
│[ Guest Management ]     │       [ Member Management ]   │
│(Operational - "The Funnel")    │   (Operational - "The Database")  │
└───────────────────────────────────┴───────────────────────────────────┘

```

## 🎯 Core Features

### Platform Components
- **Public Website** (`thogmi.org`) - Information hub and guest entry point
- **Member Web/Mobile App** - Engagement platform for community
- **Branch Management Portal** - Operational tools for local staff
- **Global Admin Panel** - Central oversight for leadership
- **Church Member Acquisition System (CMAS)** - Strategic growth orchestration

### Key Modules
- Multi-branch hierarchical management
- Guest-to-Member journey tracking
- Event management & live streaming
- Financial management & online giving
- Asset & inventory management
- Communications & messaging
- Appointment booking system
- Transportation management

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **TailwindCSS** + **ShadCN/UI** for styling
- **React Native** for mobile applications

### Backend
- **Django 5.0** + Django REST Framework
- **PostgreSQL 15** database
- **Celery** + **Redis** for task queue

### Infrastructure
- **Docker** containerization
- **NGINX** web server
- **GitHub Actions** CI/CD

### Integrations
- **Paystack** & **Stripe** for payments
- **Twilio** for SMS
- **SendGrid** for email
- **Google Maps** API

## 📁 Project Structure

```

church-platform/
├──📁 apps/
│├── 📁 web/                 # Next.js applications
│├── 📁 backend/             # Django API
│└── 📁 mobile/              # React Native app
├──📁 docker/                  # Container configurations
├──📁 docs/                    # Documentation
└──📁 scripts/                 # Deployment scripts

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 15
- Docker & Docker Compose

### Development Setup
```bash
# Clone repository
git clone https://github.com/thogmi/church-platform.git
cd church-platform

# Setup using Docker (recommended)
docker-compose up -d

# Or setup manually
# Refer to docs/development-setup.md for detailed instructions
```

Environment Configuration

Copy .env.example to .env and configure:

· Database credentials
· Third-party API keys
· Church-specific settings

📚 Documentation

· Architecture Overview
· API Documentation
· Development Guide
· Deployment Guide
· Module Specifications

👥 User Roles & Permissions

The platform supports hierarchical role-based access:

· Guest - Limited app access
· Member - Full member features
· Follow-up Team - Guest management
· Evangelism Team - CMAS access
· Department Heads - Ministry management
· Branch Managers - Local branch oversight
· Platform Admins - System-wide control

🔄 Development Workflow

1. Feature Development: Create feature branches from develop
2. Testing: All changes must include tests
3. Code Review: PRs require review before merge
4. Deployment: Automated deployment to staging/production

🤝 Contributing

We welcome contributions from THOGMi technical team members:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

📄 License

This project is proprietary and developed specifically for The House of God Ministry. All rights reserved.

📞 Support

· Technical Issues: Create an issue in GitHub
· Feature Requests: Use GitHub discussions
· Urgent Support: Contact platform admin team

🙏 Acknowledgments

Built with prayer and dedication for the advancement of God's kingdom through technology.
