# UNDESIA Platform — Final Permission & Feature Matrix

> **Versi**: 1.0.0 (FINAL)  
> **Tanggal**: 10 Juni 2026  
> **Status**: APPROVED FOR IMPLEMENTATION

---

## PART 1: PERMISSION MATRIX (Role-Based Access Control)

### 1.1 Role Definitions

| Role | Level | Purpose | User Type |
|------|-------|---------|-----------|
| **super_admin** | 5 | Full platform access + admin management | Internal team |
| **admin** | 4 | Content management + support | Internal team |
| **customer** | 3 | Invitation management + own data | Paying user |
| **guest_visitor** | 1 | Public page access only | Unauthenticated |

---

### 1.2 Permission Hierarchy

**47 Total Permissions** across 8 domains:

#### Domain A: User Management (6 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| View user profile | `users.view` | ✅ | ✅ | ✅ (self) | ❌ |
| Edit user profile | `users.edit` | ✅ | ❌ | ✅ (self) | ❌ |
| Delete user | `users.delete` | ✅ | ❌ | ❌ | ❌ |
| View all users | `users.list` | ✅ | ❌ | ❌ | ❌ |
| Manage admin users | `users.admin.manage` | ✅ | ❌ | ❌ | ❌ |
| Change user role | `users.role.change` | ✅ | ❌ | ❌ | ❌ |

---

#### Domain B: Invitation Management (8 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| Create invitation | `invitations.create` | ✅ | ✅ | ✅ | ❌ |
| View own invitations | `invitations.view` | ✅ | ✅ | ✅ | ❌ |
| View all invitations | `invitations.view.all` | ✅ | ✅ | ❌ | ❌ |
| Edit invitation | `invitations.edit` | ✅ | ✅ | ✅ (own) | ❌ |
| Delete invitation | `invitations.delete` | ✅ | ✅ | ✅ (own) | ❌ |
| Publish invitation | `invitations.publish` | ✅ | ✅ | ✅ (own) | ❌ |
| Activate custom domain | `invitations.custom_domain` | ✅ | ❌ | ✅ (own, if Premium+) | ❌ |
| Access builder | `invitations.builder` | ✅ | ✅ | ✅ (own, if level allowed) | ❌ |

---

#### Domain C: Guest Management (5 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| View guests | `guests.view` | ✅ | ✅ | ✅ (own) | ❌ |
| Add guest | `guests.create` | ✅ | ✅ | ✅ (own) | ❌ |
| Edit guest | `guests.edit` | ✅ | ✅ | ✅ (own) | ❌ |
| Delete guest | `guests.delete` | ✅ | ✅ | ✅ (own) | ❌ |
| Import CSV | `guests.import` | ✅ | ✅ | ✅ (own) | ❌ |

---

#### Domain D: Transaction & Payment (7 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| View transactions | `transactions.view` | ✅ | ✅ | ✅ (own) | ❌ |
| View all transactions | `transactions.view.all` | ✅ | ✅ | ❌ | ❌ |
| Create transaction | `transactions.create` | ✅ | ❌ | ✅ (own) | ❌ |
| View payments | `payments.view` | ✅ | ✅ | ✅ (own) | ❌ |
| Manage payment methods | `payments.methods` | ✅ | ✅ | ✅ (own) | ❌ |
| Process refund | `payments.refund` | ✅ | ✅ | ❌ | ❌ |
| Download receipt | `payments.receipt` | ✅ | ✅ | ✅ (own) | ❌ |

---

#### Domain E: Analytics & Reporting (5 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| View invitation analytics | `analytics.view` | ✅ | ✅ | ✅ (own, if allowed) | ❌ |
| View system analytics | `analytics.system` | ✅ | ✅ | ❌ | ❌ |
| Export reports | `analytics.export` | ✅ | ✅ | ✅ (own, if Premium+) | ❌ |
| View financial reports | `analytics.financial` | ✅ | ✅ | ❌ | ❌ |
| Schedule reports | `analytics.schedule` | ✅ | ❌ | ❌ | ❌ |

---

#### Domain F: Content Management (8 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| Upload media | `content.media.upload` | ✅ | ✅ | ✅ (own) | ❌ |
| Delete media | `content.media.delete` | ✅ | ✅ | ✅ (own) | ❌ |
| Manage stories | `content.stories` | ✅ | ✅ | ✅ (own) | ❌ |
| Manage gallery | `content.gallery` | ✅ | ✅ | ✅ (own) | ❌ |
| Manage themes | `content.themes` | ✅ | ✅ | ✅ (limited) | ❌ |
| Create custom theme | `content.themes.custom` | ✅ | ❌ | ✅ (if Exclusive) | ❌ |
| Moderate comments | `content.comments.moderate` | ✅ | ✅ | ❌ | ❌ |
| Approve photos | `content.photos.approve` | ✅ | ✅ | ✅ (own) | ❌ |

---

#### Domain G: System Administration (6 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| Manage payment gateways | `system.payment_gateways` | ✅ | ❌ | ❌ | ❌ |
| View audit logs | `system.audit_logs` | ✅ | ✅ | ❌ | ❌ |
| Manage settings | `system.settings` | ✅ | ❌ | ❌ | ❌ |
| View system health | `system.health` | ✅ | ✅ | ❌ | ❌ |
| Manage testimonials | `system.testimonials.manage` | ✅ | ✅ | ❌ | ❌ |
| Backup database | `system.backup` | ✅ | ❌ | ❌ | ❌ |

---

#### Domain H: Amplop Digital (2 permissions)

| Permission | Key | Super Admin | Admin | Customer | Guest |
|------------|-----|-------------|-------|----------|-------|
| Manage bank accounts | `amplope.accounts` | ✅ | ❌ | ✅ (own) | ❌ |
| Withdraw funds | `amplope.withdraw` | ✅ | ✅ | ✅ (own) | ❌ |

---

### 1.3 Permission Seeding

```php
// Database Seeder in app/Database/Seeders/PermissionSeeder.php

$permissions = [
    // User Management
    'users.view', 'users.edit', 'users.delete', 'users.list', 
    'users.admin.manage', 'users.role.change',
    
    // Invitations (8)
    'invitations.create', 'invitations.view', 'invitations.view.all',
    'invitations.edit', 'invitations.delete', 'invitations.publish',
    'invitations.custom_domain', 'invitations.builder',
    
    // Guests (5)
    'guests.view', 'guests.create', 'guests.edit', 'guests.delete', 'guests.import',
    
    // Transactions (7)
    'transactions.view', 'transactions.view.all', 'transactions.create',
    'payments.view', 'payments.methods', 'payments.refund', 'payments.receipt',
    
    // Analytics (5)
    'analytics.view', 'analytics.system', 'analytics.export',
    'analytics.financial', 'analytics.schedule',
    
    // Content (8)
    'content.media.upload', 'content.media.delete', 'content.stories',
    'content.gallery', 'content.themes', 'content.themes.custom',
    'content.comments.moderate', 'content.photos.approve',
    
    // System (6)
    'system.payment_gateways', 'system.audit_logs', 'system.settings',
    'system.health', 'system.testimonials.manage', 'system.backup',
    
    // Amplope (2)
    'amplope.accounts', 'amplope.withdraw'
];

// Assign to roles
$superAdminRole->syncPermissions($permissions); // All
$adminRole->syncPermissions([all except admin-only]);
$customerRole->syncPermissions([customer permissions only]);
```

---

### 1.4 Row-Level Authorization (Policies)

**InvitationPolicy**:
```php
public function view(User $user, Invitation $invitation): bool {
    // Super admin: view all
    if ($user->hasRole('super_admin')) return true;
    // Admin: view all
    if ($user->hasRole('admin')) return true;
    // Customer: own only
    return $user->id === $invitation->user_id;
}

public function edit(User $user, Invitation $invitation): bool {
    return $user->id === $invitation->user_id && 
           !in_array($invitation->status, ['expired', 'archived']);
}
```

**GuestPolicy**:
```php
public function create(User $user, Invitation $invitation): bool {
    return $user->id === $invitation->user_id;
}
```

---

### 1.5 Feature Gate Permissions

**Feature Gate Checks** (via InvitationFeatureGate):
```php
// Check if user's invitation package allows feature
$gate = new InvitationFeatureGate($invitation);

if ($gate->can('page_builder')) { ... } // Boolean check
if ($gate->isLevelAtLeast('page_builder', 'intermediate')) { ... } // Level check
```

---

## PART 2: FEATURE MATRIX (By Package Tier)

### 2.1 Package Tiers Overview

| Tier | Monthly Price | Annual Price | Target | Commitment |
|------|---------------|--------------|--------|-----------|
| **Basic** | Rp 99,000 | Rp 990,000 | Individual/Small events | Best for starters |
| **Premium** | Rp 249,000 | Rp 2,490,000 | Growing events | Most popular |
| **Exclusive** | Rp 499,000 | Rp 4,990,000 | Large/Professional | Full features |

---

### 2.2 Core Features (All Packages)

**UNLIMITED for ALL packages** (not a limiting factor):
- ✅ Guest count (unlimited)
- ✅ RSVP submissions (unlimited)
- ✅ Photos upload (unlimited)
- ✅ Videos upload (unlimited)
- ✅ Page views/analytics tracking (unlimited)
- ✅ Event dates (up to 10)
- ✅ Guestbook comments (unlimited)

---

### 2.3 Feature Availability Matrix

| Feature | Basic | Premium | Exclusive | Feature Type |
|---------|-------|---------|-----------|-------------|
| **Page Builder** | Dasar | Menengah | Penuh | Level |
| • View sections | ✅ | ✅ | ✅ | |
| • Reorder sections | ❌ | ✅ | ✅ | |
| • Edit settings | ❌ | ✅ | ✅ | |
| • Duplicate section | ❌ | ❌ | ✅ | |
| • Custom sections | ❌ | ❌ | ✅ | |
| **Analytics** | Dasar | Lengkap | Advanced | Level |
| • Visitor count | ✅ | ✅ | ✅ | |
| • Daily trends | ✅ | ✅ | ✅ | |
| • Device breakdown | ❌ | ✅ | ✅ | |
| • Referrer source | ❌ | ✅ | ✅ | |
| • Custom date range | ❌ | ❌ | ✅ | |
| • Export to CSV | ❌ | ✅ | ✅ | |
| • Export to PDF | ❌ | ❌ | ✅ | |
| **Custom Domain** | ❌ | ✅ | ✅ | Boolean |
| **Page Password** | ❌ | ✅ | ✅ | Boolean |
| **Amplop Digital** | ❌ | ✅ | ✅ | Boolean |
| • Bank transfer | ❌ | ✅ | ✅ | |
| • QRIS | ❌ | ✅ | ✅ | |
| • Withdrawal | ❌ | ✅ | ✅ | |
| **Gift Wishlist** | ❌ | ✅ | ✅ | Boolean |
| **Gender Reveal Poll** | ❌ | ✅ | ✅ | Boolean |
| **Live Stream** | ❌ | ✅ | ✅ | Boolean |
| **Interactive Games** | ❌ | ✅ | ✅ | Boolean |
| **Instagram Filter** | ❌ | ❌ | ✅ | Boolean |
| **Dress Code** | ❌ | ✅ | ✅ | Boolean |
| **Advanced Themes** | Basic set | Extended set | Full set + custom | By package |
| **WA Reminders** | ❌ | ✅ | ✅ | Boolean |
| **Email Marketing** | ❌ | ❌ | ✅ | Boolean |
| **API Access** | ❌ | ❌ | ✅ | Boolean |
| **Priority Support** | ❌ | ❌ | ✅ | Boolean |
| **Custom Branding** | ❌ | ❌ | ✅ | Boolean |
| **Dedicated Account Manager** | ❌ | ❌ | ✅ | Boolean |

---

### 2.4 Feature Specifications by Level

#### 2.4.1 Page Builder Levels

**Basic**:
- View predefined sections (Hero, Event Info, Gallery, RSVP, Guestbook, Footer)
- Cannot reorder or customize
- Read-only builder view

**Menengah (Premium)**:
- View + Reorder sections via drag-drop
- Edit section settings (colors, text, images)
- Preview changes live
- Cannot duplicate or create new sections

**Penuh (Exclusive)**:
- All Premium features
- Duplicate sections
- Create custom sections
- Advanced CSS customization (for power users)
- Undo/redo history

---

#### 2.4.2 Analytics Levels

**Dasar**:
- Dashboard widget: Total visitors
- Line chart: Last 7 days trend
- Visitor count table

**Lengkap**:
- All Basic features
- Device breakdown (mobile/tablet/desktop pie chart)
- Referrer source (top 10)
- Last 30 days data
- Export to CSV

**Advanced**:
- All Lengkap features
- Custom date range queries
- Hourly breakdown
- Geographic data (country/city if available)
- Engagement metrics (scroll depth, time on page)
- PDF report generation
- Scheduled email reports
- API access to analytics data

---

#### 2.4.3 Theme Sets

**Basic** (3 free themes):
- Minimalist
- Elegant
- Modern

**Premium** (10 themes):
- All Basic + 7 additional themes
- Extended color customization

**Exclusive** (20+ themes + custom):
- All Premium themes
- Create custom themes from scratch
- Share themes (with commission model in future)

---

### 2.5 Data Retention

| Item | Retention | Applicable To |
|------|-----------|-------------|
| Guest list | Indefinite (until deleted) | All |
| RSVPs | Indefinite (until deleted) | All |
| Photos/Videos | Indefinite (until deleted) | All |
| Comments | Indefinite (moderation) | All |
| Page views (raw) | 30 days | All |
| Analytics summaries | 1 year | All |
| Transactions | 7 years (compliance) | All |
| Invitation | Indefinite (until deleted) | All |

---

### 2.6 Support SLA

| Tier | Support Hours | Response Time | Issue Resolution |
|------|---------------|-------|---------|
| Basic | Business hours | 24 hours | 7 days |
| Premium | Business hours | 12 hours | 3 days |
| Exclusive | 24/7 | 4 hours (critical) | 1 day (critical), 3 days (non-critical) |

---

### 2.7 Event Type Support

**All packages support all 6 event types**:
- ✅ Wedding (Pernikahan)
- ✅ Birthday (Ulang Tahun)
- ✅ Khitanan
- ✅ Aqiqah
- ✅ Gender Reveal
- ✅ Syukuran/Selamatan
- ✅ Generic

**No restrictions by package tier**

---

### 2.8 Payment Gateway Support

**All Packages**:
- ✅ Midtrans (SNap + Core)
- ✅ Xendit (Invoice + Disbursement)
- ✅ Manual Bank Transfer

**Amplop Digital Payment** (Premium+):
- ✅ Bank Transfer
- ✅ QRIS
- ❌ E-wallet (future)

---

### 2.9 Pricing Strategy Details

**Monthly Billing**:
- Auto-renew every month (cancellable anytime)
- Invoice emailed on renewal date
- Payment via Midtrans/Xendit only

**Annual Billing** (10% discount):
- 1-year commitment
- Invoice emailed upfront
- Can downgrade on next annual renewal (pro-rata refund)

**Free Trial**:
- 7 days free access to Premium features
- No credit card required
- Automatic downgrade to Basic after trial

---

### 2.10 Upgrade/Downgrade Policy

**Upgrade** (mid-month):
- Immediate access to new features
- Pro-rata charge (difference x remaining days/30)
- Automatic deducted from next invoice

**Downgrade** (mid-month):
- Pro-rata credit (difference x remaining days/30)
- Applied to next invoice as discount
- Features disabled on downgrade date

**Cancellation**:
- Can cancel anytime
- Access ends at end of current billing period
- Data remains until 30 days after expiry
- Can reactivate within 30 days (restore data)

---

## PART 3: ENTITLEMENT ENFORCEMENT

### 3.1 Frontend Feature Gate

```typescript
// React component example
import { useInvitationFeatureGate } from '@/hooks';

export function PageBuilderPage() {
  const { isLevelAtLeast } = useInvitationFeatureGate(invitationId);
  
  if (!isLevelAtLeast('page_builder', 'basic')) {
    return <UpgradePrompt feature="page_builder" />;
  }
  
  if (isLevelAtLeast('page_builder', 'intermediate')) {
    return <BuilderWithReorder />;
  }
  
  if (isLevelAtLeast('page_builder', 'full')) {
    return <FullBuilder />;
  }
  
  return <BasicBuilder />;
}
```

### 3.2 Backend Entitlement Check

```php
// Controller example
public function store(StoreRequest $request, Invitation $invitation) {
    $gate = new InvitationFeatureGate($invitation);
    
    // Boolean feature
    if (!$gate->can('amplop_digital')) {
        throw new FeatureNotAvailableException();
    }
    
    // Level-based feature
    if (!$gate->isLevelAtLeast('page_builder', 'intermediate')) {
        throw new FeatureLevelNotAvailableException();
    }
    
    // Proceed with action
}
```

### 3.3 Middleware Check

```php
// Route middleware
Route::post('/api/invitations/{id}/analytics/export', AnalyticsController@export)
    ->middleware([
        'auth',
        'can:analytics.view',
        'feature_level:analytics,full' // Level check
    ]);
```

---

## PART 4: FUTURE FEATURE EXPANSION

### Potential Features (Not in MVP)

| Feature | Target Quarter | Package |
|---------|-----------------|---------|
| Referral System | Q4 2026 | All |
| Multi-admin collaboration | Q1 2027 | Exclusive |
| Mobile app | Q1 2027 | All |
| Email campaign builder | Q2 2027 | Premium+ |
| Advanced theme marketplace | Q2 2027 | All |
| API webhooks for integrations | Q2 2027 | Exclusive |
| White-label / Reseller | Q3 2027 | Custom |

---

## CONCLUSION

**Permission Matrix Status**: ✅ Complete (47 permissions across 4 roles)

**Feature Matrix Status**: ✅ Complete (30+ features across 3 tiers)

**Enforcement Strategy**: Backend + Frontend validation

**Scalability**: Ready to add new features without breaking existing architecture

---

*Final Permission & Feature Matrix v1.0 — 10 Juni 2026*
*Ready for Phase 0 implementation*
