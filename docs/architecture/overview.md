# Nyay Saarthi - Architecture Overview

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        PWA[Progressive Web App<br/>React + Vite]
    end
    
    subgraph "API Gateway"
        Spring[Spring Boot<br/>REST API]
        Security[Spring Security<br/>JWT Auth]
    end
    
    subgraph "Business Logic"
        CaseService[Case Management]
        FirService[FIR Processing]
        VakilService[Vakil Friend AI]
        EvidenceService[Evidence Vault]
        HearingService[Virtual Hearings]
    end
    
    subgraph "AI Layer"
        Groq[Groq API<br/>Llama 3.1]
        Ollama[Ollama<br/>Local LLM]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>37 Entities)]
        FileSystem[File Storage<br/>SHA-256 Hashing]
    end
    
    PWA --> Spring
    Spring --> Security
    Security --> CaseService
    Security --> FirService
    Security --> VakilService
    Security --> EvidenceService
    Security --> HearingService
    
    VakilService --> Groq
    FirService --> Groq
    EvidenceService --> Groq
    
    VakilService -.Fallback.-> Ollama
    
    CaseService --> Postgres
    FirService --> Postgres
    EvidenceService --> FileSystem
    EvidenceService --> Postgres
```

## User Journey: Case Filing with AI

```mermaid
sequenceDiagram
    participant L as Litigant
    participant V as Vakil Friend AI
    participant B as Backend
    participant G as Groq API
    participant D as Database
    
    L->>V: "I need to file a case"
    V->>B: Start chat session
    B->>D: Create ChatSession
    B->>G: Generate greeting
    G-->>V: "Hello! What's your legal issue?"
    V-->>L: Display message
    
    loop Conversation
        L->>V: Answer questions
        V->>B: Send message
        B->>G: AI processes conversation
        G-->>B: Next question/guidance
        B-->>V: AI response
        V-->>L: Display
    end
    
    G-->>B: "CASE SUMMARY ready"
    B-->>L: Show summary
    L->>B: Approve & file
    B->>D: Create CaseEntity
    B->>D: Save diary (SHA-256)
    B-->>L: "Case filed successfully!"
```

## AI Integration Snapshot

| Feature | Technology | Speed | Privacy |
|---------|------------|-------|---------|
| Vakil Friend | Groq (Llama 3.1 70B) | 150 tok/s | Anonymized |
| Document Analysis | Groq (Llama 3.1 8B) | 200 tok/s | Anonymized |
| Constitution Q&A | Ollama (Local) | 30 tok/s | 100% Private |
| Judge's Brief | Groq (Llama 3.1 70B) | 150 tok/s | Anonymized |

For detailed 26 REST API controllers routing map, role-based access matrix, and database schemas, refer to the root `SYSTEM_DOCUMENTATION.md` and `AI_INTEGRATION_GUIDE.md` files.
