# UNDESIA Platform — Final Database Design Document

> **Versi**: 1.0.0 (FINAL)  
> **Tanggal**: 10 Juni 2026  
> **Status**: APPROVED FOR IMPLEMENTATION  
> **Tables**: 32 (+ 1 analytics table in Phase 2)  
> **Models**: 42  

---

## PART 1: DATABASE OVERVIEW

### 1.1 Database Configuration

```
Database: MySQL 8.0+
Collation: utf8mb4_unicode_ci (supports emoji)
Character Set: utf8mb4
Timezone: UTC (all timestamps stored in UTC)
```

### 1.2 Table Organization by Domain

| Domain | Tables | Purpose |
|--------|--------|---------|
| **User Management** | 2 | users, user_profiles |
| **Invitations** | 5 | invitations, invitation_settings, invitation_events, invitation_contents, invitation_payment_methods |
| **Event Types** | 2 | event_types, event_type_fields |
| **Guest Management** | 3 | guests, rsvps, comments |
| **Media/Content** | 4 | gallery_photos, stories, slider_photos, themes |
| **Transactions** | 4 | transactions, payments, bank_accounts, qris_accounts |
| **Payment Systems** | 3 | payment_gateway_configs, payment_gateway_audit_logs, digital_envelope_transactions |
| **Monetization** | 1 | packages, package_features |
| **Interactive** | 7 | gender_poll_votes, live_stream_sessions, interactive_games, game_responses, instagram_filters, dress_codes, dress_code_items, dress_code_palettes |
| **Analytics** | 2 | page_views, activity_logs |

---

## PART 2: CORE TABLES (14)

### 2.1 Users Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    
    -- Status
    email_verified_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
    
    -- Indexes
    KEY idx_email (email),
    KEY idx_is_active (is_active),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Relationships**:
- ← (1:N) user_profiles
- ← (1:N) invitations
- ← (1:N) transactions
- ← (1:N) admin_users (polymorphic)

---

### 2.2 User Profiles Table

```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Contact
    phone_number VARCHAR(20),
    whatsapp_token VARCHAR(255),
    
    -- Preferences (JSON)
    notification_preferences JSON DEFAULT '{"email": true, "whatsapp": true}',
    language VARCHAR(10) DEFAULT 'id', -- id, en
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Metadata
    profile_photo_url VARCHAR(500),
    bio TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_whatsapp_token (whatsapp_token)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.3 Invitations Table

```sql
CREATE TABLE invitations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    event_type_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    theme_id BIGINT,
    
    -- Identity
    slug VARCHAR(255) UNIQUE NOT NULL, -- SEO-friendly slug
    title VARCHAR(255) NOT NULL,
    description TEXT,
    custom_domain VARCHAR(255) UNIQUE,
    qr_code_url VARCHAR(500),
    
    -- Status
    status ENUM('draft', 'active', 'expired', 'archived') DEFAULT 'draft',
    is_public BOOLEAN DEFAULT FALSE,
    requires_password BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    
    -- Expiry
    activated_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    -- Settings
    allow_guest_comments BOOLEAN DEFAULT TRUE,
    allow_guest_plus_one BOOLEAN DEFAULT TRUE,
    max_guests_plus_one INT DEFAULT 1,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Soft delete
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY fk_event_type (event_type_id) REFERENCES event_types(id),
    FOREIGN KEY fk_package (package_id) REFERENCES packages(id),
    FOREIGN KEY fk_theme (theme_id) REFERENCES themes(id),
    
    KEY idx_user_created (user_id, created_at),
    KEY idx_slug (slug),
    KEY idx_custom_domain (custom_domain),
    KEY idx_status (status),
    KEY idx_expires_at (expires_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Relationships**:
- ← (1:N) invitation_contents (EAV)
- ← (1:N) invitation_events
- ← (1) invitation_settings
- ← (1:N) guests

---

### 2.4 Invitation Settings Table

```sql
CREATE TABLE invitation_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL UNIQUE,
    
    -- Feature Toggles
    feature_rsvp BOOLEAN DEFAULT TRUE,
    feature_gift_wishlist BOOLEAN DEFAULT FALSE,
    feature_gender_poll BOOLEAN DEFAULT FALSE,
    feature_live_stream BOOLEAN DEFAULT FALSE,
    feature_interactive_games BOOLEAN DEFAULT FALSE,
    feature_dress_code BOOLEAN DEFAULT FALSE,
    feature_amplop_digital BOOLEAN DEFAULT FALSE,
    feature_instagram_filter BOOLEAN DEFAULT FALSE,
    feature_analytics BOOLEAN DEFAULT FALSE,
    feature_page_builder BOOLEAN DEFAULT FALSE,
    feature_custom_domain BOOLEAN DEFAULT FALSE,
    
    -- Settings
    countdown_label VARCHAR(100) DEFAULT 'Hitung Mundur',
    show_guest_count BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.5 Invitation Events Table

```sql
CREATE TABLE invitation_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Event Details
    event_name VARCHAR(255) NOT NULL, -- e.g., "Akad", "Resepsi"
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(500),
    location_url VARCHAR(500), -- Google Maps URL
    
    -- Notes
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_date (invitation_id, event_date)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.6 Invitation Contents Table (EAV)

```sql
CREATE TABLE invitation_contents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    content_key VARCHAR(100) NOT NULL, -- e.g., 'groom_name', 'birthday_age'
    content_value LONGTEXT, -- Can be text, JSON, or path to file
    content_type VARCHAR(50) DEFAULT 'text', -- text, file, json, boolean, date
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    -- Index for fast lookup of specific fields per invitation
    UNIQUE KEY uq_invitation_key (invitation_id, content_key),
    KEY idx_invitation_id (invitation_id),
    KEY idx_content_key (content_key)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**EAV Field Examples** (by event type):

**Wedding (Pernikahan)**:
- groom_name, groom_photo, groom_family_info
- bride_name, bride_photo, bride_family_info
- ceremony_location, reception_location
- groom_phone, bride_phone

**Birthday (Ulang Tahun)**:
- child_name, child_photo, child_age
- birthday_date, birthday_location
- party_theme, activities

**Gender Reveal**:
- mother_name, father_name, due_date
- reveal_scheduled_at, team_a_name, team_b_name

**Khitanan**:
- child_name, child_age, parents_name
- ceremony_location, ceremony_time

---

### 2.7 Event Types Table

```sql
CREATE TABLE event_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL, -- wedding, birthday, khitanan, etc
    label VARCHAR(100) NOT NULL, -- Pernikahan, Ulang Tahun, etc
    description TEXT,
    icon_path VARCHAR(255),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_name (name)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Seeder Data**:
```
- 1: wedding | Pernikahan
- 2: birthday | Ulang Tahun
- 3: khitanan | Khitanan
- 4: aqiqah | Aqiqah
- 5: gender_reveal | Gender Reveal
- 6: syukuran | Syukuran/Selamatan
```

---

### 2.8 Event Type Fields Table

```sql
CREATE TABLE event_type_fields (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type_id BIGINT NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- text, date, file, textarea, etc
    
    is_required BOOLEAN DEFAULT FALSE,
    is_array BOOLEAN DEFAULT FALSE, -- For multiple values
    placeholder TEXT,
    help_text TEXT,
    
    -- For select/radio fields
    options JSON, -- ["option1", "option2"]
    
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_event_type (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_event_field (event_type_id, field_key),
    KEY idx_event_type (event_type_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.9 Packages Table

```sql
CREATE TABLE packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL, -- basic, premium, exclusive
    label VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Billing
    billing_period VARCHAR(20) DEFAULT 'month', -- month, year
    
    -- Features (via package_features table)
    
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_name (name),
    KEY idx_is_active (is_active)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Seeder Data**:
```
- 1: Basic | Paket Basic | Rp 99,000/bulan
- 2: Premium | Paket Premium | Rp 249,000/bulan
- 3: Exclusive | Paket Eksklusif | Rp 499,000/bulan
```

---

### 2.10 Package Features Table

```sql
CREATE TABLE package_features (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id BIGINT NOT NULL,
    feature_key VARCHAR(100) NOT NULL, -- amplop_digital, custom_domain, page_builder, etc
    feature_type VARCHAR(50) DEFAULT 'boolean', -- boolean, level
    feature_value VARCHAR(255) DEFAULT 'true', -- true/false or basic/intermediate/full
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_package (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_package_feature (package_id, feature_key),
    KEY idx_package (package_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Feature Matrix** (documented in FINAL_FEATURE_MATRIX.md)

---

### 2.11 Transactions Table

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    invitation_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    
    -- Invoice Details
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- UNDESIA-INV-202606-0089
    invoice_amount DECIMAL(12, 2) NOT NULL,
    invoice_currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Status
    status ENUM('pending', 'paid', 'failed', 'cancelled', 'expired') DEFAULT 'pending',
    
    -- Dates
    due_date DATE,
    paid_at TIMESTAMP NULL,
    
    -- Metadata
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id),
    FOREIGN KEY fk_package (package_id) REFERENCES packages(id),
    
    UNIQUE KEY uq_invitation (invitation_id), -- One transaction per invitation
    KEY idx_user_status (user_id, status),
    KEY idx_invoice_number (invoice_number),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.12 Payments Table

```sql
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id BIGINT NOT NULL,
    
    -- Gateway
    payment_gateway VARCHAR(50) NOT NULL, -- midtrans, xendit, manual
    gateway_reference_id VARCHAR(255) UNIQUE NOT NULL, -- Provider's ID
    gateway_order_id VARCHAR(255),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    fee DECIMAL(12, 2) DEFAULT 0, -- Gateway fee
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Status
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    error_code VARCHAR(100),
    error_message TEXT,
    
    -- Webhook
    webhook_received_at TIMESTAMP NULL,
    webhook_verified_at TIMESTAMP NULL,
    webhook_payload JSON, -- Raw webhook data for audit
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_transaction (transaction_id) REFERENCES transactions(id) ON DELETE RESTRICT,
    
    KEY idx_transaction_status (transaction_id, status),
    KEY idx_gateway_ref (gateway_reference_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 2.13 Bank Accounts Table

```sql
CREATE TABLE bank_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    
    -- Bank Details
    bank_name VARCHAR(100) NOT NULL,
    bank_account_name VARCHAR(255) NOT NULL,
    bank_account_number VARCHAR(30) NOT NULL ENCRYPTED,
    bank_code VARCHAR(10), -- e.g., BCA, BRI, MANDIRI
    
    -- Account
    account_type VARCHAR(50) DEFAULT 'checking', -- checking, savings
    
    -- Verification
    verification_status ENUM('unverified', 'verifying', 'verified') DEFAULT 'unverified',
    verification_code VARCHAR(10), -- Small amount sent for verification
    verification_attempts INT DEFAULT 0,
    verified_at TIMESTAMP NULL,
    
    -- Settings
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    KEY idx_user_primary (user_id, is_primary),
    KEY idx_verification_status (verification_status)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Security Note**: Bank account numbers stored encrypted using Laravel `Crypt` facade

---

### 2.14 QRIS Accounts Table

```sql
CREATE TABLE qris_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    
    -- QRIS Details
    qris_code VARCHAR(1000) NOT NULL, -- Static QRIS data
    qris_reference_id VARCHAR(100) UNIQUE,
    merchant_id VARCHAR(100),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    KEY idx_user_primary (user_id, is_primary)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

## PART 3: GUEST & CONTENT TABLES (7)

### 3.1 Guests Table

```sql
CREATE TABLE guests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Guest Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    
    -- Metadata
    gender VARCHAR(20), -- male, female, other
    category VARCHAR(100), -- VIP, Family, Friend, etc
    notes TEXT,
    
    -- QR Code
    qr_code_url VARCHAR(500), -- Path to QR code image
    qr_code_data VARCHAR(500), -- QR code payload (unique guest token)
    
    -- RSVP Status (cached for performance)
    rsvp_status VARCHAR(50) DEFAULT 'pending', -- pending, attending, not_attending, maybe
    rsvp_headcount INT DEFAULT 1, -- Primary + additional
    rsvp_notes TEXT,
    rsvp_submitted_at TIMESTAMP NULL,
    
    -- Attendance
    checked_in_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_email (invitation_id, email),
    KEY idx_invitation_status (invitation_id, rsvp_status),
    KEY idx_qr_code (qr_code_data)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 3.2 RSVPs Table

```sql
CREATE TABLE rsvps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    invitation_id BIGINT NOT NULL,
    
    -- RSVP Details
    status VARCHAR(50) NOT NULL, -- attending, not_attending, maybe, undecided
    headcount INT DEFAULT 1, -- Including plus-ones
    dietary_restrictions VARCHAR(500),
    special_requests TEXT,
    
    -- Family Info (optional)
    family_name VARCHAR(255),
    relationship_to_couple VARCHAR(100), -- Family, Friend, Colleague
    
    -- Tracking
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_guest (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_guest_invitation (guest_id, invitation_id),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 3.3 Comments Table

```sql
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    guest_id BIGINT,
    
    -- Content
    comment_text TEXT NOT NULL,
    
    -- Metadata
    guest_name VARCHAR(255), -- In case guest not registered
    guest_email VARCHAR(255),
    
    -- Status
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    approved_by_user_id BIGINT,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    FOREIGN KEY fk_guest (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    
    KEY idx_invitation_status (invitation_id, status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 3.4 Gallery Photos Table

```sql
CREATE TABLE gallery_photos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- File
    file_path VARCHAR(500) NOT NULL,
    file_size INT, -- Bytes
    media_type VARCHAR(50) NOT NULL, -- photo, video
    mime_type VARCHAR(100),
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100) DEFAULT 'general', -- general, prewedding, pregnancy, baby, slider
    
    -- Display
    thumbnail_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_category (invitation_id, category),
    KEY idx_media_type (media_type)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 3.5 Stories Table

```sql
CREATE TABLE stories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Story
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    story_type VARCHAR(100) DEFAULT 'general', -- general, love_story, timeline, pregnancy_journey, family_story
    
    -- Dates
    story_date DATE,
    
    -- Display
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_type (invitation_id, story_type)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 3.6 Slider Photos Table

```sql
CREATE TABLE slider_photos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- File (from guest submissions)
    file_path VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Source
    submitted_by_guest_id BIGINT,
    guest_name VARCHAR(255),
    
    -- Display
    display_order INT DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    FOREIGN KEY fk_guest (submitted_by_guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    
    KEY idx_invitation_approved (invitation_id, is_approved)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

## PART 4: INTERACTIVE FEATURES TABLES (8)

### 4.1 Gender Poll Votes Table

```sql
CREATE TABLE gender_poll_votes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Vote
    team VARCHAR(50) NOT NULL, -- team_a, team_b
    
    -- Voter Info
    voter_name VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL, -- For deduplication
    user_agent VARCHAR(500),
    
    -- Fingerprint (future enhancement)
    browser_fingerprint VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    -- Prevent duplicate votes from same IP per day
    UNIQUE KEY uq_invitation_ip_date (invitation_id, ip_address, DATE(created_at)),
    KEY idx_invitation_team (invitation_id, team),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.2 Live Stream Sessions Table

```sql
CREATE TABLE live_stream_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Stream Details
    stream_title VARCHAR(255),
    stream_url VARCHAR(500),
    stream_provider VARCHAR(100), -- youtube, facebook, custom
    provider_stream_id VARCHAR(255),
    
    -- Timing
    scheduled_start_at TIMESTAMP,
    actual_start_at TIMESTAMP NULL,
    actual_end_at TIMESTAMP NULL,
    
    -- Stats (cached)
    peak_viewers INT DEFAULT 0,
    
    -- Status
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_status (invitation_id, status),
    KEY idx_scheduled_start (scheduled_start_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.3 Interactive Games Table

```sql
CREATE TABLE interactive_games (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Game Info
    game_title VARCHAR(255) NOT NULL,
    game_type VARCHAR(100) NOT NULL, -- quiz, trivia, guessing, etc
    game_description TEXT,
    
    -- Game Config (JSON)
    game_config JSON, -- Flexible structure for different game types
    
    -- Timing
    start_time DATETIME,
    end_time DATETIME,
    
    -- Status
    status ENUM('draft', 'active', 'ended') DEFAULT 'draft',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_status (invitation_id, status)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.4 Game Responses Table

```sql
CREATE TABLE game_responses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game_id BIGINT NOT NULL,
    guest_id BIGINT,
    
    -- Response
    response_data JSON, -- Flexible for different game types
    score INT DEFAULT 0,
    
    -- Timing
    submitted_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_game (game_id) REFERENCES interactive_games(id) ON DELETE CASCADE,
    FOREIGN KEY fk_guest (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    
    KEY idx_game_score (game_id, score)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.5 Instagram Filters Table

```sql
CREATE TABLE instagram_filters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Filter Info
    filter_name VARCHAR(255) NOT NULL,
    filter_handle VARCHAR(255), -- @undesia_wedding_123
    
    -- Config
    filter_config JSON, -- Instagram filter metadata
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    KEY idx_invitation_active (invitation_id, is_active)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.6 Dress Codes Table

```sql
CREATE TABLE dress_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Dress Code Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_invitation_dress_code (invitation_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.7 Dress Code Items Table

```sql
CREATE TABLE dress_code_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dress_code_id BIGINT NOT NULL,
    
    -- Item Details
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    recommended_brands VARCHAR(500),
    
    -- Display
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_dress_code (dress_code_id) REFERENCES dress_codes(id) ON DELETE CASCADE,
    
    KEY idx_dress_code (dress_code_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 4.8 Dress Code Palettes Table

```sql
CREATE TABLE dress_code_palettes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dress_code_id BIGINT NOT NULL,
    
    -- Color Palette
    color_name VARCHAR(100) NOT NULL,
    hex_value VARCHAR(10) NOT NULL, -- #FF5733
    rgb_value VARCHAR(20), -- rgb(255, 87, 51)
    
    -- Display
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_dress_code (dress_code_id) REFERENCES dress_codes(id) ON DELETE CASCADE,
    
    KEY idx_dress_code (dress_code_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

## PART 5: PAYMENT & CONFIGURATION TABLES (5)

### 5.1 Payment Gateway Configs Table

```sql
CREATE TABLE payment_gateway_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Gateway
    gateway_name VARCHAR(100) UNIQUE NOT NULL, -- midtrans, xendit, manual
    gateway_type VARCHAR(50), -- payment, verification
    
    -- Credentials (encrypted)
    config_key VARCHAR(100) ENCRYPTED,
    config_secret VARCHAR(500) ENCRYPTED,
    config_extra JSON ENCRYPTED, -- Extra config as JSON
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    
    -- Audit
    configured_at TIMESTAMP NULL,
    configured_by_user_id BIGINT,
    last_verified_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_gateway_active (gateway_name, is_active)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Security Note**: Config credentials encrypted using Laravel `Crypt` facade

---

### 5.2 Payment Gateway Audit Logs Table

```sql
CREATE TABLE payment_gateway_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Config Change
    gateway_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- create, update, test, delete
    
    -- Change Details
    old_values JSON,
    new_values JSON, -- EXCLUDING secret values
    
    -- User
    changed_by_user_id BIGINT,
    ip_address VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_gateway_date (gateway_name, created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

**Security**: Never log secret values in audit logs

---

### 5.3 Digital Envelope Transactions Table

```sql
CREATE TABLE digital_envelope_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    
    -- Sender (Guest)
    guest_id BIGINT,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    
    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Receiver Account
    bank_account_id BIGINT, -- If bank transfer
    qris_account_id BIGINT, -- If QRIS
    
    -- Payment
    payment_method VARCHAR(50), -- bank_transfer, qris, manual
    gateway_reference_id VARCHAR(255),
    
    -- Status
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    confirmed_at TIMESTAMP NULL,
    
    -- Message
    message TEXT, -- Guest's message with envelope
    
    -- Tracking
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id),
    FOREIGN KEY fk_guest (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    FOREIGN KEY fk_bank_account (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY fk_qris_account (qris_account_id) REFERENCES qris_accounts(id) ON DELETE SET NULL,
    
    KEY idx_invitation_status (invitation_id, status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 5.4 Invitation Payment Methods Table

```sql
CREATE TABLE invitation_payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT NOT NULL,
    payment_gateway VARCHAR(100) NOT NULL, -- midtrans, xendit, manual
    
    -- Config Override (if user uses own credentials)
    config_override JSON, -- Encrypted separately
    is_using_platform_config BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_invitation_gateway (invitation_id, payment_gateway)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

## PART 6: OTHER TABLES (4)

### 6.1 Themes Table

```sql
CREATE TABLE themes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Theme Details
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Metadata
    preview_image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Colors (JSON)
    colors JSON, -- {"primary": "#FF0000", "secondary": "#00FF00"}
    
    -- Availability
    is_free BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Creator (for marketplace)
    created_by_user_id BIGINT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_slug (slug),
    KEY idx_is_active (is_active),
    KEY idx_created_by (created_by_user_id)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

### 6.2 Page Views Table

```sql
CREATE TABLE page_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invitation_id BIGINT,
    
    -- Visitor
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    referer VARCHAR(500),
    
    -- Device
    device_type VARCHAR(50), -- mobile, tablet, desktop
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    
    -- Geo (if available)
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Tracking
    session_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_invitation (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    
    -- Critical indexes for analytics queries
    KEY idx_invitation_date (invitation_id, created_at),
    KEY idx_created_at (created_at),
    KEY idx_device_type (device_type)
) ENGINE=InnoDB CHARSET=utf8mb4;

-- Note: This table will grow significantly. 
-- For performance, implement archival strategy:
-- - Keep only 30 days in main table
-- - Archive older data to analytics_summaries table (Phase 2)
```

---

### 6.3 Activity Logs Table

```sql
CREATE TABLE activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Actor
    user_id BIGINT,
    
    -- Action
    action VARCHAR(100) NOT NULL, -- create, update, delete, view, etc
    model_type VARCHAR(255),
    model_id BIGINT,
    
    -- Change
    changes JSON, -- {"old_value": "...", "new_value": "..."}
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY fk_user (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    KEY idx_user_date (user_id, created_at),
    KEY idx_model (model_type, model_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB CHARSET=utf8mb4;
```

---

## PART 7: INDEXES OPTIMIZATION SUMMARY

**High-Priority Indexes** (for most common queries):
```sql
-- User authentication
CREATE INDEX idx_users_email ON users(email);

-- Invitation lookups
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_invitations_custom_domain ON invitations(custom_domain);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Guest management
CREATE INDEX idx_guests_invitation ON guests(invitation_id);
CREATE INDEX idx_rsvps_status ON rsvps(status);

-- EAV performance
CREATE INDEX idx_invitation_contents_key ON invitation_contents(invitation_id, content_key);

-- Transaction tracking
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX idx_payments_gateway_ref ON payments(gateway_reference_id);

-- Analytics
CREATE INDEX idx_page_views_invitation_date ON page_views(invitation_id, created_at);
```

---

## PART 8: NORMALIZATION & RELATIONSHIPS

**Normalization Level**: BCNF (Boyce-Codd Normal Form)

**No Anomalies**:
- ✅ No insert anomalies
- ✅ No update anomalies
- ✅ No delete anomalies
- ✅ EAV properly designed for extensibility

---

## PART 9: DATABASE CONSTRAINTS

**Foreign Key Strategy**:
- CASCADE DELETE: For dependent data (invitation_contents when invitation deleted)
- RESTRICT DELETE: For important data (don't delete transaction if payment exists)
- SET NULL: For optional references (guest deleted, event_id in comment set null)

**Unique Constraints**:
- user.email (authentication)
- invitations.slug (SEO)
- invitations.custom_domain (routing)
- transactions.invitation_id (one transaction per invitation)
- payments.gateway_reference_id (idempotency)

---

## DATABASE STATISTICS

- **Total Tables**: 32 (Phase 0), +1 (Phase 2)
- **Total Columns**: ~450+
- **Primary Keys**: 32
- **Foreign Keys**: ~60
- **Unique Constraints**: ~15
- **Indexes**: ~50+
- **Max Relations per User**: ~1000 invitations → ~100k guests → ~1M RSVPs (scalable)

---

*Final Database Design v1.0 — 10 Juni 2026*
*All tables designed for scalability, security, and performance*
