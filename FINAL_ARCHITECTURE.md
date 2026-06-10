# UNDESIA Platform — Final Architecture Document

> **Versi**: 1.0.0 (FINAL)  
> **Tanggal**: 10 Juni 2026  
> **Status**: APPROVED FOR IMPLEMENTATION  
> **Basis**: PLATFORM_FULL_DESIGN.md v2.0.0 + PAYMENT_SYSTEM_DESIGN.md v1.0.0 + DESIGN_GAP_ANALYSIS.md v1.0.0

---

## EXECUTIVE SUMMARY

Platform SaaS Digital Invitation Multi-Event dirancang dengan arsitektur modular, scalable, dan extensible menggunakan proven design patterns.

**Key Architectural Principles:**
1. **Separation of Concerns**: Controller ↔ Service ↔ Repository ↔ Model
2. **Strategy Pattern**: Payment & WA gateways pluggable tanpa perubahan core
3. **EAV Model**: Event-type-specific content tanpa schema migration
4. **Feature Gating**: Package-based feature access, UNLIMITED data untuk semua paket
5. **Event-Driven**: Async processing via Laravel Jobs + Horizon

---

## SECTION 1: SYSTEM OVERVIEW

### 1.1 Platform Purpose

**Target**: Indonesian users creating digital invitations for multiple event types with monetization via subscription packages.

**Event Types Supported**:
- Wedding (Pernikahan)
- Birthday (Ulang Tahun)
- Khitanan
- Aqiqah
- Gender Reveal
- Syukuran/Selamatan
- Generic/Extensible

### 1.2 Core Business Model

**User Journey**:
1. Register → 2. Create Invitation → 3. Add Event Details → 4. Invite Guests → 5. Select Package → 6. Pay → 7. Publish → 8. Collect Amplop (donations)

**Revenue Streams**:
- Subscription packages (Basic/Premium/Exclusive)
- Optional amplop digital commission (future)
- Digital envelope service fees (future)

### 1.3 Technical Architecture at Macro Level

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│  React 18 + TypeScript + Inertia.js + Tailwind + Framer Motion  │
│  ├── Dashboard (Owner manage undangan)                           │
│  ├── Wizard (Create undangan step-by-step)                      │
│  ├── Public Pages (/{kode} — guest view)                        │
│  └── Admin Panel (System management)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP(S) via Inertia Bridge
┌─────────────────────▼───────────────────────────────────────────┐
│                       BACKEND (Laravel 12)                       │
│  ├── API Routes (REST)                                          │
│  │   ├── Auth (login, register, password reset)                 │
│  │   ├── Dashboard (invitation CRUD)                            │
│  │   ├── Guest Management (CSV import, edit)                    │
│  │   ├── Payment (checkout, status check)                       │
│  │   ├── Public (view undangan, submit RSVP)                    │
│  │   └── Admin (management endpoints)                           │
│  │                                                               │
│  ├── Service Layer                                              │
│  │   ├── InvitationService                                      │
│  │   ├── InvitationContentService (EAV manager)                 │
│  │   ├── PaymentGatewayManager (Strategy pattern)               │
│  │   ├── WhatsAppService (WA gateway)                           │
│  │   ├── GenderPollService                                      │
│  │   ├── AnalyticsService                                       │
│  │   └── [+10 more services]                                    │
│  │                                                               │
│  ├── Repository Layer                                           │
│  │   ├── InvitationRepository                                   │
│  │   ├── TransactionRepository                                  │
│  │   ├── GuestRepository                                        │
│  │   └── [+more as needed]                                      │
│  │                                                               │
│  ├── Models (Eloquent ORM)                                      │
│  │   ├── User, Invitation, Package, Theme                       │
│  │   ├── Guest, Rsvp, Comment                                   │
│  │   ├── Transaction, Payment                                   │
│  │   ├── GenderPollVote, LiveStreamSession                       │
│  │   └── [+20 more models]                                      │
│  │                                                               │
│  ├── Job Queue (Laravel Jobs)                                   │
│  │   ├── SendWhatsAppInvitation                                 │
│  │   ├── ProcessPaymentCallback                                 │
│  │   ├── GenerateQrCode                                         │
│  │   ├── TrackPageView                                          │
│  │   └── [+more]                                                │
│  │                                                               │
│  ├── Events & Listeners                                         │
│  │   ├── InvitationActivated → SendActivationNotification       │
│  │   ├── PaymentReceived → SendPaymentConfirmation              │
│  │   ├── RsvpSubmitted → NotifyUserOfRsvp                       │
│  │   └── GenderRevealed → TriggerRevealAnimation                │
│  │                                                               │
│  └── Middleware & Policies                                      │
│      ├── InvitationOwner (authorization)                        │
│      ├── InvitationPassword (password check)                    │
│      ├── InvitationActive (status check)                        │
│      └── Various Policies (Guest, Transaction, etc)             │
└─────────────────────┬───────────────────────────────────────────┘
                      │ (TCP connections)
┌─────────────────────▼───────────────────────────────────────────┐
│                   DATA & EXTERNAL SERVICES                       │
│  ├── MySQL 8 (Primary Database)                                 │
│  ├── Redis 7 (Cache + Queue Broker)                             │
│  ├── Horizon (Queue Manager)                                    │
│  ├── Mailgun / Custom SMTP (Email)                              │
│  ├── S3 / CloudFlare R2 (File Storage)                          │
│  ├── Payment Gateways:                                          │
│  │   ├── Midtrans                                               │
│  │   ├── Xendit                                                 │
│  │   └── Manual Transfer                                        │
│  ├── WhatsApp Gateway (Fonnte / Cloud API)                      │
│  ├── LetsEncrypt / CloudFlare (SSL/Custom Domain)               │
│  └── Analytics (optional: Mixpanel, Plausible)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 2: DESIGN PATTERNS & PRINCIPLES

### 2.1 Architecture Patterns

#### 2.1.1 Service Layer Pattern
```
Controller ← (request) ← Service ← (call) ← Repository ← Model

Example Flow:
POST /invitations → InvitationController::store()
    → Validate request
    → InvitationService::create($data)
        → InvitationRepository::create()
            → Invitation::create()
        → InvitationContentService::saveAll()
            → InvitationContent::create() [per field]
        → Event: InvitationActivated (if auto-active)
    → Return resource response
```

**Rule**: 
- ❌ NO business logic in Controller
- ❌ NO raw DB queries in Model
- ✅ Controller: validate request + call service + return response
- ✅ Service: implement business logic
- ✅ Repository: data access layer
- ✅ Model: ORM definitions + relationships only

#### 2.1.2 Repository Pattern
```php
interface InvitationRepositoryInterface {
    public function create(array $data): Invitation;
    public function update(Invitation $invitation, array $data): void;
    public function findBySlug(string $slug): ?Invitation;
    public function getOwnedBy(int $userId): Collection;
}

class InvitationRepository implements InvitationRepositoryInterface {
    public function __construct(private Invitation $model) {}
    
    public function create(array $data): Invitation {
        return $this->model->create($data);
    }
    // ... implementation
}
```

**Benefit**: Easy to mock, swap implementations, test business logic independent of DB

#### 2.1.3 Strategy Pattern (Payment Gateway)
```
PaymentGatewayManager::driver('midtrans') → MidtransProvider
PaymentGatewayManager::driver('xendit')    → XenditProvider  
PaymentGatewayManager::driver('manual')    → ManualTransferProvider

All implement: PaymentGatewayInterface
- createPayment(Transaction): PaymentResult
- processWebhook(Request): WebhookResult
- checkStatus(string): PaymentStatus
```

**Benefit**: New provider added with 1 registration line, no core code change

#### 2.1.4 EAV Model (Entity-Attribute-Value)
```
Instead of:
  - CREATE TABLE weddings (groom_name, bride_name, ...)
  - CREATE TABLE birthdays (child_name, child_age, ...)

Use single table:
  invitation_contents (invitation_id, content_key, content_value, content_type)
  
Example data:
  (1, 'groom_name', 'Budi', 'text')
  (1, 'bride_name', 'Ani', 'text')
  (1, 'groom_photo', '/path/to/photo.jpg', 'path')
  (2, 'child_name', 'Rafa', 'text')
  (2, 'child_age', '5', 'text')
```

**Benefit**: 
- ✅ New event type = NO schema migration
- ✅ Event-specific fields loaded via InvitationContentService
- ❌ Trade-off: Slightly more complex queries, need EAV indexes

#### 2.1.5 Feature Gate Pattern
```php
$gate = new InvitationFeatureGate($invitation);

// Boolean features
if ($gate->can('amplop_digital')) { ... }
if ($gate->can('custom_domain')) { ... }

// Level-based features
if ($gate->isLevelAtLeast('page_builder', 'intermediate')) { ... }

// Cache: 10 minutes per invitation (invalidate on package change)
```

**Benefit**: Centralized feature access control, easy to test, audit

#### 2.1.6 Event-Driven Architecture
```
Event                       Listener                      Action
─────────────────────────────────────────────────────────────────
InvitationActivated   →  SendActivationNotification  →  Send email
PaymentReceived       →  SendPaymentConfirmation     →  Send email
RsvpSubmitted         →  NotifyUserOfRsvp           →  Queue WA
GenderRevealed        →  TriggerRevealAnimation      →  Emit WebSocket
```

**Benefit**: Decoupled, easy to add new actions without modifying core logic

### 2.2 Design Principles

1. **DRY** (Don't Repeat Yourself): Share code via services, components
2. **SRP** (Single Responsibility): Each class has one reason to change
3. **DIP** (Dependency Inversion): Code depends on abstractions, not concrete implementations
4. **KISS** (Keep It Simple): Straightforward patterns, avoid over-engineering

---

## SECTION 3: DATA ARCHITECTURE

### 3.1 Entity Relationship Overview

```
users (1) ← → (N) invitations
              ├─ (1) event_types
              ├─ (1) packages
              ├─ (1) themes
              ├─ (1) transactions
              │   └─ (N) payments
              ├─ (N) invitation_contents (EAV)
              ├─ (N) invitation_events
              ├─ (1) invitation_settings
              ├─ (N) guests
              │   └─ (N) rsvps
              ├─ (N) comments
              ├─ (N) gallery_photos
              ├─ (N) stories
              ├─ (N) bank_accounts
              ├─ (N) qris_accounts
              ├─ (N) digital_envelope_transactions
              ├─ (N) gift_wishlist_items
              ├─ (N) gender_poll_votes
              ├─ (N) live_stream_sessions
              ├─ (N) interactive_games
              │   └─ (N) game_responses
              ├─ (1) instagram_filter
              ├─ (1) dress_code
              │   ├─ (N) dress_code_items
              │   └─ (N) dress_code_palettes
              ├─ (N) page_views
              ├─ (N) slider_photos
              └─ (N) invitation_payment_methods
```

### 3.2 Core Modules (NO CHANGE to database structure)

**To support new event type**: Just add new entry to `event_types` table

---

## SECTION 4: DEPLOYMENT TOPOLOGY

### 4.1 Development Environment

```
Local machine (Docker)
├── Laravel 12 container (PHP 8.4 + Composer)
├── MySQL 8 container
├── Redis 7 container
├── Mailhog container (email testing)
└── Vite dev server (Hot Module Reloading)

Start: docker-compose up -d
```

### 4.2 Staging/Production Environment

```
Production Server (Ubuntu 22.04 LTS)
├── Nginx (reverse proxy, SSL termination)
├── PHP-FPM 8.4 (application runtime)
├── MySQL 8 (managed: AWS RDS / DigitalOcean)
├── Redis 7 (managed: AWS ElastiCache / DigitalOcean)
├── Horizon supervisor (queue workers)
├── Cron (scheduled jobs: analytics aggregation, certificate renewal)
├── S3/R2 (media storage)
├── Mailgun (transactional email)
└── CloudFlare (CDN + DDoS protection + SSL)
```

### 4.3 High Availability (Future)

```
Load Balancer (AWS ALB / DigitalOcean LB)
├── Server 1 (Laravel + PHP-FPM)
├── Server 2 (Laravel + PHP-FPM)
└── Server 3 (Laravel + PHP-FPM)

Shared:
├── MySQL 8 cluster (primary + replicas)
├── Redis cluster
├── S3/R2 (shared storage)
└── Queue workers (horizontal scaling)
```

---

## SECTION 5: SECURITY ARCHITECTURE

### 5.1 Authentication & Authorization

**Authentication**:
- Laravel Sanctum (API tokens) + Session-based (traditional web)
- OAuth2 (future: Google, Facebook login)

**Authorization**:
- Spatie Laravel Permission (role-based + permission-based)
- Policies (row-level authorization)
- Feature Gate (feature-level authorization)

**Roles**:
1. `super_admin`: Full access + manage other admins
2. `admin`: Manage content + users (no admin management)
3. `customer`: Own invitations only
4. `guest_visitor`: Public page access only (unauthenticated)

### 5.2 Data Protection

**In Transit**:
- HTTPS only (SSL via CloudFlare or LetsEncrypt)
- TLS 1.3 minimum

**At Rest**:
- MySQL: Credentials encrypted (Spatie Encrypted)
- Sensitive fields: API keys, secrets encrypted via Laravel Crypt (AES-256)
- File uploads: Server-side validation + MIME type check

**Backup**:
- Daily automated backups (AWS, managed service)
- Retention: 30 days
- Test restoration monthly

### 5.3 API Security

**Rate Limiting**:
- Public API: 30 requests/min per IP
- Authenticated: 100 requests/min per user
- Payment endpoint: 5 requests/min
- Webhook: 100 requests/min per gateway

**CSRF Protection**:
- Enabled for web routes (not API, not webhooks)

**CORS**:
- Allow frontend domain only
- POST/PUT require token

**Webhook Security**:
- Signature verification mandatory
- IP whitelist (if supported by gateway)
- Idempotency check (prevent double-processing)

---

## SECTION 6: PERFORMANCE ARCHITECTURE

### 6.1 Caching Strategy

| Cache Layer | TTL | Invalidation | Use Case |
|------------|-----|-------------|----------|
| Route cache | - | On deploy | API routes map |
| Config cache | - | On deploy | App config |
| Event types + fields | 1 hour | On create/update | EAV field definitions |
| Payment gateways config | 5 min | On admin update | Gateway credentials |
| Invitation public page | 5 min | On any content update | Public page render |
| Feature gate per invitation | 10 min | On package change | Feature checks |
| Analytics summary | 24 hour | Nightly aggregate | Dashboard stats |
| Query results | 10 min | On relevant mutation | Complex queries |

### 6.2 Database Optimization

**Indexes**:
```sql
-- Invitations
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_invitations_custom_domain ON invitations(custom_domain);

-- Guests & RSVP
CREATE INDEX idx_guests_invitation ON guests(invitation_id);
CREATE INDEX idx_rsvps_guest ON rsvps(guest_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);

-- EAV
CREATE INDEX idx_inv_content_key ON invitation_contents(invitation_id, content_key);

-- Transactions & Payments
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_gateway_ref ON payments(gateway_ref);

-- Analytics
CREATE INDEX idx_page_views_invitation_date ON page_views(invitation_id, created_at);

-- Polling & Gender Reveal
CREATE INDEX idx_gender_poll_ip ON gender_poll_votes(invitation_id, ip_address);
```

**N+1 Query Prevention**:
- Always eager load relations: `.with(['invitation', 'guest', ...])`
- Use query builder select: `.select(['id', 'name', 'email'])`
- Avoid loops + queries inside

### 6.3 Queue Optimization

**Queue Processing**:
- Redis queue with Horizon manager
- Multiple queue channels by priority:
  - `high`: Payment webhooks, critical notifications
  - `default`: Regular jobs
  - `low`: Analytics, cleanup

**Horizon Configuration**:
- Monitor queue depth
- Auto-scale workers: 1 worker base, max 10
- Retry failed jobs: exponential backoff

---

## SECTION 7: MONITORING & OBSERVABILITY

### 7.1 Logging Strategy

**Log Channels**:
- `single`: All application logs (stderr)
- `payment`: Payment-related only (file: storage/logs/payment.log)
- `webhook`: Webhook received (file: storage/logs/webhook.log)
- `queue`: Job processing (Horizon UI)

**What to Log**:
- ✅ Error events (with stack trace)
- ✅ Payment transactions (without credentials)
- ✅ Admin actions (audit trail)
- ❌ Credentials, API keys, sensitive data

### 7.2 Monitoring

**Metrics to Track**:
- Server CPU/Memory/Disk
- Database connection pool usage
- Redis memory usage
- Queue depth (by channel)
- HTTP response times (percentile: p50, p95, p99)
- Error rate (5xx responses)
- Payment success rate
- WA delivery rate

**Tools**:
- Option A: DataDog + Sentry (comprehensive)
- Option B: New Relic (simpler)
- Option C: Self-hosted Prometheus + Grafana (cheapest)

### 7.3 Alerts

**Critical Alerts**:
- Database down
- Queue backlog > 1000
- Error rate > 5%
- Payment gateway API unreachable
- WA gateway failure

**Warning Alerts**:
- Queue backlog > 500
- Error rate > 2%
- Disk usage > 80%
- Memory usage > 90%

---

## SECTION 8: SCALABILITY ROADMAP

### 8.1 Phase 0 (MVP)
- Single server
- MySQL replication (1 primary, 1 read replica)
- Redis single instance
- 100 concurrent users

### 8.2 Phase 1 (1K concurrent users)
- Load balancer
- 2-3 application servers
- MySQL cluster (primary + 2 replicas)
- Redis cluster

### 8.3 Phase 2 (10K+ concurrent users)
- Auto-scaling application servers
- Dedicated cache layer
- Database sharding (by user_id)
- Message queue cluster
- CDN for static assets

---

## SECTION 9: DISASTER RECOVERY

### 9.1 RTO & RPO Targets
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

### 9.2 Backup Strategy
- Daily full backups (S3/DigitalOcean Spaces)
- Hourly incremental backups (automated)
- Test restoration monthly
- Multi-region backup (replication to different region)

### 9.3 Failover Plan
1. Monitor database health continuously
2. Auto-failover to replica if primary down
3. DNS update (via CloudFlare API) to failover server
4. Alert team immediately

---

## SECTION 10: COMPLIANCE & STANDARDS

### 10.1 Data Protection
- GDPR: Implement right-to-be-forgotten, data export
- Personal Data Protection Act (PDPA) Indonesia
- ISO 27001: Plan for Phase 2

### 10.2 Financial Compliance
- PCI-DSS: Payment data never touches our servers (gateway handles)
- Bank Negara Malaysia (BNM) requirements: Plan for expansion
- Anti-Money Laundering (AML): Monitor large transactions

### 10.3 Code Standards
- PSR-12: PHP code style
- TypeScript strict mode
- ESLint config (React standard)
- Prettier for code formatting

---

## SECTION 11: DOCUMENTATION REQUIREMENTS

**Code Documentation**:
- Docblock on all public methods
- README for each major module
- Architecture Decision Records (ADR)

**User Documentation**:
- Help center (markdown-based)
- Video tutorials (YouTube)
- FAQ page
- In-app tooltips

**Admin Documentation**:
- Payment gateway setup guide
- Troubleshooting guide
- Backup & restore procedures

---

## CONCLUSIONS & APPROVAL CHECKLIST

- [x] Architecture documented
- [x] Security architecture reviewed
- [x] Performance architecture planned
- [x] Scalability roadmap created
- [x] Deployment topology defined
- [x] Disaster recovery planned
- [x] Compliance strategy outlined

**Status**: ✅ APPROVED FOR PHASE 0 SETUP

---

*Final Architecture Document v1.0 — 10 Juni 2026*
*Next: Database Design, Module Structure, Implementation Plan*
