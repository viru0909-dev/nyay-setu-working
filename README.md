# NYAY-SETU 🏛️

**India's First AI-Powered Digital Judiciary Platform**

Making justice accessible, transparent, and efficient through technology.

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![React 18](https://img.shields.io/badge/React-18-blue)]()
[![Spring Boot 3.2](https://img.shields.io/badge/Spring%20Boot-3.2-green)]()
[![Java 17](https://img.shields.io/badge/Java-17-orange)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

NYAY-SETU is a comprehensive legal technology platform that combines AI-powered assistance with robust case management. The platform serves judges, lawyers, clients, and admin users with role-based access and intelligent features.

### What Makes Us Different

- �� **AI Legal Assistant** - Google Gemini-powered chatbot for legal guidance
- 📜 **Interactive Constitution** - Full Indian Constitution with AI Q&A
- 🌐 **Bilingual** - Complete English/Hindi support (100+ translations)
- ⚖️ **Smart Case Management** - End-to-end case lifecycle tracking
- 🔒 **Enterprise Security** - JWT authentication, audit logging
- 📱 **Modern UI** - Responsive, accessible, beautiful design

---

## ✨ Key Features

### Frontend Features

#### 🏠 Landing Page
- **Hero Section** - Gradient text, animated CTA
- **Statistics** - 4 key metrics with animations
- **How It Works** - 4-step visual workflow
- **Features Grid** - 6 capability showcases
- **Trust Indicators** - Security badges & certifications
- **News Section** - Latest judiciary updates
- **Responsive** - Mobile, tablet, desktop optimized

#### 📜 Constitution Explorer
- Full Indian Constitution text (15 articles currently, 470 planned)
- AI chatbot for Constitution Q&A (Google Gemini)
- Bookmark favorite articles
- Advanced search with keywords
- Bilingual content (English/Hindi)
- Part-wise navigation
- Print/download ready

#### 🤖 AI Assistant
- Interactive modal with smooth animations
- 4 clickable capabilities
- 5 sample questions
- Redirects to chatbot/Constitution
- Animated brain icon
- Privacy-focused

#### 📄 Pages
- **Landing** - Modern 7-section homepage
- **About** - Interactive tabs, mission/vision
- **Constitution** - Legal research tool
- **Login/Signup** - Secure authentication
- **Dashboards** - Role-specific (Judge/Lawyer/Client/Admin)

### Backend Features

#### Authentication & Authorization
- JWT token-based auth
- Role-based access control (RBAC)
- Password encryption (BCrypt)
- Email verification via OTP
- Session management

#### Case Management
- Create, track, update cases
- Party management (plaintiff/defendant)
- Status tracking (FILED, ONGOING, CLOSED, DISMISSED)
- Case search and filtering
- Document attachment
- Timeline tracking

#### Document Management
- Secure file upload/download
- Multiple format support (PDF, DOCX, images)
- File versioning
- Access control
- Metadata management

#### AI Integration
- Google Gemini API integration
- Legal question answering
- Constitution Q&A
- Document summarization (planned)
- Case precedent search (planned)

#### Meeting Management
- Virtual hearing scheduling
- Participant management
- Calendar integration ready
- Status tracking

#### Audit & Compliance
- Immutable audit logging
- User action tracking
- Compliance reporting
- Timestamp-based querying

---

## 🏗️ Architecture

### System Architecture

**MONOLITHIC APPLICATION** with modular design:

```
┌─────────────────────────────────────┐
│     React Frontend (Port 5173)      │
│  - 5 Pages, 20+ Components          │
│  - Bilingual (EN/HI)                │
│  - Framer Motion Animations         │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────┐
│  Spring Boot Backend (Port 8080)    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Controllers (14)           │   │
│  │  - Auth, Case, Document     │   │
│  │  - Meeting, User, etc.      │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Services (14)              │   │
│  │  - Business Logic           │   │
│  │  - AI Integration           │   │
│  │  - Email, Notifications     │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────▼──────────────────┐   │
│  │  Repositories (16)          │   │
│  │  - JPA/Hibernate            │   │
│  └──────────┬──────────────────┘   │
└─────────────┼───────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │  PostgreSQL (5432)   │
   │  Database: nyaysetu  │
   └──────────────────────┘
```

### Key Components

#### Backend Modules
- **Controllers** (14): REST API endpoints
- **Services** (14): Business logic layer
- **Repositories** (16): Data access layer
- **Entities** (21): JPA entities
- **DTOs** (32): Data transfer objects
- **Config** (4): Security, CORS, etc.
- **Filters** (1): JWT authentication filter
- **Exceptions** (2): Global error handling

#### Frontend Modules
- **Pages** (5): Landing, About, Constitution, Login, Signup
- **Components** (20+): Reusable UI components
  - `landing/`: Header, Footer, AIAssistantModal, NewsSection, HowItWorks, TrustIndicators
  - `common/`: Shared components
  - `ErrorBoundary.jsx`: Error handling
  - `LoadingSpinner.jsx`: Loading states
- **Contexts**: LanguageContext (bilingual support)
- **Services**: API client (Axios)
- **Store**: Zustand for state management

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool |
| React Router | 6.20 | Navigation |
| Framer Motion | 12.23 | Animations |
| Lucide React | 0.294 | Icons |
| Axios | 1.6 | HTTP client |
| Zustand | 4.4 | State management |
| Three.js | 0.181 | 3D graphics |
| AOS | 2.3 | Scroll animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming language |
| Spring Boot | 3.2.3 | Application framework |
| Spring Security | 3.2 | Authentication |
| Spring Data JPA | 3.2 | Data persistence |
| PostgreSQL | 15 | Database |
| JWT | 0.11 | Token auth |
| Lombok | 1.18 | Boilerplate reduction |
| Maven | 3.9 | Build tool |

### AI/ML
- **Google Gemini API** - Legal chatbot, Constitution Q&A
- **Anthropic Claude** (SDK installed, not active)

---

## 🚀 Quick Start

### Prerequisites
```bash
- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- PostgreSQL 15
- Git
```

### 1. Clone Repository
```bash
git clone https://github.com/viru0909-dev/nyay-setu-working.git
cd NYAY-SETU
```

### 2. Database Setup
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nyaysetu;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nyaysetu TO nyaysetu;
\q
```

### 3. Environment Configuration

Create `.env` file in project root:

```env
# Database
DB_USERNAME=nyaysetu
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRATION_MS=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Start Backend
```bash
cd backend/nyaysetu-backend
mvn clean install
mvn spring-boot:run
```

Backend will start at: `http://localhost:8080`

### 5. Start Frontend
```bash
cd frontend/nyaysetu-frontend
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173`

### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health

---

## 📁 Project Structure

```
NYAY-SETU/
├── backend/
│   ├── nyaysetu-backend/           # Main Spring Boot application
│   │   ├── src/main/java/com/nyaysetu/backend/
│   │   │   ├── controller/         # 14 REST controllers
│   │   │   ├── service/            # 14 business services
│   │   │   ├── repository/         # 16 JPA repositories
│   │   │   ├── entity/             # 21 JPA entities
│   │   │   ├── dto/                # 32 data transfer objects
│   │   │   ├── config/             # Security, CORS config
│   │   │   ├── filter/             # JWT filter
│   │   │   ├── exception/          # Error handling
│   │   │   ├── notification/       # Email service
│   │   │   └── util/               # Utilities
│   │   ├── src/main/resources/
│   │   │   └── application.properties
│   │   └── pom.xml
│   ├── pom.xml                     # Parent POM (multi-module)
│   └── uploads/                    # File storage
│
├── frontend/
│   └── nyaysetu-frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── landing/        # Landing page components
│       │   │   ├── auth/           # Login/Signup
│       │   │   ├── case/           # Case management
│       │   │   ├── document/       # Document viewer
│       │   │   ├── common/         # Shared components
│       │   │   ├── ErrorBoundary.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   ├── pages/
│       │   │   ├── Landing.jsx
│       │   │   ├── About.jsx
│       │   │   ├── Constitution.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Signup.jsx
│       │   │   └── dashboards/     # Role-specific dashboards
│       │   ├── contexts/
│       │   │   └── LanguageContext.jsx
│       │   ├── services/
│       │   │   └── api.js          # Axios client
│       │   ├── store/
│       │   │   └── authStore.js    # Zustand store
│       │   ├── styles/
│       │   │   ├── global.css
│       │   │   └── responsive.css
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
│
├── .env                            # Environment variables (git-ignored)
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🔧 Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USERNAME` | PostgreSQL username | `nyaysetu` |
| `DB_PASSWORD` | PostgreSQL password | `your_password` |
| `JWT_SECRET` | JWT signing key (256-bit) | `your-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for CORS | `http://localhost:5173` |
| `SMTP_USERNAME` | Email for notifications | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email app password | `your-app-password` |

### Getting API Keys

**Google Gemini API** (Free tier available):
1. Visit: https://aistudio.google.com/app/apikey
2. Create new API key
3. Add to `.env` as `GEMINI_API_KEY`
4. Free quota: 15 requests/minute, 1500 requests/day

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication Endpoints
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/verify-email      # Email verification
```

### Case Management
```http
GET    /api/cases                # List all cases
POST   /api/cases                # Create new case
GET    /api/cases/{id}           # Get case details
PUT    /api/cases/{id}           # Update case
DELETE /api/cases/{id}           # Delete case
```

### Document Management
```http
POST   /api/documents/upload     # Upload document
GET    /api/documents/{id}       # Download document
GET    /api/documents/case/{id}  # List case documents
DELETE /api/documents/{id}       # Delete document
```

### Meeting Management
```http
POST   /api/meetings             # Schedule meeting
GET    /api/meetings/{id}        # Get meeting details
PUT    /api/meetings/{id}        # Update meeting
GET    /api/meetings/upcoming    # List upcoming meetings
```

### User Management
```http
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update profile
GET    /api/users                # List users (Admin only)
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Royal Blue (#2563eb)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Pink (#ec4899)
- **Background**: Dark (#0f172a)
- **Text**: White (#ffffff), Gray (#94a3b8)

### Typography
- **Font**: System fonts (San Francisco, Segoe UI, etc.)
- **Headings**: 900 weight, gradient text
- **Body**: 400-600 weight

### Animations
- **Framer Motion** for page transitions
- **AOS** for scroll animations
- Spring physics for smooth interactions

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password encryption (BCrypt)
- ✅ SQL injection protection (JPA)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Audit logging
- ✅ Role-based access control

---

## 📊 Current Status

### Completed ✅
- Monolith backend architecture
- Full authentication system
- Case management module
- Document management
- Meeting scheduling
- AI chatbot integration (Gemini)
- Modern responsive frontend
- Bilingual support (EN/HI)
- Error handling & loading states
- Interactive Constitution browser

### In Progress 🔄
- Full 470 Constitution articles
- WebRTC video conferencing
- Advanced AI features (RAG, semantic search)

### Planned 📋
- Mobile app (React Native)
- Offline support (PWA)
- Blockchain audit trail
- E-signature integration
- Analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/name`
5. Create Pull Request

**Commit Convention**: Follow [Conventional Commits](https://conventionalcommits.org/)

---

## 📄 License

Proprietary software. All rights reserved.

---

## 🎯 Vision

Democratize access to justice in India through technology, making legal proceedings transparent, efficient, and accessible for all citizens.

**Ethics First**: AI features are advisory. Human judges retain final authority.

---

## 📞 Support

- **GitHub Issues**: Report bugs
- **Email**: gadekarvirendra4@gmail.com

---

## 👨‍💻 Author

**Virendra Gadekar**
- 📧 Email: gadekarvirendra4@gmail.com
- 🐙 GitHub: [@viru0909-dev](https://github.com/viru0909-dev)
- 💼 LinkedIn: [Virendra Gadekar](https://linkedin.com/in/virendra-gadekar)

---

**Built with ❤️ for Justice and Accessibility**

*Last Updated: December 7 2025 - Production Ready*
