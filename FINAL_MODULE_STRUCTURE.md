# UNDESIA Platform — Final Module Structure Document

> **Versi**: 1.0.0 (FINAL)  
> **Tanggal**: 10 Juni 2026  
> **Status**: APPROVED FOR IMPLEMENTATION  
> **Total Components**: 42 Models + 14 Services + 20+ Controllers + 7 Jobs + 4 Events + 4 Policies

---

## EXECUTIVE SUMMARY

Comprehensive documentation of all software modules, their relationships, and responsibilities.

---

## PART 1: ELOQUENT MODELS (42)

### 1.1 User Domain Models (2)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 1 | `User` | users | hasMany: UserProfile, Invitation, Transaction, AdminUser | Core authentication, profile |
| 2 | `UserProfile` | user_profiles | belongsTo: User | Preferences, contact details |

---

### 1.2 Invitation Domain Models (7)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 3 | `Invitation` | invitations | belongsTo: User, EventType, Package, Theme; hasMany: InvitationContent, InvitationEvent, Guest, Payment, etc | Core undangan entity |
| 4 | `InvitationSetting` | invitation_settings | belongsTo: Invitation | Feature toggles per invitation |
| 5 | `InvitationEvent` | invitation_events | belongsTo: Invitation | Multiple event dates (akad, resepsi) |
| 6 | `InvitationContent` | invitation_contents | belongsTo: Invitation | EAV: Event-specific fields |
| 7 | `InvitationPaymentMethod` | invitation_payment_methods | belongsTo: Invitation | Payment method config per invitation |
| 8 | `EventType` | event_types | hasMany: Invitation, EventTypeField | Event type definitions (wedding, birthday, etc) |
| 9 | `EventTypeField` | event_type_fields | belongsTo: EventType | Field definitions per event type (EAV schema) |

---

### 1.3 Guest Domain Models (4)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 10 | `Guest` | guests | belongsTo: Invitation; hasMany: Rsvp, Comment, GameResponse | Guest list management |
| 11 | `Rsvp` | rsvps | belongsTo: Guest, Invitation | RSVP status tracking |
| 12 | `Comment` | comments | belongsTo: Invitation, Guest | Guestbook comments |
| 13 | `GenderPollVote` | gender_poll_votes | belongsTo: Invitation | Gender reveal polling |

---

### 1.4 Media & Content Models (4)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 14 | `GalleryPhoto` | gallery_photos | belongsTo: Invitation | Photos/videos management |
| 15 | `Story` | stories | belongsTo: Invitation | Narrative content (love story, timeline) |
| 16 | `SliderPhoto` | slider_photos | belongsTo: Invitation, Guest | Guestbook slider photos |
| 17 | `Theme` | themes | hasMany: Invitation | Template system |

---

### 1.5 Transaction & Payment Models (4)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 18 | `Transaction` | transactions | belongsTo: User, Invitation, Package; hasMany: Payment | Invoice management |
| 19 | `Payment` | payments | belongsTo: Transaction | Payment attempt tracking (multiple per transaction) |
| 20 | `BankAccount` | bank_accounts | belongsTo: User; hasMany: DigitalEnvelopeTransaction | User bank account storage |
| 21 | `QrisAccount` | qris_accounts | belongsTo: User; hasMany: DigitalEnvelopeTransaction | User QRIS account |

---

### 1.6 Package & Features Models (2)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 22 | `Package` | packages | hasMany: Invitation, PackageFeature, Transaction | Subscription tiers (Basic, Premium, Exclusive) |
| 23 | `PackageFeature` | package_features | belongsTo: Package | Feature availability per package |

---

### 1.7 Interactive Features Models (8)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 24 | `LiveStreamSession` | live_stream_sessions | belongsTo: Invitation | Live stream management (YouTube, Facebook) |
| 25 | `InteractiveGame` | interactive_games | belongsTo: Invitation; hasMany: GameResponse | Quiz/trivia/game hosting |
| 26 | `GameResponse` | game_responses | belongsTo: InteractiveGame, Guest | Game answer tracking & scoring |
| 27 | `InstagramFilter` | instagram_filters | belongsTo: Invitation | Instagram filter configuration |
| 28 | `DressCode` | dress_codes | belongsTo: Invitation; hasMany: DressCodeItem, DressCodePalette | Dress code specification |
| 29 | `DressCodeItem` | dress_code_items | belongsTo: DressCode | Individual dress items |
| 30 | `DressCodePalette` | dress_code_palettes | belongsTo: DressCode | Color palette options |
| 31 | `GiftWishlistItem` | gift_wishlist_items | belongsTo: Invitation, Guest | Gift tracking for birthday/wedding |

---

### 1.8 Payment & Config Models (3)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 32 | `PaymentGatewayConfig` | payment_gateway_configs | hasMany: PaymentGatewayAuditLog | Gateway credentials (encrypted) |
| 33 | `PaymentGatewayAuditLog` | payment_gateway_audit_logs | belongsTo: PaymentGatewayConfig | Audit trail for config changes |
| 34 | `DigitalEnvelopeTransaction` | digital_envelope_transactions | belongsTo: Invitation, Guest, BankAccount, QrisAccount | Amplop digital tracking |

---

### 1.9 System Models (3)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 35 | `PageView` | page_views | belongsTo: Invitation | Analytics: Visitor tracking |
| 36 | `ActivityLog` | activity_logs | belongsTo: User | Audit trail for all changes |
| 37 | `Testimonial` | testimonials | belongsTo: User | Platform testimonials (for marketing) |

---

### 1.10 Admin Models (5)

| # | Model | Table | Relationships | Responsibilities |
|---|-------|-------|---------------|-----------------|
| 38 | `AdminUser` | users (polymorphic) | belongsTo: User | Admin user type identification |
| 39 | `Role` | roles (Spatie) | belongsToMany: Permission, User | Permission role definitions |
| 40 | `Permission` | permissions (Spatie) | belongsToMany: Role, User | Permission definitions |
| 41 | `Setting` | (no table - stored in cache/config) | (none) | System settings |
| 42 | `Invoice` | (generated from Transaction) | (none) | PDF invoice generation |

---

## PART 2: SERVICE LAYER (14+)

### 2.1 Core Services

#### Service #1: InvitationService
**Location**: `app/Services/InvitationService.php`

**Responsibilities**:
- Create invitation with event type
- Update invitation details
- Delete invitation (cascade cleanup)
- Activate/deactivate invitation
- Generate unique slug
- Custom domain validation

**Key Methods**:
```php
public function create(User $user, array $data): Invitation
public function update(Invitation $invitation, array $data): Invitation
public function delete(Invitation $invitation): void
public function activate(Invitation $invitation): void
public function deactivate(Invitation $invitation): void
public function generateSlug(string $title): string
public function validateCustomDomain(string $domain): bool
```

**Dependencies**: InvitationRepository, EventTypeRepository, InvitationContentService

---

#### Service #2: InvitationContentService
**Location**: `app/Services/InvitationContentService.php`

**Responsibilities**:
- Manage EAV fields per event type
- Load field definitions from event_type_fields
- Validate content against field definitions
- Save content to invitation_contents table
- Return formatted content with types

**Key Methods**:
```php
public function getFieldsFor(string $eventType): Collection
public function saveAll(Invitation $invitation, array $content): void
public function getContent(Invitation $invitation): Collection
public function validateContent(string $eventType, array $content): void
```

**Field Definition Structure**:
```php
// For Wedding
weddingFields() → [
    ['key' => 'groom_name', 'type' => 'text', 'required' => true],
    ['key' => 'bride_name', 'type' => 'text', 'required' => true],
    ['key' => 'groom_photo', 'type' => 'file', 'required' => true],
]
```

---

#### Service #3: GuestService
**Location**: `app/Services/GuestService.php`

**Responsibilities**:
- Add guest individually
- Bulk CSV import with validation
- Generate QR codes per guest
- Detect duplicates
- Export guest list

**Key Methods**:
```php
public function addGuest(Invitation $invitation, array $data): Guest
public function importCsv(Invitation $invitation, UploadedFile $file): ImportResult
public function generateQrCode(Guest $guest): string
public function detectDuplicate(Invitation $invitation, string $email): ?Guest
public function exportCsv(Invitation $invitation): string
```

---

#### Service #4: PaymentGatewayManager
**Location**: `app/Services/Payment/PaymentGatewayManager.php`

**Responsibilities**:
- Registry for payment providers
- Create provider instances (Strategy pattern)
- Route to correct gateway

**Key Methods**:
```php
public function driver(string $gateway): PaymentGatewayInterface
public function available(): Collection
public function register(string $name, string $class): void
```

**Implementation Pattern**:
```php
$manager->driver('midtrans') → new MidtransProvider($config)
$manager->driver('xendit') → new XenditProvider($config)
$manager->driver('manual') → new ManualTransferProvider()
```

---

#### Service #5: TransactionService
**Location**: `app/Services/TransactionService.php`

**Responsibilities**:
- Create transaction
- Generate invoice number
- Update transaction status
- Process payment completion
- Handle refunds

**Key Methods**:
```php
public function create(User $user, Invitation $invitation, Package $package): Transaction
public function generateInvoiceNumber(): string
public function processPayment(Transaction $transaction, string $gateway): PaymentResult
public function confirm(Transaction $transaction, Payment $payment): void
public function cancel(Transaction $transaction): void
```

---

### 2.2 Domain Services

#### Service #6: RsvpService
**Location**: `app/Services/RsvpService.php`

**Responsibilities**:
- Submit RSVP
- Update RSVP status
- Prevent duplicate RSVPs
- Calculate attendance counts

**Key Methods**:
```php
public function submitRsvp(Guest $guest, array $data): Rsvp
public function updateRsvp(Rsvp $rsvp, array $data): Rsvp
public function getAttendanceCount(Invitation $invitation): int
public function getTallyByStatus(Invitation $invitation): array
```

---

#### Service #7: GenderPollService
**Location**: `app/Services/GenderPollService.php`

**Responsibilities**:
- Cast vote (Team A or Team B)
- Prevent duplicate votes (IP-based)
- Get vote tally
- Reveal result

**Key Methods**:
```php
public function vote(Invitation $invitation, string $team, string $ipAddress): GenderPollVote
public function getTally(Invitation $invitation): array // {team_a: 100, team_b: 95}
public function reveal(Invitation $invitation): string // Triggers event
public function canVote(Invitation $invitation, string $ipAddress): bool
```

---

#### Service #8: AnalyticsService
**Location**: `app/Services/AnalyticsService.php`

**Responsibilities**:
- Track page views
- Aggregate analytics by time period
- Generate dashboard stats
- Handle different analytics levels

**Key Methods**:
```php
public function trackPageView(Invitation $invitation, Request $request): void
public function getDashboardStats(Invitation $invitation, string $level): array
public function getVisitorTrend(Invitation $invitation, int $days): Collection
public function getDeviceBreakdown(Invitation $invitation): array
```

---

#### Service #9: WhatsAppService
**Location**: `app/Services/WhatsAppService.php`

**Responsibilities**:
- Send WA messages via provider
- Template variable substitution
- Queue message sending
- Handle delivery tracking

**Key Methods**:
```php
public function sendMessage(string $phoneNumber, string $message): bool
public function sendInvitation(Guest $guest): bool
public function sendRsvpReminder(Guest $guest): bool
public function sendPaymentConfirmation(User $user): bool
public function getDeliveryStatus(string $messageId): string
```

---

#### Service #10: NotificationService
**Location**: `app/Services/NotificationService.php`

**Responsibilities**:
- Route notifications (email, WA, SMS)
- Respect user preferences
- Queue notifications

**Key Methods**:
```php
public function send(User $user, string $type, array $data): void
public function sendEmail(User $user, string $type, array $data): void
public function sendWhatsApp(User $user, string $type, array $data): void
public function respect Preferences(User $user): bool
```

---

#### Service #11: InvitationFeatureGate
**Location**: `app/Services/InvitationFeatureGate.php`

**Responsibilities**:
- Check feature access for invitation
- Handle boolean and level-based features
- Cache feature access

**Key Methods**:
```php
public function can(string $feature): bool
public function getLevel(string $feature): string // basic, intermediate, full
public function isLevelAtLeast(string $feature, string $requiredLevel): bool
public function allFeaturesFor(string $level): Collection
```

---

#### Service #12: PageBuilderService
**Location**: `app/Services/PageBuilderService.php`

**Responsibilities**:
- Initialize builder sections
- Reorder sections
- Duplicate sections
- Generate public page

**Key Methods**:
```php
public function initializeSections(Invitation $invitation): void
public function getDefaultSections(string $eventType): Collection
public function reorder(Invitation $invitation, array $sectionIds): void
public function duplicateSection(Invitation $invitation, string $sectionId): void
public function generatePublicPage(Invitation $invitation): string
```

---

#### Service #13: QrCodeService
**Location**: `app/Services/QrCodeService.php`

**Responsibilities**:
- Generate QR code per guest
- Encode guest token in QR
- Verify QR code on check-in

**Key Methods**:
```php
public function generate(Guest $guest): string // Returns QR code image path
public function encodeData(Guest $guest): string
public function verify(string $qrData): ?Guest
```

---

#### Service #14: ThemeService
**Location**: `app/Services/ThemeService.php`

**Responsibilities**:
- Apply theme to invitation
- Manage theme colors
- Generate theme CSS

**Key Methods**:
```php
public function apply(Invitation $invitation, Theme $theme): void
public function generateCss(Theme $theme): string
public function validate(array $colors): void
```

---

## PART 3: CONTROLLERS (20+)

### 3.1 API Controllers

#### Controller #1: AuthController
**Location**: `app/Http/Controllers/API/AuthController.php`

**Routes**:
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login
- `POST /api/auth/logout` — User logout
- `POST /api/auth/refresh` — Token refresh
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Password reset confirmation

**Methods**:
```php
public function register(RegisterRequest $request): JsonResponse
public function login(LoginRequest $request): JsonResponse
public function logout(Request $request): JsonResponse
public function refresh(Request $request): JsonResponse
public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
public function resetPassword(ResetPasswordRequest $request): JsonResponse
```

---

#### Controller #2: InvitationController
**Location**: `app/Http/Controllers/API/InvitationController.php`

**Routes**:
- `GET /api/invitations` — List user's invitations
- `POST /api/invitations` — Create invitation
- `GET /api/invitations/{id}` — View invitation
- `PUT /api/invitations/{id}` — Update invitation
- `DELETE /api/invitations/{id}` — Delete invitation
- `POST /api/invitations/{id}/activate` — Activate
- `POST /api/invitations/{id}/deactivate` — Deactivate
- `GET /api/invitations/{slug}` — Public view (unauthenticated)

**Methods**:
```php
public function index(Request $request): JsonResponse
public function store(StoreInvitationRequest $request): JsonResponse
public function show(Invitation $invitation): JsonResponse
public function update(UpdateInvitationRequest $request, Invitation $invitation): JsonResponse
public function destroy(Invitation $invitation): JsonResponse
public function activate(Invitation $invitation): JsonResponse
public function publicShow(string $slug): JsonResponse
```

---

#### Controller #3: GuestController
**Location**: `app/Http/Controllers/API/GuestController.php`

**Routes**:
- `GET /api/invitations/{id}/guests` — List guests
- `POST /api/invitations/{id}/guests` — Add guest
- `PUT /api/guests/{id}` — Update guest
- `DELETE /api/guests/{id}` — Delete guest
- `POST /api/invitations/{id}/guests/import` — CSV import
- `GET /api/invitations/{id}/guests/export` — Export CSV

**Methods**:
```php
public function index(Invitation $invitation): JsonResponse
public function store(StoreGuestRequest $request, Invitation $invitation): JsonResponse
public function update(UpdateGuestRequest $request, Guest $guest): JsonResponse
public function destroy(Guest $guest): JsonResponse
public function import(ImportGuestRequest $request, Invitation $invitation): JsonResponse
public function export(Invitation $invitation): StreamedResponse
```

---

#### Controller #4: RsvpController
**Location**: `app/Http/Controllers/API/RsvpController.php`

**Routes**:
- `GET /api/invitations/{slug}/rsvp-status` — Get RSVP form
- `POST /api/invitations/{slug}/rsvp` — Submit RSVP

**Methods**:
```php
public function form(string $slug): JsonResponse
public function submit(SubmitRsvpRequest $request, string $slug): JsonResponse
public function list(Invitation $invitation): JsonResponse
```

---

#### Controller #5: TransactionController
**Location**: `app/Http/Controllers/API/TransactionController.php`

**Routes**:
- `GET /api/transactions` — List user's transactions
- `POST /api/transactions` — Create transaction (checkout)
- `GET /api/transactions/{id}` — View transaction
- `GET /api/transactions/{id}/status` — Check payment status

**Methods**:
```php
public function index(Request $request): JsonResponse
public function store(StoreTransactionRequest $request): JsonResponse
public function show(Transaction $transaction): JsonResponse
public function checkStatus(Transaction $transaction): JsonResponse
```

---

#### Controller #6: PaymentController
**Location**: `app/Http/Controllers/API/PaymentController.php`

**Routes**:
- `POST /api/payments/checkout` — Initiate payment
- `GET /api/payments/{id}/status` — Check status
- `POST /api/webhooks/payment/{gateway}` — Payment gateway webhooks (CSRF exempt)

**Methods**:
```php
public function checkout(CheckoutRequest $request): JsonResponse
public function status(Payment $payment): JsonResponse
public function webhook(Request $request, string $gateway): Response
public function verify(Request $request): bool // Signature verification
```

---

#### Controller #7: CommentController
**Location**: `app/Http/Controllers/API/CommentController.php`

**Routes**:
- `GET /api/invitations/{slug}/comments` — List comments
- `POST /api/invitations/{slug}/comments` — Submit comment

**Methods**:
```php
public function index(string $slug): JsonResponse
public function store(StoreCommentRequest $request, string $slug): JsonResponse
```

---

#### Controller #8: AnalyticsController
**Location**: `app/Http/Controllers/API/AnalyticsController.php`

**Routes**:
- `GET /api/invitations/{id}/analytics/dashboard` — Dashboard stats
- `GET /api/invitations/{id}/analytics/visitors` — Visitor trend
- `GET /api/invitations/{id}/analytics/devices` — Device breakdown
- `GET /api/invitations/{id}/analytics/export` — Export CSV

**Methods**:
```php
public function dashboard(Invitation $invitation, Request $request): JsonResponse
public function visitors(Invitation $invitation, Request $request): JsonResponse
public function devices(Invitation $invitation): JsonResponse
public function export(Invitation $invitation): StreamedResponse
```

---

#### Controller #9: AmployController
**Location**: `app/Http/Controllers/API/AmplopeController.php`

**Routes**:
- `POST /api/invitations/{slug}/amplope` — Submit envelope
- `GET /api/invitations/{id}/amplope/summary` — Owner: Envelope summary
- `GET /api/invitations/{id}/amplope/list` — Owner: Envelope list
- `POST /api/bank-accounts` — Owner: Add bank account
- `GET /api/bank-accounts` — Owner: List accounts
- `PUT /api/bank-accounts/{id}` — Owner: Update account

**Methods**:
```php
public function submit(SubmitEnvelopeRequest $request, string $slug): JsonResponse
public function summary(Invitation $invitation): JsonResponse
public function list(Invitation $invitation): JsonResponse
public function addBankAccount(AddBankAccountRequest $request): JsonResponse
public function listBankAccounts(): JsonResponse
public function updateBankAccount(UpdateBankAccountRequest $request, BankAccount $account): JsonResponse
```

---

### 3.2 Additional Controllers

**Controller #10**: GenderPollController (gender reveal voting)
**Controller #11**: GalleryController (photo/video upload)
**Controller #12**: StoriesController (narrative content)
**Controller #13**: DressCodeController (dress code management)
**Controller #14**: LiveStreamController (live stream management)
**Controller #15**: InteractiveGameController (game hosting)
**Controller #16**: PageBuilderController (section management)
**Controller #17**: SettingsController (user preferences)
**Controller #18**: UserProfileController (profile management)

### 3.3 Admin Controllers

**AdminController**: Dashboard, system stats  
**UserManagementController**: Manage users, roles  
**PaymentGatewayController**: Configure payment providers  
**TestimonialController**: Moderation  
**AnalyticsController**: System-wide analytics

---

## PART 4: JOBS (7)

### Queue Jobs

| # | Job | Queue | Trigger | Purpose |
|---|-----|-------|---------|---------|
| 1 | `SendWhatsAppInvitation` | default | InvitationActivated event | Send WA invitation to guests |
| 2 | `SendEmailNotification` | default | InvitationActivated event | Send email notifications |
| 3 | `ProcessPaymentWebhook` | high | POST /webhooks/payment | Process payment gateway callback |
| 4 | `GenerateQrCodeJob` | default | Guest created | Generate QR code image |
| 5 | `TrackPageViewJob` | low | Page viewed | Record analytics |
| 6 | `SendWhatsAppRsvpNotification` | default | RsvpSubmitted event | Notify owner of RSVP |
| 7 | `AggregateAnalyticsSummary` | low | Daily cron (midnight) | Aggregate page_views to summaries |

**Job Location**: `app/Jobs/`

---

## PART 5: EVENTS & LISTENERS (4)

### Events

| # | Event | Trigger | Listeners |
|---|-------|---------|-----------|
| 1 | `InvitationActivated` | Invitation activated | SendActivationEmail, SendActivationWhatsApp |
| 2 | `PaymentReceived` | Payment successful | SendPaymentConfirmationEmail, ActivateInvitation |
| 3 | `RsvpSubmitted` | Guest submits RSVP | SendRsvpNotificationToOwner, UpdateGuestStatus |
| 4 | `GenderRevealed` | Gender result revealed | BroadcastRevealAnimation, SendRevealNotification |

**Event Location**: `app/Events/`  
**Listener Location**: `app/Listeners/`

---

## PART 6: POLICIES (4)

### Authorization Policies

| # | Policy | Model | Methods |
|---|--------|-------|---------|
| 1 | `InvitationPolicy` | Invitation | view, create, update, delete, activate, manage |
| 2 | `GuestPolicy` | Guest | create, update, delete |
| 3 | `TransactionPolicy` | Transaction | view, create |
| 4 | `CommentPolicy` | Comment | create, delete, moderate |

**Policy Location**: `app/Policies/`

**Example**:
```php
class InvitationPolicy {
    public function view(User $user, Invitation $invitation): bool {
        return $user->id === $invitation->user_id; // Owner only
    }
    
    public function update(User $user, Invitation $invitation): bool {
        return $user->id === $invitation->user_id && $invitation->status !== 'expired';
    }
}
```

---

## PART 7: MIDDLEWARE (5)

| # | Middleware | Purpose | Applied To |
|---|-----------|---------|-----------|
| 1 | `InvitationOwner` | Verify user owns invitation | Invitation edit/delete |
| 2 | `InvitationActive` | Verify invitation not expired | Public page view |
| 3 | `InvitationPassword` | Verify invitation password (if set) | Public page view |
| 4 | `CheckFeatureGate` | Verify feature access per package | Feature endpoints |
| 5 | `RateLimit` | Rate limiting per endpoint | API routes |

**Middleware Location**: `app/Http/Middleware/`

---

## PART 8: REQUESTS (FORM REQUESTS)

**Location**: `app/Http/Requests/`

| # | Request Class | Validates | Rules |
|---|---------------|-----------|-------|
| 1 | `StoreInvitationRequest` | New invitation | name, event_type_id, package_id, title, description |
| 2 | `UpdateInvitationRequest` | Update invitation | title, description, custom_domain |
| 3 | `StoreGuestRequest` | Add guest | name, email, phone_number |
| 4 | `ImportGuestRequest` | CSV import | file (csv), max 5000 rows |
| 5 | `SubmitRsvpRequest` | RSVP form | status, headcount, dietary_restrictions |
| 6 | `StoreCommentRequest` | New comment | comment_text, guest_name, guest_email |
| 7 | `CheckoutRequest` | Payment checkout | transaction_id, payment_gateway |
| 8 | `SubmitEnvelopeRequest` | Amplope submission | amount, message, payment_method |

---

## PART 9: RESOURCES (API RESPONSES)

**Location**: `app/Http/Resources/`

| # | Resource | Model | Fields Returned |
|---|----------|-------|-----------------|
| 1 | `InvitationResource` | Invitation | id, slug, title, status, event_type, package, created_at |
| 2 | `GuestResource` | Guest | id, name, email, rsvp_status, checked_in_at |
| 3 | `TransactionResource` | Transaction | id, invoice_number, amount, status, created_at |
| 4 | `PaymentResource` | Payment | id, gateway, status, amount, created_at |
| 5 | `CommentResource` | Comment | id, text, guest_name, created_at, status |

---

## PART 10: REPOSITORIES (5)

**Location**: `app/Repositories/`

| # | Repository | Model | Methods |
|---|-----------|-------|---------|
| 1 | `InvitationRepository` | Invitation | create, update, findBySlug, findByDomain, getOwnedBy, delete |
| 2 | `GuestRepository` | Guest | create, bulkCreate, update, delete, getDuplicates |
| 3 | `TransactionRepository` | Transaction | create, findByInvoice, getByUser, getByStatus |
| 4 | `PaymentRepository` | Payment | create, findByGatewayRef, getByTransaction |
| 5 | `PageViewRepository` | PageView | record, getStats, getByDateRange |

---

## PART 11: COMMANDS (ARTISAN)

**Location**: `app/Console/Commands/`

| # | Command | Purpose |
|---|---------|---------|
| 1 | `domain:verify-pending` | Verify pending custom domains |
| 2 | `certificate:renew` | Renew SSL certificates (scheduled) |
| 3 | `payment:sync-status` | Sync payment status from gateways |
| 4 | `analytics:aggregate` | Aggregate page_views to summaries (scheduled) |
| 5 | `admin:create-user` | Create admin user |

---

## PART 12: COMPONENT DEPENDENCY GRAPH

```
User
├── UserProfile
├── Invitation
│   ├── EventType
│   ├── EventTypeField (via EAV)
│   ├── InvitationContent (EAV data)
│   ├── InvitationEvent
│   ├── InvitationSetting
│   ├── Guest
│   │   ├── Rsvp
│   │   ├── Comment
│   │   ├── GameResponse
│   │   ├── GenderPollVote
│   │   ├── DigitalEnvelopeTransaction
│   │   └── SliderPhoto
│   ├── GalleryPhoto
│   ├── Story
│   ├── LiveStreamSession
│   ├── InteractiveGame
│   ├── InstagramFilter
│   ├── DressCode
│   ├── GiftWishlistItem
│   ├── PageView
│   ├── Theme
│   ├── Transaction
│   │   ├── Payment
│   │   └── Package
│   └── InvitationPaymentMethod
├── BankAccount
│   └── DigitalEnvelopeTransaction
├── QrisAccount
│   └── DigitalEnvelopeTransaction
└── ActivityLog
```

---

## PART 13: SERVICE INTERDEPENDENCIES

```
Controller
├── InvitationService
│   ├── InvitationRepository
│   ├── InvitationContentService
│   │   └── EventTypeRepository
│   ├── InvitationFeatureGate
│   └── ThemeService
├── GuestService
│   ├── GuestRepository
│   ├── QrCodeService
│   └── GuestRepository
├── TransactionService
│   ├── TransactionRepository
│   ├── PaymentGatewayManager
│   └── PaymentRepository
├── RsvpService
│   ├── RsvpRepository
│   └── GuestRepository
├── AnalyticsService
│   ├── PageViewRepository
│   └── InvitationRepository
├── PageBuilderService
│   └── InvitationRepository
└── WhatsAppService (via NotificationService)
    └── WhatsApp Provider
```

---

## PART 14: CACHING STRATEGY BY MODULE

| Module | Cache Key | TTL | Invalidation |
|--------|-----------|-----|-------------|
| EventType Fields | `event_type_fields:{id}` | 1 hour | On create/update |
| Payment Config | `payment_config:{gateway}` | 5 min | On admin update |
| Invitation Page | `invitation:{slug}` | 5 min | On any content change |
| Feature Gate | `invitation_features:{id}` | 10 min | On package change |
| Analytics | `analytics:{id}:{period}` | 24 hours | Daily rebuild |
| User Preferences | `user_pref:{id}` | 1 hour | On profile update |

---

## PART 15: TESTING STRUCTURE

```
tests/
├── Unit/
│   ├── Services/ (business logic - 95% coverage)
│   │   ├── InvitationServiceTest
│   │   ├── GestServiceTest
│   │   ├── RsvpServiceTest
│   │   ├── PaymentGatewayManagerTest
│   │   └── ... (more)
│   ├── Models/ (relationships, mutators)
│   └── Repositories/ (data access)
├── Feature/
│   ├── Auth/ (authentication flows)
│   ├── Invitations/ (invitation CRUD)
│   ├── Guests/ (guest management)
│   ├── Payments/ (payment integration)
│   └── Admin/ (admin functions)
└── E2E/
    └── CriticalFlows.spec.ts (React/Cypress)
```

---

## CONCLUSION

**Total Components**: 
- 42 Models
- 14+ Services  
- 20+ Controllers
- 7 Queue Jobs
- 4 Events
- 4 Policies
- 5+ Repositories
- 8+ Middleware
- 15+ Form Requests
- 5+ API Resources

**Estimated LOC**: ~15,000 lines (backend) + ~8,000 lines (frontend)

**Modularity Score**: 9/10 (service layer separates concerns well)

---

*Final Module Structure v1.0 — 10 Juni 2026*
*All components documented and ready for implementation*
