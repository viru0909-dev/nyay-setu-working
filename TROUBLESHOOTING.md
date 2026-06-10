# Nyay Setu — Deterministic Troubleshooting Guide

This guide provides deterministic troubleshooting steps for developers and DevOps engineers setting up, running, or deploying the **Nyay Setu** digital judiciary platform. It focuses strictly on integration points, configuration alignments, database parameters, and environment synchronization between the system components.

---

## 1. Database Integration & PgBouncer Compatibility

Nyay Setu's Java backend utilizes a Spring Boot framework with **HikariCP** as the default connection pooler. While standard direct connections to PostgreSQL function without issues, production hosting platforms (such as Supabase or AWS RDS) often utilize **PgBouncer** in **Transaction Pooling Mode** to conserve database connections.

> [!CAUTION]
> **The prepared statement issue:**
> By default, the PostgreSQL JDBC driver uses server-side prepared statements to optimize queries. However, in PgBouncer's transaction pooling mode, subsequent queries in the same connection pool may be assigned to different PostgreSQL server processes behind the scenes. This mismatch results in fatal runtime errors such as:
> `org.postgresql.util.PSQLException: ERROR: prepared statement "S_1" does not exist` or `already exists`.

### Crucial PgBouncer Hikari Configuration
To bypass transaction pooler limitations, you **must disable driver-side prepared statements** and enable standard TCP keep-alive settings in the JDBC driver connection properties.

Insert or modify the following configurations in your `application.properties` (or `application-prod.properties` when `SPRING_PROFILES_ACTIVE=prod`):

```properties
# spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/nyaysetu}
# spring.datasource.driver-class-name=org.postgresql.Driver

# Force JDBC Driver to bypass PgBouncer statement caching
spring.datasource.hikari.data-source-properties.prepareThreshold=0
spring.datasource.hikari.data-source-properties.binaryTransfer=false

# Keep connections alive and handle timeouts gracefully
spring.datasource.hikari.data-source-properties.cancelSignalTimeout=0
spring.datasource.hikari.data-source-properties.tcpKeepAlive=true
```

### Direct vs. Transaction Connection Routing

If you are using Flyway database migrations (which are enabled by default), Flyway requires an unpooled, direct connection to handle DDL changes safely. Configure a separate Flyway URL if using Supabase:

```properties
# Use direct connection (port 5432) for Flyway migrations
spring.flyway.url=${FLYWAY_URL:jdbc:postgresql://db.supabase.co:5432/postgres}
spring.flyway.user=${FLYWAY_USER:postgres}
spring.flyway.password=${FLYWAY_PASSWORD:your-password}
```

---

## 2. Environment Variables & Sync Alignment

The system relies on synchronization between the **Spring Boot Java Backend**, the **Python NLP Orchestrator**, and the **LawGPT Vector Service**. If these variables do not match, RAG retrieval and transcription services will fail.

### Complete Sync Matrix

| Component | Variable Name | Required / Optional | Expected Format / Example Value | Fallback / Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Java Backend** | `SPRING_PROFILES_ACTIVE` | Optional | `dev`, `prod` | Defaults to `dev` (H2 database in tests, relaxed CORS) |
| **Java Backend** | `DB_URL` | Required (Prod) | `jdbc:postgresql://host:5432/nyaysetu` | `jdbc:postgresql://localhost:5432/nyaysetu` |
| **Java Backend** | `GROQ_API_KEY` | Required | `gsk_xxxx...` | Falls back to local **Ollama Service** (`OLLAMA_BASE_URL`) |
| **Java Backend** | `JWT_SECRET` | Required | Minimum 256-bit high-entropy string | Defaults to insecure hardcoded fallback in development |
| **Java Backend** | `FRONTEND_URL` | Required | `http://localhost:5173` | `http://localhost:5173` |
| **Java Backend** | `CORS_ALLOWED_ORIGINS` | Required | `http://localhost:5173,http://localhost:3000` | Limits REST calls strictly to specified origins |
| **Java Backend** | `SMTP_HOST` | Optional | `smtp.gmail.com` | No emails are sent if SMTP credentials are blank |
| **NLP Orchestrator** | `GROQ_API_KEY` | **Required** | `gsk_xxxx...` | **Fatal:** Raises `EnvironmentError` and crashes on startup |
| **NLP Orchestrator** | `GOOGLE_GEMINI_API_KEY` | Optional | `AIzaSyxxxx...` | **Graceful Fallback:** Falls back to Groq Llama-3.3-70b |
| **NLP Orchestrator** | `INDIAN_KANOON_TOKEN` | Optional | `Token xxxx...` | Fallback to simulated database query if token is blank |
| **NLP Orchestrator** | `FRONTEND_ORIGIN` | Required | `http://localhost:5173` | Restricts websocket / SSE cross-origin requests |

---

## 3. High-Availability & AI Fallback Mechanisms

To ensure continuous uptime for legal guidance, Nyay Setu has built-in resilient fallback pathways for both AI query services and search engines:

### Scenario A: Groq API Key Fails / Exhausts Rate Limit (Backend)
- **Path:** `VakilFriendService.java` -> `OllamaService.java`
- **Behavior:** The backend automatically catches the `PSQLException` or connection timeouts from Groq API calls.
- **Action:** If the Groq API call fails or the key is blank, it defaults to:
  ```properties
  ollama.base.url=${OLLAMA_BASE_URL:http://localhost:11434}
  ollama.model=${OLLAMA_MODEL:gemma3:1b}
  ```
- **Verification:** Ensure your local Ollama daemon is running (`ollama run gemma3:1b`) to handle local processing.

### Scenario B: Google Gemini API Key Missing (NLP Orchestrator)
- **Path:** `nlp-orchestrator/config.py` -> `nlp-orchestrator/main.py`
- **Behavior:** On startup, the Python microservice validates keys.
- **Action:** If `GOOGLE_GEMINI_API_KEY` is not present, it prints a startup warning:
  `[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.`
  During execution, any queries routed for deep legal reasoning are seamlessly shifted to the Groq `llama-3.3-70b-versatile` client.

### Scenario C: LawGPT Vector Index File Not Found
- **Path:** `lawgpt-service/main.py` -> `lawgpt/retriever.py`
- **Behavior:** If the FAISS vector database file index (`index.faiss`) has not been compiled, a `FileNotFoundError` is thrown during context calls.
- **Action:** The system returns HTTP `503 Service Unavailable` with details:
  `detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first."`
- **Resolution:** Navigate to the `lawgpt-service` folder and trigger ingestion:
  ```bash
  python lawgpt/ingest.py
  ```

---

## 4. JVM Tuning & Production Run Stability

To host the Spring Boot container reliably under resource-restricted environments (e.g., free-tier Render or AWS EC2 instances with 1GB RAM limits), you must apply strict JVM limits and initialization rules.

### Docker Environment JVM Allocation
In your `docker-compose.yml`, enforce constraints on the Spring Boot heap size to prevent the operating system from terminating the process under out-of-memory (OOM) conditions:

```yaml
backend-spring:
  environment:
    - JAVA_TOOL_OPTIONS=-Xmx512m -Xms256m
  mem_limit: 768M
```
- `-Xms256m`: Sets initial Java heap size to 256MB.
- `-Xmx512m`: Sets maximum Java heap size to 512MB, reserving the remaining container memory (256MB) for system operations and garbage collection overhead.

### Render Cold-Start Optimizations
Render's free instance automatically sleeps after periods of inactivity. During startup, standard Spring Boot bean creation takes up substantial time, causing the deployment health check to fail.

To resolve this, enable **lazy initialization** in the properties file:

```properties
# ============================================
# STARTUP OPTIMIZATION (Render Cold Start Fix)
# ============================================
# Delay bean creation until first needed — cuts boot time significantly
spring.main.lazy-initialization=true
```

Additionally, handle downstream timeouts gracefully to avoid deadlocks:
```properties
# SMTP timeouts to prevent locking threads during boot
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
```
