# NYAY-SETU 🏛️

**Making Justice Accessible, Portable & Secure**

AI-assisted remote judiciary platform for judges, lawyers, and clients enabling secure case management, remote hearings, and intelligent document processing.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Architecture](#architecture)
- [Implemented Features](#implemented-features)
  - [Backend Microservices](#backend-microservices)
  - [Frontend Application](#frontend-application)
  - [Infrastructure](#infrastructure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Remaining Work](#remaining-work)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🎯 Overview

NYAY-SETU is a comprehensive digital judiciary platform designed to revolutionize access to justice through technology. The platform enables:

- **Remote Hearings**: WebRTC-based video conferencing for virtual court proceedings
- **Case Management**: Complete lifecycle management of legal cases
- **Document Management**: Secure upload, versioning, and storage of legal documents
- **AI-Assisted Operations**: Intelligent summarization and document analysis
- **Audit Trail**: Immutable logging for compliance and transparency
- **Role-Based Access**: Secure portals for Judges, Lawyers, Clients, and Admins

---

## 🚀 Current Status

### Phase: **Production Deployment Preparation**

We are currently in the deployment phase with a fully functional microservices architecture running on Docker. The system has been refactored to enterprise-grade standards with:

- ✅ Complete backend microservices architecture
- ✅ React-based frontend with modern UI/UX
- ✅ Docker containerization for all services
- ✅ Service discovery and API gateway implementation
- ✅ Database per service pattern with PostgreSQL
- ✅ Health checks and monitoring endpoints
- 🔄 Production deployment guides (in progress)
- 🔄 CI/CD pipeline setup (planned)

---

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────────┐
│   Frontend      │ (React + Vite)
│   Port: 80      │
└────────┬────────┘
         │
┌────────▼────────┐
│  API Gateway    │ (Spring Cloud Gateway)
│  Port: 9000     │
└────────┬────────┘
         │
┌────────▼────────────────────────────────────┐
│         Service Discovery (Eureka)          │
│              Port: 8761                     │
└────────┬────────────────────────────────────┘
         │
    ┌────┴──────────────┬──────────────┬─────────────┐
    │                   │              │             │
┌───▼────┐   ┌─────────▼──┐   ┌──────▼────┐   ┌────▼──────┐
│ Auth   │   │   Case     │   │ Document  │   │ Meeting   │
│ :8081  │   │   :8082    │   │  :8083    │   │  :8084    │
└───┬────┘   └─────┬──────┘   └──────┬────┘   └────┬──────┘
    │              │                 │             │
┌───▼────┐   ┌─────▼──┐   ┌─────────▼──┐
│  AI    │   │ Audit  │   │Verification│
│ :8085  │   │ :8086  │   │   :8087    │
└───┬────┘   └────┬───┘   └─────┬──────┘
    │             │             │
    └─────────────┴─────────────┘
                  │
         ┌────────▼─────────┐
         │   PostgreSQL     │
         │    Port: 5432    │
         └──────────────────┘
```

---

## ✅ Implemented Features

### Backend Microservices

#### 1. **Auth Service** (Port: 8081)
**Status**: ✅ Complete
- JWT-based authentication and authorization
- User registration and login
- Role-based access control (RBAC)
- Password encryption with BCrypt
- Token generation and validation
- User profile management
- Session management

**Database**: `nyaysetu_auth`

#### 2. **Case Service** (Port: 8082)
**Status**: ✅ Complete
- Complete case lifecycle management
- Case creation with metadata
- Party (plaintiff/defendant) management
- Case status tracking (FILED, ONGOING, CLOSED, DISMISSED)
- Case search and filtering
- Case assignment to judges/lawyers
- Case history and timeline

**Database**: `nyaysetu_case`

#### 3. **Document Service** (Port: 8083)
**Status**: ✅ Complete
- Secure document upload/download
- Document versioning
- File storage with volume persistence
- Document metadata management
- Support for multiple file formats
- Document access control
- Document categorization

**Database**: `nyaysetu_document`
**Storage**: Volume-backed file storage

#### 4. **Meeting Service** (Port: 8084)
**Status**: ✅ Complete
- Meeting/hearing scheduling
- Meeting participant management
- Meeting status tracking
- Calendar integration ready
- Meeting notifications (structure ready)
- Virtual courtroom session management

**Database**: `nyaysetu_meeting`

#### 5. **AI Service** (Port: 8085)
**Status**: ✅ Complete
- Document summarization
- Text extraction and processing
- AI-powered insights (structure ready)
- Integration-ready for LLM APIs
- Batch processing support

**Database**: `nyaysetu_ai`

#### 6. **Audit Service** (Port: 8086)
**Status**: ✅ Complete
- Immutable audit logging
- User action tracking
- Compliance reporting
- Audit trail for all critical operations
- Timestamp-based querying
- Security event logging

**Database**: `nyaysetu_audit`

#### 7. **User Verification Service** (Port: 8087)
**Status**: ✅ Complete
- Email verification
- OTP generation and validation
- User identity verification
- Multi-step verification workflows
- Integration with SMTP (configured)

**Database**: `nyaysetu_verification`

#### 8. **Gateway Service** (Port: 9000)
**Status**: ✅ Complete
- API routing and orchestration
- Load balancing across services
- CORS configuration
- Request/response filtering
- Security middleware
- Rate limiting ready

#### 9. **Eureka Server** (Port: 8761)
**Status**: ✅ Complete
- Service registration and discovery
- Health monitoring
- Service load balancing
- Failover support

---

### Frontend Application

**Framework**: React 18 + Vite
**Styling**: Vanilla CSS with custom design system
**Port**: 80 (containerized)

#### Implemented Pages

1. **Landing Page** ✅
   - Hero section with call-to-action
   - Feature showcase
   - Platform benefits
   - Professional legal aesthetic
   - Responsive design

2. **Login Page** ✅
   - Email/password authentication
   - JWT token management
   - Error handling
   - Redirect to role-based dashboards
   - Modern royal blue design system
   - Forgot password flow (UI ready)

3. **Signup Page** ✅
   - User registration
   - Role selection (Judge/Lawyer/Client)
   - Email verification integration
   - Form validation
   - Professional onboarding experience

4. **Dashboard Pages** ✅
   - **Judge Dashboard**: Case overview, hearing schedule
   - **Lawyer Dashboard**: Client cases, documents
   - **Client Dashboard**: Case status, upcoming hearings
   - **Admin Dashboard**: System management, user administration

#### Design System
- Custom CSS variables for theming
- Royal blue color palette
- Government-grade professional aesthetics
- Consistent component library
- Responsive layouts
- Accessibility compliant

#### Components Library
- `Button`, `Input`, `Card`, `Badge`
- `Navbar`, `Footer`, `Header`
- `Hero`, `Features`
- Form components
- Layout components

---

### Infrastructure

#### Docker Configuration ✅
- Multi-service Docker Compose setup
- ARM64/M1 Mac optimized
- Health checks for all services
- Volume persistence for data
- Network isolation
- Service dependencies managed
- Platform-specific builds

#### Database Setup ✅
- PostgreSQL 15 Alpine
- Database per service architecture
- Automated database initialization
- Connection pooling
- Migration-ready schema

#### Service Discovery ✅
- Eureka-based service registry
- Dynamic service discovery
- Health monitoring
- Load balancing

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2+
- **Service Architecture**: Microservices
- **Service Discovery**: Spring Cloud Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Containerization**: Docker

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Design System)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (for frontend)
- **Service Mesh**: Spring Cloud (Service Discovery)
- **Platform**: ARM64/AMD64 compatible

---

## 🚀 Getting Started

### Prerequisites

- Docker Desktop (latest version)
- Docker Compose v2+
- 8GB+ RAM recommended
- Ports available: 80, 5432, 8081-8087, 9000, 8761

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd NYAY-SETU
```

2. **Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# Database Configuration
POSTGRES_USER=nyaysetu
POSTGRES_PASSWORD=nyaysetu_local
DB_USERNAME=nyaysetu
DB_PASSWORD=nyaysetu_local

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80

# API Configuration
VITE_API_BASE_URL=http://localhost:9000

# SMTP Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI Service (Optional)
AI_API_KEY=your-ai-api-key
```

3. **Build and Run**

```bash
# Build all services
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

4. **Access the Application**

- **Frontend**: http://localhost
- **API Gateway**: http://localhost:9000
- **Eureka Dashboard**: http://localhost:8761

### Service Endpoints

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| Frontend | 80 | http://localhost/ | React Application |
| Gateway | 9000 | http://localhost:9000/actuator/health | API Gateway |
| Eureka | 8761 | http://localhost:8761/actuator/health | Service Discovery |
| Auth | 8081 | http://localhost:8081/actuator/health | Authentication |
| Case | 8082 | http://localhost:8082/actuator/health | Case Management |
| Document | 8083 | http://localhost:8083/actuator/health | Document Service |
| Meeting | 8084 | http://localhost:8084/actuator/health | Meeting Service |
| AI | 8085 | http://localhost:8085/actuator/health | AI Service |
| Audit | 8086 | http://localhost:8086/actuator/health | Audit Service |
| Verification | 8087 | http://localhost:8087/actuator/health | Verification Service |
| PostgreSQL | 5432 | - | Database |

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

---

## 📦 Deployment

### Current Deployment Status
- ✅ Docker Compose configuration complete
- ✅ All services containerized
- ✅ Health checks implemented
- 🔄 Production deployment guides in progress

### Planned Deployment Targets

1. **AWS** (Planned)
   - ECS/EKS for container orchestration
   - RDS for PostgreSQL
   - S3 for document storage
   - CloudFront for frontend CDN

2. **Azure** (Planned)
   - AKS for Kubernetes
   - Azure Database for PostgreSQL
   - Blob Storage for documents
   - Azure CDN

3. **GCP** (Planned)
   - GKE for Kubernetes
   - Cloud SQL for PostgreSQL
   - Cloud Storage for documents
   - Cloud CDN

4. **On-Premise** (Planned)
   - Kubernetes cluster
   - Self-hosted PostgreSQL
   - MinIO for object storage

---

## 📋 Remaining Work

### High Priority

#### 1. **CI/CD Pipeline** 🔴
- [ ] GitHub Actions workflow setup
- [ ] Automated testing pipeline
- [ ] Docker image build and push
- [ ] Automated deployment to staging
- [ ] Production deployment automation

#### 2. **WebRTC Video Conferencing** 🔴
- [ ] Integrate WebRTC signaling server
- [ ] Implement video/audio streaming
- [ ] Recording functionality
- [ ] Screen sharing support
- [ ] Meeting transcription (STT)

#### 3. **AI/NLP Enhancement** 🟡
- [ ] Integrate actual LLM API (OpenAI/Anthropic/Local)
- [ ] RAG implementation for document search
- [ ] Vector database integration (Milvus/Weaviate)
- [ ] Document embeddings generation
- [ ] Semantic search implementation
- [ ] Precedent case finder

#### 4. **Security Hardening** 🔴
- [ ] OAuth2 integration
- [ ] Rate limiting implementation
- [ ] Security headers configuration
- [ ] HTTPS/TLS setup for production
- [ ] Secrets management (Vault/AWS Secrets Manager)
- [ ] Penetration testing
- [ ] OWASP security compliance

#### 5. **Cloud Deployment** 🟡
- [ ] AWS deployment guide
- [ ] Azure deployment guide
- [ ] GCP deployment guide
- [ ] Kubernetes manifests
- [ ] Helm charts
- [ ] Terraform/IaC scripts

### Medium Priority

#### 6. **Testing** 🟡
- [ ] Unit tests for all services (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests with Playwright/Cypress
- [ ] Load testing with k6
- [ ] Security testing with OWASP ZAP

#### 7. **Monitoring & Observability** 🟡
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] ELK/Loki logging stack
- [ ] Distributed tracing (Zipkin/Jaeger)
- [ ] Alert management

#### 8. **Advanced Features** 🟢
- [ ] Real-time notifications (WebSocket)
- [ ] Email notification system
- [ ] SMS alerts
- [ ] Calendar synchronization
- [ ] Mobile app (React Native)
- [ ] PWA support

#### 9. **Document Features** 🟢
- [ ] OCR for scanned documents
- [ ] Digital signatures
- [ ] Document annotation
- [ ] Version comparison
- [ ] Document templates

#### 10. **Blockchain Integration** 🟢
- [ ] Document hash anchoring
- [ ] Immutable audit trail on-chain
- [ ] Smart contracts for case lifecycle
- [ ] NFT certificates for judgments

### Low Priority

#### 11. **Admin Features** 🟢
- [ ] Advanced user management
- [ ] System configuration UI
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Backup/restore UI

#### 12. **Compliance** 🟢
- [ ] GDPR compliance
- [ ] Data retention policies
- [ ] Privacy policy implementation
- [ ] Terms of service
- [ ] Cookie consent

#### 13. **Performance Optimization** 🟢
- [ ] Database query optimization
- [ ] Caching strategy (Redis)
- [ ] CDN integration
- [ ] Image optimization
- [ ] Code splitting and lazy loading

#### 14. **Documentation** 🟡
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture diagrams
- [ ] Developer onboarding guide
- [ ] User manuals
- [ ] Video tutorials

---

## 📁 Project Structure

```
NYAY-SETU/
├── backend/                      # Backend microservices
│   ├── auth-service/            # Authentication & authorization
│   ├── case-service/            # Case management
│   ├── document-service/        # Document handling
│   ├── meeting-service/         # Meeting/hearing management
│   ├── ai-service/              # AI/NLP operations
│   ├── audit-service/           # Audit logging
│   ├── user-verification-service/ # User verification
│   ├── gateway-service/         # API Gateway
│   ├── eureka-server/           # Service discovery
│   ├── Dockerfile.template      # Shared Dockerfile template
│   └── pom.xml                  # Parent POM
│
├── frontend/                    # Frontend application
│   └── nyaysetu-frontend/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── pages/           # Page components
│       │   ├── services/        # API services
│       │   ├── store/           # State management
│       │   └── styles/          # CSS files
│       ├── Dockerfile           # Frontend container
│       └── nginx.conf           # Nginx configuration
│
├── infra/                       # Infrastructure code (planned)
│   ├── kubernetes/
│   ├── terraform/
│   └── helm/
│
├── docs/                        # Documentation
│   └── architecture/
│
├── scripts/                     # Utility scripts
│   └── init-databases.sh        # DB initialization
│
├── docker-compose.yml           # Docker orchestration
├── .env                         # Environment variables
├── README.md                    # This file
└── .gitignore                   # Git ignore rules
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes and commit**
   ```bash
   git commit -m "feat: add your feature"
   ```
4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

- **Product Lead**: Legal domain expert
- **Backend Engineers**: Spring Boot microservices
- **Frontend Engineer**: React development
- **DevOps Engineer**: Infrastructure and deployment
- **ML Engineer**: AI/NLP features

---

## 📞 Support

For questions, issues, or contributions:

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: `/docs` directory

---

## 🎯 Vision

NYAY-SETU aims to democratize access to justice through technology, making legal proceedings accessible, efficient, and transparent. Our platform empowers judges, lawyers, and clients with AI-assisted tools while maintaining the human element in judicial decision-making.

**Ethics First**: All AI features are advisory. Human judges retain final authority.

---

**Built with ❤️ for Justice and Accessibility**
