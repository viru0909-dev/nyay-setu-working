# Database Migrations - NYAY-SETU

This project uses **Flyway** for versioned database migrations. All schema changes MUST go through Flyway to prevent silent data loss.

## Critical Rules for Contributors

### ❌ NEVER DO THIS:
- ❌ Modify tables manually in the database
- ❌ Rely on `spring.jpa.hibernate.ddl-auto=create` or `create-drop`
- ❌ Add JPA `@Entity` without creating a migration
- ❌ Use `ALTER TABLE` outside of migrations

### ✅ ALWAYS DO THIS:
- ✅ Create `.sql` migration file in this directory
- ✅ Name as `Vxx__description_of_change.sql`
- ✅ Test locally before pushing
- ✅ Submit PR with BOTH entity and migration changes

## Migration Workflow

### 1. Adding a New Entity

```java
// File: src/main/java/com/nyaysetu/backend/entity/MyNewEntity.java
@Entity
@Table(name = "my_new_entity")
public class MyNewEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String name;
}
```

### 2. Create Migration File

```sql
-- File: db/migration/Vxx__create_my_new_entity_table.sql
CREATE TABLE my_new_entity (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_my_new_entity_name ON my_new_entity(name);
```

### 3. Test Locally

```bash
cd backend/nyaysetu-backend

# Run tests - migrations execute here
mvn clean test

# Or run app locally
mvn spring-boot:run
```

### 4. Submit PR

Include BOTH files:
- ✅ New/modified entity file
- ✅ Migration file (Vxx__*.sql)

---

## Migration Naming Convention

Format: `Vxx__descriptive_name.sql`

**Examples:**
- ✅ `V1__init_base_schema.sql` - Initial setup
- ✅ `V15__create_evidence_records_table.sql` - New table
- ✅ `V53__add_audit_chain_columns.sql` - New columns
- ✅ `V54__consolidate_schema_validation.sql` - Validation checkpoint

---

## Current Schema Entities (40+)

### Core Tables
- `ny_user` - User accounts with OAuth2 support
- `password_reset_tokens` - Password reset workflow
- `face_data` - Biometric enrollment data

### Case Management
- `cases` - Main case records
- `case_timeline` - Case milestone tracking
- `case_events` - Case status changes
- `case_messages` - Internal case communications
- `case_draft` - Draft petitions

### Evidence & Audit
- `evidence_record` - Hashed evidence with integrity chain
- `audit_log` - **Tamper detection with SHA-256 chain**
- `court_order` - Court orders and rulings

### Judicial Process
- `hearing` - Scheduled hearings
- `hearing_participant` - Hearing participants
- `case_stage` - Case progression stages

### AI Services
- `chat_session` - Vakil-Friend chat sessions
- `vakil_ai_diary_entry` - AI-generated case updates
- `vakil_friend_feedback` - Feedback on AI outputs

### Supporting Tables
- `document_entity` - Document storage metadata
- `document_analysis` - Document analysis results
- `case_evidence` - Evidence linked to cases
- `user_profile` - Extended user information
- `notification` - User notifications
- `case_comment` - Case comments/discussions

---

## Critical Migration: V54

**File:** `V54__consolidate_schema_validation.sql`

This migration validates that all 40+ entities have corresponding database tables. If it fails:

1. A previous migration was corrupted
2. An entity was added without a migration
3. The schema was manually modified

**DO NOT PROCEED** - contact DevOps/DBA immediately.

---

## Troubleshooting

### Migration Fails on Startup

```
Caused by: org.flywaydb.core.api.FlywayException: Validate failed
```

**Causes:**
1. Database is missing tables that code expects
2. A migration file was edited after being applied (never do this!)
3. Manual ALTER TABLE statements ran outside Flyway

**Fix:**
```bash
# Check what Flyway thinks is applied:
SELECT * FROM flyway_schema_history;

# NEVER manually drop tables - contact DBA
```

### Adding Columns to Existing Table

```sql
-- V55__add_new_column_to_cases.sql
ALTER TABLE cases ADD COLUMN new_field VARCHAR(255);
```

Then update the entity:

```java
@Column(name = "new_field", length = 255)
private String newField;
```

---

## References

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Issue #1315 - No Database Migration Tool](https://github.com/viru0909-dev/nyay-setu-working/issues/1315)
- [Spring Boot & Flyway Integration](https://spring.io/projects/spring-boot#learn)

---

## Contact

- 🚨 **Migration Issues?** Comment on #1315 or contact @ScarsAndSource
- 📧 **Schema Questions?** See TROUBLESHOOTING section above
