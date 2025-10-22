architecture.md

```markdown
# System Architecture

## Overview

The THOGMi Digital Platform is built as a modular, scalable system supporting hierarchical church management across multiple branches worldwide. The architecture follows a layered approach with clear separation of concerns.

## High-Level Architecture

```

┌─────────────────────────────────────────────────────────────────────────┐
│CLIENT APPLICATIONS                              │
├─────────────────┐┌──────────────────┐ ┌───────────────────────┐
│PUBLIC SITE   │ │ MEMBER WEB/MOBILE│ │   ADMIN PORTALS       │
│(Next.js)     │ │      APP         │ │ (Branch & Global)     │
└─────────────────┘└──────────────────┘ └───────────────────────┘
│                       │                       │
└───────────────────────┼───────────────────────┘
│
┌──────────────▼─────────────────┐
│       API GATEWAY (NGINX)      │
└──────────────┬─────────────────┘
│
┌──────────────▼─────────────────┐
│     APPLICATION LAYER          │
│  ┌─────────────────────────┐   │
│  │   CHURCH MEMBER         │   │
│  │ ACQUISITION SYSTEM      │   │
│  │    (CMAS)               │   │
│  └─────────────────────────┘   │
│             │                  │
│  ┌──────────▼──────────┐       │
│  │   CORE MODULES      │       │
│  │ • Authentication    │       │
│  │ • User Management   │       │
│  │ • Branch Hierarchy  │       │
│  │ • Guest Management  │       │
│  │ • Member Management │       │
│  └─────────────────────┘       │
└──────────────┬─────────────────┘
│
┌──────────────▼─────────────────┐
│      DATA LAYER                │
│  ┌─────────────────────────┐   │
│  │   POSTGRESQL DATABASE   │   │
│  │ • Primary Data Store    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │       REDIS             │   │
│  │ • Caching               │   │
│  │ • Session Storage       │   │
│  │ • Task Queue            │   │
│  └─────────────────────────┘   │
└──────────────┬─────────────────┘
│
┌──────────────▼─────────────────┐
│   EXTERNAL INTEGRATIONS        │
│  ┌─────┐ ┌─────┐ ┌──────────┐  │
│  │ SMS ││EMAIL││ PAYMENTS │  │
│  └─────┘ └─────┘ └──────────┘  │
└────────────────────────────────┘

```

## Core Components

### 1. Client Layer

**Public Website (Next.js)**
- Static and dynamic content delivery
- Branch locator with geographical hierarchy
- Guest conversion forms
- Live streaming integration
- SEO-optimized content delivery

**Member Web/Mobile App (Next.js + React Native)**
- Cross-platform member engagement
- Real-time notifications
- Offline capability for essential features
- Progressive Web App (PWA) support

**Admin Portals**
- Branch-specific management interfaces
- Global oversight dashboard
- Real-time analytics and reporting
- Bulk operation capabilities

### 2. API Gateway Layer

**NGINX Configuration**
- Request routing and load balancing
- Rate limiting and security headers
- SSL termination
- Static file serving
- CORS management

### 3. Application Layer

**Django Backend Architecture**
```

apps/
├──core/                 # Base configuration and utilities
├──authentication/       # JWT-based auth system
├──churches/            # Branch hierarchy management
├──cmas/                # Church Member Acquisition System
│├── visibility/      # Outreach campaigns
│├── followup/        # Automated sequences
│├── conversion/      # Decision tracking
│├── discipleship/    # Growth pathways
│└── analytics/       # KPI tracking
├──members/             # Member relationship management
├──guests/              # Guest funnel system
├──groups/              # Departments and teams
├──events/              # Calendar and event management
├──appointments/        # Booking system
├──donations/           # Payment processing
├──assets/              # Asset management
├──storage/             # Inventory system
├──communications/      # Messaging services
├──reporting/           # Analytics and dashboards
└──integrations/        # Third-party services

```

### 4. Data Layer

**PostgreSQL Database**
- Relational data with complex hierarchies
- JSONB fields for flexible data storage
- Full-text search capabilities
- Geographic data support (PostGIS)

**Redis Services**
- Session storage
- API response caching
- Celery task queue backend
- Real-time feature support

### 5. Integration Layer

**External Services**
- **Paystack & Stripe**: Payment processing
- **Twilio**: SMS and voice communications
- **SendGrid**: Email delivery
- **Google Maps**: Location services
- **Cloud Storage**: File and media storage

## Data Flow Patterns

### Guest Acquisition Flow
```

Website Visitor → Connect Form → Guest Profile → 
CMAS Follow-up Engine→ Communication Sequences → 
Conversion Tracking→ Member Promotion

```

### Hierarchical Data Access
```

Platform Admin → All Data
National Admin→ Country-level Data
Regional Admin→ Region-level Data
Branch Manager → Single Branch Data
Department Head→ Department Data
Member→ Personal & Community Data
Guest→ Limited Public Data

```

### Event Propagation
```

Branch Event → Regional Calendar → National Calendar → 
Global Highlights→ Member Notifications

```

## Security Architecture

### Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Hierarchical permission inheritance
- Session management with Redis

### Data Protection
- Encryption at rest (database level)
- Encryption in transit (TLS 1.3+)
- PII data masking in logs
- Regular security audits

### Access Control
```python
# Example permission structure
PERMISSION_HIERARCHY = {
    'platform_admin': ['*'],
    'national_manager': ['country.*'],
    'regional_manager': ['region.*'], 
    'branch_manager': ['branch.*'],
    'department_head': ['department.*'],
    'member': ['profile.*', 'community.read'],
    'guest': ['public.*']
}
```

Scalability Considerations

Horizontal Scaling

· Stateless API design
· Database connection pooling
· Redis cluster for session storage
· CDN for static assets

Performance Optimization

· Database query optimization
· API response caching
· Background task processing
· Asset lazy loading

Monitoring & Observability

· Application performance monitoring
· Database performance metrics
· User behavior analytics
· Error tracking and alerting

Deployment Architecture

Container Orchestration

```
Docker Containers:
├── nginx (Load Balancer)
├── django (API Server)
├── celery (Task Worker)
├── celery-beat (Scheduler)
├── postgres (Database)
└── redis (Cache & Queue)
```

Environment Configuration

· Development, Staging, Production environments
· Environment-specific configuration management
· Secret management with environment variables
· Database migration strategies

Technology Decisions

Framework Choices

· Django: Mature ecosystem, built-in admin, ORM capabilities
· Next.js: SSR capabilities, React ecosystem, performance
· PostgreSQL: ACID compliance, JSON support, spatial data
· Docker: Environment consistency, deployment simplicity

Integration Patterns

· RESTful API design
· Webhook-based event system
· Batch processing for large operations
· Real-time updates via WebSockets

This architecture provides a solid foundation for the THOGMi Digital Platform while maintaining flexibility for future growth and feature expansion.

```
