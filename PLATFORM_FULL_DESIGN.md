# UNDESIA — Rancangan Lengkap Platform Multi-Event Invitation
## Dokumen Teknis Komprehensif: Database, Arsitektur, Modul, UI/UX

> **Versi**: 2.0.0  
> **Tanggal**: 10 Juni 2026  
> **Berdasarkan**: SYSTEM_REDESIGN.md v1.0.0  
> **Tujuan**: Rancangan teknis lengkap yang mengintegrasikan semua jenis undangan dengan fitur core dan fitur khusus per event type.

---

## BAGIAN 1 — PETA FITUR LENGKAP PER EVENT TYPE

### 1.1 Matriks Fitur Core vs Specialized

**FITUR CORE (semua event type wajib mendukung):**

| Fitur | Status |
|-------|--------|
| Manajemen Tamu | ✅ Wajib |
| Import CSV/Excel | ✅ Wajib |
| Kirim Undangan WhatsApp | ✅ Wajib |
| RSVP / Konfirmasi Kehadiran | ✅ Wajib |
| Buku Tamu Digital | ✅ Wajib |
| Countdown Acara | ✅ Wajib |
| Galeri Foto | ✅ Wajib |
| Background Music | ✅ Wajib |
| Peta Lokasi | ✅ Wajib |
| Share Link | ✅ Wajib |
| QR Code Undangan | ✅ Wajib |
| Statistik Pengunjung | ✅ Wajib |
| Tema & Template | ✅ Wajib |
| Manajemen Media | ✅ Wajib |
| SEO Friendly URL | ✅ Wajib |
| Custom Domain | ✅ Paket tertentu |
| Notifikasi Kehadiran | ✅ Wajib |
| Dashboard Analitik | ✅ Wajib |
| Multiple Jadwal Acara | ✅ Wajib |
| Dress Code | ✅ Opsional |
| Password Proteksi | ✅ Wajib |
| Amplop Digital | ✅ Opsional |

**FITUR SPECIALIZED PER EVENT TYPE:**

| Fitur | Wedding | B-Day | Khitan | Aqiqah | Gender | Syukuran |
|-------|:-------:|:-----:|:------:|:------:|:------:|:--------:|
| Profil Mempelai (2 orang) | ✅ | — | — | — | — | — |
| Love Story / Timeline | ✅ | — | — | — | — | — |
| Galeri Prewedding | ✅ | — | — | — | — | — |
| Live Streaming | ✅ | opt | — | — | opt | — |
| Amplop Digital / QRIS | ✅ | opt | ✅ | ✅ | — | ✅ |
| Wedding Gift Tracker | ✅ | — | — | — | — | — |
| Filter Instagram | ✅ | — | — | — | — | — |
| Profil Anak (1 orang) | — | ✅ | ✅ | ✅ | — | — |
| Tema Karakter | — | ✅ | — | — | — | — |
| Games / Quiz Interaktif | — | ✅ | — | — | — | — |
| Hadiah Wishlist | — | ✅ | — | — | — | — |
| Dress Code | ✅ | ✅ | opt | — | opt | — |
| Profil Bayi | — | — | — | ✅ | — | — |
| Data Kelahiran Bayi | — | — | — | ✅ | — | — |
| Cerita Kehamilan | — | — | — | — | ✅ | — |
| Gender Prediction Poll | — | — | — | — | ✅ | — |
| Voting Tim Pink vs Biru | — | — | — | — | ✅ | — |
| Reveal Animation | — | — | — | — | ✅ | — |
| Tujuan Acara | — | — | — | — | — | ✅ |
| Informasi Orang Tua | — | — | ✅ | ✅ | ✅ | — |

---

## BAGIAN 2 — ARSITEKTUR DATABASE LENGKAP

### 2.1 ERD Lengkap

```
                        ┌──────────────┐
                        │    users     │
                        │──────────────│
                        │ id           │
                        │ name         │
                        │ email        │
                        │ password     │◄─── bcrypt cost≥12
                        │ deleted_at   │
                        └──────┬───────┘
                               │ 1:1
                        ┌──────▼────────────┐
                        │  user_profiles    │
                        │ wa_token          │
                        │ wa_number         │
                        │ preferences (JSON)│
                        └───────────────────┘
                               │
                               │ 1:N
                ┌──────────────▼────────────────────────┐
                │              invitations               │
                │───────────────────────────────────────│
                │ id · user_id · event_type_id           │
                │ package_id · theme_id                  │
                │ title · slug · custom_domain           │
                │ status · event_date · expired_at       │
                └──┬─────────────────────────────────────┘
                   │
       ┌───────────┼──────────────────────────────────────┐
       │           │                                      │
  event_types   packages                              themes
  (1:N fields)  (1:N features)                   (1:N assets)
       │
   ┌───┴────────────────────────────────────────────────────────────┐
   │                    RELASI PER UNDANGAN                          │
   ├────────────────────────────────────────────────────────────────┤
   │  invitation_contents    (EAV — konten dinamis per event type)  │
   │  invitation_events      (jadwal acara: akad, resepsi, dll.)    │
   │  invitation_settings    (toggle fitur, musik, password)        │
   │  guests                 (daftar tamu + QR code)                │
   │    └── rsvps            (konfirmasi kehadiran per tamu)        │
   │  comments               (buku tamu publik)                     │
   │  gallery_photos         (galeri umum + prewedding + video)     │
   │  stories                (cerita / narasi)                      │
   │  bank_accounts          (amplop digital / rekening)            │
   │  qris_accounts          (QRIS digital — terpisah dari bank)    │
   │  dress_codes            (dress code)                           │
   │    ├── dress_code_items                                         │
   │    └── dress_code_palettes                                      │
   │  page_views             (statistik pengunjung)                 │
   │  slider_photos          (foto slider buku tamu)                │
   │  ── TABEL SPECIALIZED ──                                        │
   │  gift_wishlist_items    (hadiah wishlist birthday/wedding)     │
   │  gender_poll_votes      (voting tim pink/biru)                 │
   │  live_stream_sessions   (sesi live streaming)                  │
   │  instagram_filters      (filter Instagram per undangan)        │
   │  interactive_games      (games/quiz ulang tahun)               │
   │    └── game_responses   (jawaban/respon per game)              │
   └────────────────────────────────────────────────────────────────┘
       │
   ┌───▼──────────────────────────────────────────────────────────┐
   │  transactions (1:1 UNIQUE dengan invitations)                 │
   │    └── payments (1:N — riwayat percobaan bayar)              │
   └───────────────────────────────────────────────────────────────┘
```

---

### 2.2 EAV Content Keys — Pemetaan Lengkap Per Event Type

#### WEDDING

```
PROFIL MEMPELAI PRIA:
  groom_name          → text      Nama lengkap mempelai pria        [REQUIRED]
  groom_nickname      → text      Nama panggilan
  groom_photo         → path      Foto mempelai pria
  groom_father        → text      Nama ayah mempelai pria
  groom_mother        → text      Nama ibu mempelai pria
  groom_bio           → textarea  Bio/deskripsi singkat
  groom_instagram     → text      Username Instagram
  groom_order         → text      Anak ke-N dari N bersaudara

PROFIL MEMPELAI WANITA:
  bride_name          → text      Nama lengkap mempelai wanita      [REQUIRED]
  bride_nickname      → text      Nama panggilan
  bride_photo         → path      Foto mempelai wanita
  bride_father        → text      Nama ayah mempelai wanita
  bride_mother        → text      Nama ibu mempelai wanita
  bride_bio           → textarea  Bio/deskripsi singkat
  bride_instagram     → text      Username Instagram
  bride_order         → text      Anak ke-N dari N bersaudara

KONTEN TAMBAHAN:
  opening_verse       → textarea  Ayat/quote pembuka
  opening_verse_source→ text      Sumber ayat/quote
  instagram_hashtag   → text      Hashtag pernikahan
  instagram_filter_link→ text     Link filter Instagram
  instagram_filter_code→ text     Kode filter IG

CATATAN: Love story disimpan di tabel `stories` (story_type='love_story')
         Foto prewedding di `gallery_photos` (category='prewedding')
         Video di `gallery_photos` (media_type='video')
         Gift tracker di `gift_wishlist_items`
         Live streaming di `live_stream_sessions`
```

#### BIRTHDAY (Ulang Tahun Anak)

```
PROFIL ANAK:
  child_name          → text      Nama lengkap anak                 [REQUIRED]
  child_nickname      → text      Nama panggilan
  child_photo         → path      Foto anak
  child_age           → text      Usia yang diraikan                [REQUIRED]
  child_birthdate     → date      Tanggal lahir
  child_father        → text      Nama ayah
  child_mother        → text      Nama ibu

TEMA KARAKTER:
  character_theme     → text      Nama karakter (SpiderMan, Barbie)
  character_theme_image→ path     Gambar karakter
  character_color_primary→ text   Warna utama tema (#HEX)
  character_color_secondary→ text Warna sekunder tema (#HEX)

CATATAN: Wishlist disimpan di `gift_wishlist_items`
         Games disimpan di `interactive_games`
```

#### KHITANAN

```
PROFIL ANAK:
  child_name          → text      Nama anak                         [REQUIRED]
  child_photo         → path      Foto anak
  child_nickname      → text      Nama panggilan
  child_birthdate     → date      Tanggal lahir
  child_age           → text      Usia anak
  child_father        → text      Nama ayah                         [REQUIRED]
  child_mother        → text      Nama ibu                          [REQUIRED]
  father_photo        → path      Foto ayah (opsional)
  mother_photo        → path      Foto ibu (opsional)
  family_photo        → path      Foto keluarga
  ceremony_notes      → textarea  Catatan khusus upacara
```

#### AQIQAH / SYUKURAN KELAHIRAN

```
PROFIL BAYI:
  baby_name           → text      Nama bayi                         [REQUIRED]
  baby_name_arabic    → text      Nama Arab (opsional)
  baby_name_meaning   → text      Arti nama
  baby_photo          → path      Foto bayi
  baby_gender         → text      'male' | 'female'                 [REQUIRED]
  baby_birthdate      → date      Tanggal lahir                     [REQUIRED]
  baby_birth_time     → text      Jam lahir (HH:MM)
  baby_weight         → text      Berat lahir, misal "3,2 kg"
  baby_length         → text      Panjang lahir, misal "50 cm"
  baby_birth_place    → text      Tempat lahir
  father_name         → text      Nama ayah                         [REQUIRED]
  mother_name         → text      Nama ibu                          [REQUIRED]
  father_photo        → path      Foto ayah
  mother_photo        → path      Foto ibu
  family_photo        → path      Foto keluarga
  gratitude_message   → textarea  Pesan syukur dari orang tua
```

#### GENDER REVEAL

```
PROFIL ORANG TUA:
  father_name         → text      Nama ayah                         [REQUIRED]
  mother_name         → text      Nama ibu                          [REQUIRED]
  father_photo        → path      Foto ayah
  mother_photo        → path      Foto ibu
  couple_photo        → path      Foto berdua

KEHAMILAN:
  pregnancy_story     → textarea  Cerita perjalanan kehamilan
  due_date            → date      HPL / Perkiraan lahir
  pregnancy_week      → text      Usia kehamilan saat reveal

GENDER REVEAL CONFIG:
  reveal_type         → text      'color_balloon'|'cake_cut'|'confetti'|'video'
  reveal_scheduled_at → datetime  Waktu reveal resmi
  result_gender       → text      NULL sebelum reveal, 'male'|'female' sesudahnya
  reveal_video_url    → text      URL video reveal (setelah reveal)
  reveal_animation    → text      'pink_explosion'|'blue_explosion'|'confetti'
  poll_closes_at      → datetime  Kapan polling ditutup
  team_pink_label     → text      Label tim pink (default: "Tim Pink 💗")
  team_blue_label     → text      Label tim biru (default: "Tim Biru 💙")

CATATAN: Foto kehamilan di `gallery_photos` (category='pregnancy')
         Voting tersimpan di `gender_poll_votes`
```

#### TASYAKURAN / SELAMATAN

```
INFORMASI ACARA:
  event_purpose       → textarea  Tujuan acara                      [REQUIRED]
  event_type_detail   → text      'syukuran_rumah'|'selamatan'|'tasyakuran'|'custom'
  organizer_name      → text      Nama penyelenggara                [REQUIRED]
  organizer_photo     → path      Foto penyelenggara (opsional)
  opening_doa         → textarea  Doa/kata pembuka
  closing_message     → textarea  Pesan penutup
```

---

### 2.3 Skema Tabel Lengkap (dari SYSTEM_REDESIGN.md + Extended)

#### Tabel dari SYSTEM_REDESIGN.md (tidak berubah)

Tabel berikut sudah didefinisikan lengkap di SYSTEM_REDESIGN.md:
- `users`, `user_profiles`
- `event_types`, `event_type_fields`
- `invitations`
- `invitation_contents` (EAV)
- `invitation_events`
- `invitation_settings`
- `guests`, `rsvps`, `comments`
- `gallery_photos`, `stories`
- `bank_accounts`
- `dress_codes`, `dress_code_items`, `dress_code_palettes`
- `page_views`, `slider_photos`
- `themes`, `theme_categories`, `theme_event_types`, `theme_assets`
- `packages`, `package_features`
- `transactions`, `payments`
- `testimonials`
- `admin_users`
- `settings`, `setting_payments`
- `activity_logs`

#### `gallery_photos` — Extended (tambahkan kolom)

```sql
-- Tambahkan ke migration gallery_photos:
$table->string('category', 50)->default('general');
-- nilai: 'general' | 'prewedding' | 'pregnancy' | 'baby' | 'slider'

$table->enum('media_type', ['photo', 'video'])->default('photo');
$table->string('video_url', 500)->nullable();
-- untuk embed YouTube/Drive (media_type = 'video')
```

#### `stories` — Extended (tambahkan kolom)

```sql
-- Tambahkan ke migration stories:
$table->string('story_type', 50)->default('general');
-- nilai: 'general' | 'love_story' | 'timeline' | 'pregnancy_journey' | 'family_story'
```

#### `invitation_settings` — Extended (tambahkan kolom)

```sql
-- Tambahkan ke migration invitation_settings:

-- Fitur Wedding
$table->boolean('feature_live_stream')->default(false);
$table->boolean('feature_instagram_filter')->default(false);
$table->boolean('feature_love_story')->default(false);
$table->boolean('feature_wedding_registry')->default(false);

-- Fitur Birthday
$table->boolean('feature_character_theme')->default(false);
$table->boolean('feature_games')->default(false);
$table->boolean('feature_wishlist')->default(false);

-- Fitur Gender Reveal
$table->boolean('feature_gender_poll')->default(true);
$table->boolean('feature_reveal_animation')->default(true);
$table->boolean('gender_poll_open')->default(true);

-- Fitur General Extended
$table->boolean('feature_qris')->default(false);
$table->unsignedInteger('feature_livestream_count')->default(0);
```

#### `qris_accounts` — QRIS Digital (baru)

```sql
CREATE TABLE qris_accounts (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    label           VARCHAR(100) NOT NULL,
    qris_image_path VARCHAR(500) NOT NULL,
    account_name    VARCHAR(255) NOT NULL,
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
```

#### `gift_wishlist_items` — Hadiah Wishlist (baru)

```sql
CREATE TABLE gift_wishlist_items (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    image_path      VARCHAR(500) NULL,
    estimated_price DECIMAL(12,2) NULL,
    purchase_url    VARCHAR(500) NULL,
    category        VARCHAR(100) NULL,
    status          ENUM('wanted','reserved','received') DEFAULT 'wanted',
    reserved_by     VARCHAR(255) NULL,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
```

#### `gender_poll_votes` — Voting Gender Reveal (baru)

```sql
CREATE TABLE gender_poll_votes (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    voter_name      VARCHAR(255) NOT NULL,
    voter_phone     VARCHAR(20) NULL,
    vote            ENUM('pink','blue') NOT NULL,
    message         TEXT NULL,
    ip_address      VARCHAR(45) NULL,
    voted_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
    INDEX idx_gender_poll_ip (invitation_id, ip_address)
);
```

#### `live_stream_sessions` — Sesi Live Streaming (baru)

```sql
CREATE TABLE live_stream_sessions (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(255) NOT NULL,
    platform        ENUM('youtube','instagram','zoom','custom') NOT NULL,
    stream_url      VARCHAR(500) NOT NULL,
    stream_key      VARCHAR(255) NULL,
    scheduled_at    DATETIME NOT NULL,
    ends_at         DATETIME NULL,
    status          ENUM('scheduled','live','ended') DEFAULT 'scheduled',
    viewer_count    INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
```

#### `interactive_games` — Games & Quiz (baru)

```sql
CREATE TABLE interactive_games (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL,
    type            ENUM('quiz','trivia','guess_age','message_wall','word_cloud') NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    config          JSON NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    starts_at       DATETIME NULL,
    ends_at         DATETIME NULL,
    created_at      TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE TABLE game_responses (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    game_id         BIGINT UNSIGNED NOT NULL,
    player_name     VARCHAR(255) NOT NULL,
    response        JSON NOT NULL,
    score           INT NULL,
    ip_address      VARCHAR(45) NULL,
    responded_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES interactive_games(id) ON DELETE CASCADE
);
```

#### `instagram_filters` — Filter Instagram (baru)

```sql
CREATE TABLE instagram_filters (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invitation_id   BIGINT UNSIGNED NOT NULL UNIQUE,
    filter_name     VARCHAR(255) NULL,
    filter_creator  VARCHAR(255) NULL,
    filter_link     VARCHAR(500) NULL,
    qr_code_path    VARCHAR(500) NULL,
    preview_image   VARCHAR(500) NULL,
    hashtag         VARCHAR(100) NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);
```

---

### 2.4 Normalisasi & Design Notes Extended

1. **`gallery_photos.category`** memungkinkan satu tabel menampung galeri umum, prewedding, foto kehamilan, dll. tanpa membutuhkan tabel terpisah per kategori.

2. **`gallery_photos.media_type`** membuat galeri video tidak membutuhkan tabel terpisah — cukup `media_type='video'` dengan `video_url` berisi embed link.

3. **`gender_poll_votes`** menggunakan kombinasi `invitation_id + ip_address` sebagai indeks untuk mencegah double-vote. Di masa depan dapat ditingkatkan ke fingerprinting browser.

4. **`live_stream_sessions`** bersifat 1:N ke invitation agar satu undangan dapat memiliki multiple sesi (akad nikah live, resepsi live). Dibatasi oleh `package_features` (`live_streaming` count).

5. **`gift_wishlist_items.status`** memungkinkan tamu menandai item yang sudah mereka siapkan (`reserved`) dan owner menandai yang sudah diterima (`received`).

6. **`interactive_games.config`** adalah JSON bebas untuk menyimpan konfigurasi game (array pertanyaan, opsi jawaban, waktu per soal, dll.) tanpa butuh tabel tambahan.

---

## BAGIAN 3 — ARSITEKTUR MODUL EXTENDED

### 3.1 Struktur Folder Project Laravel

```
undesia/
├── app/
│   ├── Console/Commands/
│   │   ├── SendScheduledInvitations.php    ← cron WA harian
│   │   ├── MigrateLegacyData.php
│   │   ├── ExpireOldInvitations.php        ← cron harian: expire undangan
│   │   └── CloseExpiredPolls.php           ← cron: tutup gender poll
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── RegisterController.php
│   │   │   │   ├── PasswordResetController.php
│   │   │   │   └── OAuthController.php
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── InvitationController.php
│   │   │   │   ├── InvitationBuilderController.php
│   │   │   │   ├── GuestController.php
│   │   │   │   ├── RsvpController.php
│   │   │   │   ├── GalleryController.php
│   │   │   │   ├── StoryController.php
│   │   │   │   ├── GiftController.php
│   │   │   │   ├── WishlistController.php
│   │   │   │   ├── DressCodeController.php
│   │   │   │   ├── LiveStreamController.php
│   │   │   │   ├── GenderPollController.php
│   │   │   │   ├── GameController.php
│   │   │   │   ├── InstagramFilterController.php
│   │   │   │   ├── AnalyticsController.php
│   │   │   │   ├── TransactionController.php
│   │   │   │   └── InvitationSettingController.php
│   │   │   │
│   │   │   ├── Public/
│   │   │   │   ├── InvitationPageController.php
│   │   │   │   ├── GuestbookController.php
│   │   │   │   ├── RsvpPublicController.php
│   │   │   │   ├── GenderPollPublicController.php
│   │   │   │   └── GamePublicController.php
│   │   │   │
│   │   │   └── Admin/
│   │   │       ├── AdminDashboardController.php
│   │   │       ├── UserController.php
│   │   │       ├── InvitationAdminController.php
│   │   │       ├── TransactionAdminController.php
│   │   │       ├── ThemeController.php
│   │   │       ├── PackageController.php
│   │   │       ├── EventTypeController.php
│   │   │       ├── EventTypeFieldController.php
│   │   │       ├── TestimonialController.php
│   │   │       └── SettingController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── InvitationOwner.php
│   │   │   ├── InvitationPassword.php
│   │   │   ├── InvitationActive.php
│   │   │   └── AdminAuth.php
│   │   │
│   │   └── Requests/
│   │       ├── Invitation/
│   │       │   ├── StoreInvitationRequest.php
│   │       │   ├── UpdateInvitationRequest.php
│   │       │   └── BuilderStepRequest.php
│   │       ├── Guest/
│   │       │   ├── StoreGuestRequest.php
│   │       │   └── ImportGuestRequest.php
│   │       └── Payment/
│   │           └── CreateTransactionRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── UserProfile.php
│   │   ├── Invitation.php
│   │   ├── EventType.php
│   │   ├── EventTypeField.php
│   │   ├── InvitationContent.php
│   │   ├── InvitationEvent.php
│   │   ├── InvitationSetting.php
│   │   ├── Guest.php
│   │   ├── Rsvp.php
│   │   ├── Comment.php
│   │   ├── GalleryPhoto.php
│   │   ├── Story.php
│   │   ├── BankAccount.php
│   │   ├── QrisAccount.php
│   │   ├── GiftWishlistItem.php
│   │   ├── GenderPollVote.php
│   │   ├── LiveStreamSession.php
│   │   ├── InteractiveGame.php
│   │   ├── GameResponse.php
│   │   ├── InstagramFilter.php
│   │   ├── DressCode.php
│   │   ├── DressCodeItem.php
│   │   ├── DressCodePalette.php
│   │   ├── SliderPhoto.php
│   │   ├── PageView.php
│   │   ├── Transaction.php
│   │   ├── Payment.php
│   │   ├── Theme.php
│   │   ├── ThemeCategory.php
│   │   ├── Package.php
│   │   ├── PackageFeature.php
│   │   ├── Testimonial.php
│   │   ├── AdminUser.php
│   │   └── ActivityLog.php
│   │
│   ├── Services/
│   │   ├── InvitationService.php
│   │   ├── InvitationBuilderService.php
│   │   ├── InvitationContentService.php    ← EAV manager
│   │   ├── ThemeService.php
│   │   ├── GuestService.php
│   │   ├── WhatsAppService.php
│   │   ├── QrCodeService.php
│   │   ├── RsvpService.php
│   │   ├── TransactionService.php
│   │   ├── PaymentGatewayService.php
│   │   ├── InvoiceService.php
│   │   ├── AnalyticsService.php
│   │   ├── NotificationService.php
│   │   ├── GenderPollService.php
│   │   └── MediaService.php
│   │
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   ├── InvitationRepositoryInterface.php
│   │   │   └── UserRepositoryInterface.php
│   │   ├── InvitationRepository.php
│   │   ├── UserRepository.php
│   │   ├── GuestRepository.php
│   │   └── TransactionRepository.php
│   │
│   ├── Jobs/
│   │   ├── SendWhatsAppInvitation.php
│   │   ├── SendWhatsAppRsvpNotification.php
│   │   ├── GenerateQrCode.php
│   │   ├── GenerateInvoicePdf.php
│   │   ├── SendEmailNotification.php
│   │   ├── ProcessPaymentCallback.php
│   │   └── OptimizeUploadedImage.php
│   │
│   ├── Events/
│   │   ├── InvitationActivated.php
│   │   ├── PaymentReceived.php
│   │   ├── RsvpSubmitted.php
│   │   └── GenderRevealed.php
│   │
│   ├── Listeners/
│   │   ├── SendActivationNotification.php
│   │   ├── SendPaymentConfirmation.php
│   │   ├── NotifyUserOfRsvp.php
│   │   └── TriggerRevealAnimation.php
│   │
│   └── Policies/
│       ├── InvitationPolicy.php
│       ├── GuestPolicy.php
│       ├── TransactionPolicy.php
│       └── ThemePolicy.php
│
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── EventTypeSeeder.php
│       ├── PackageSeeder.php
│       └── SettingSeeder.php
│
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Invitation/
│   │   │   │   │   ├── Overview.tsx
│   │   │   │   │   ├── Builder.tsx
│   │   │   │   │   ├── Guests.tsx
│   │   │   │   │   ├── Guestbook.tsx
│   │   │   │   │   ├── Analytics.tsx
│   │   │   │   │   ├── GenderPoll.tsx
│   │   │   │   │   ├── LiveStream.tsx
│   │   │   │   │   ├── Wishlist.tsx
│   │   │   │   │   ├── Games.tsx
│   │   │   │   │   └── Settings.tsx
│   │   │   │   └── Wizard/
│   │   │   │       ├── Step1EventType.tsx
│   │   │   │       ├── Step2/
│   │   │   │       │   ├── Step2Wedding.tsx
│   │   │   │       │   ├── Step2Birthday.tsx
│   │   │   │       │   ├── Step2Khitanan.tsx
│   │   │   │       │   ├── Step2Aqiqah.tsx
│   │   │   │       │   ├── Step2GenderReveal.tsx
│   │   │   │       │   ├── Step2Syukuran.tsx
│   │   │   │       │   └── Step2Generic.tsx
│   │   │   │       ├── Step3Schedule.tsx
│   │   │   │       ├── Step4Gallery.tsx
│   │   │   │       ├── Step5Theme.tsx
│   │   │   │       └── Step6Payment.tsx
│   │   │   ├── Admin/
│   │   │   └── Public/
│   │   │       ├── InvitationPublic.tsx   ← /{kode} — render dinamis per event_type
│   │   │       └── GuestbookPublic.tsx    ← /{kode}/guestbook
│   │   ├── Components/
│   │   │   ├── UI/                        ← shadcn/ui + custom components
│   │   │   ├── Invitation/
│   │   │   │   ├── GenderPollWidget.tsx
│   │   │   │   ├── LiveStreamEmbed.tsx
│   │   │   │   ├── WishlistGrid.tsx
│   │   │   │   ├── GameWidget.tsx
│   │   │   │   └── RevealAnimation.tsx    ← Framer Motion reveal animation
│   │   │   ├── Public/                    ← komponen halaman undangan publik
│   │   │   │   ├── OpeningScreen.tsx      ← Framer Motion opening
│   │   │   │   ├── CountdownTimer.tsx     ← Framer Motion countdown
│   │   │   │   ├── GallerySection.tsx     ← Swiper.js + Framer Motion
│   │   │   │   ├── RsvpForm.tsx           ← React Hook Form + Zod + Framer Motion
│   │   │   │   └── TimelineSection.tsx    ← Framer Motion scroll reveal
│   │   │   └── Admin/
│   │   ├── Layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── PublicLayout.tsx
│   │   ├── hooks/                         ← custom React hooks
│   │   ├── stores/                        ← Zustand stores
│   │   │   ├── useInvitationStore.ts
│   │   │   ├── useWizardStore.ts
│   │   │   └── useGenderPollStore.ts
│   │   ├── lib/
│   │   │   ├── utils.ts                   ← cn() helper (shadcn/ui)
│   │   │   └── validators/                ← Zod schemas
│   │   │       ├── invitationSchema.ts
│   │   │       ├── guestSchema.ts
│   │   │       └── rsvpSchema.ts
│   │   └── types/                         ← TypeScript types
│   │       ├── invitation.ts
│   │       ├── guest.ts
│   │       ├── eventType.ts
│   │       └── transaction.ts
│   └── views/
│       └── app.blade.php
│
├── routes/
│   ├── web.php
│   ├── auth.php
│   ├── admin.php
│   └── api.php
│
└── docker/
    ├── nginx/
    ├── php/
    └── docker-compose.yml
```

---

### 3.2 Model Invitation.php — Relationships Lengkap

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\{
    BelongsTo, HasMany, HasOne
};

class Invitation extends Model
{
    use SoftDeletes;

    protected $casts = [
        'event_date'   => 'date',
        'expired_at'   => 'datetime',
        'published_at' => 'datetime',
    ];

    // Core relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    // Content & structure
    public function contents(): HasMany
    {
        return $this->hasMany(InvitationContent::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(InvitationEvent::class)->orderBy('sort_order');
    }

    public function setting(): HasOne
    {
        return $this->hasOne(InvitationSetting::class);
    }

    // Guests & RSVP
    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)
                    ->where('is_approved', true)
                    ->latest();
    }

    // Media
    public function galleryPhotos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)
                    ->where('category', 'general')
                    ->orderBy('sort_order');
    }

    public function preweddingPhotos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)
                    ->where('category', 'prewedding')
                    ->orderBy('sort_order');
    }

    public function pregnancyPhotos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)
                    ->where('category', 'pregnancy')
                    ->orderBy('sort_order');
    }

    public function videoGallery(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)
                    ->where('media_type', 'video')
                    ->orderBy('sort_order');
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class)->orderBy('sort_order');
    }

    public function loveStories(): HasMany
    {
        return $this->hasMany(Story::class)
                    ->where('story_type', 'love_story')
                    ->orderBy('sort_order');
    }

    public function sliderPhotos(): HasMany
    {
        return $this->hasMany(SliderPhoto::class)->orderBy('sort_order');
    }

    // Finance
    public function bankAccounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }

    public function qrisAccounts(): HasMany
    {
        return $this->hasMany(QrisAccount::class);
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    // Specialized features
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(GiftWishlistItem::class)->orderBy('sort_order');
    }

    public function genderPollVotes(): HasMany
    {
        return $this->hasMany(GenderPollVote::class);
    }

    public function liveStreamSessions(): HasMany
    {
        return $this->hasMany(LiveStreamSession::class)->orderBy('sort_order');
    }

    public function games(): HasMany
    {
        return $this->hasMany(InteractiveGame::class);
    }

    public function instagramFilter(): HasOne
    {
        return $this->hasOne(InstagramFilter::class);
    }

    public function dressCode(): HasOne
    {
        return $this->hasOne(DressCode::class);
    }

    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    // EAV helper methods
    public function getContent(string $key, mixed $default = null): mixed
    {
        return $this->contents->firstWhere('content_key', $key)?->content_value ?? $default;
    }

    public function setContent(string $key, mixed $value, string $type = 'text'): void
    {
        $this->contents()->updateOrCreate(
            ['content_key' => $key],
            ['content_value' => $value, 'content_type' => $type]
        );
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active')
                     ->where(fn($q) => $q->whereNull('expired_at')
                                        ->orWhere('expired_at', '>', now()));
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    // Helpers
    public function isExpired(): bool
    {
        return $this->expired_at && $this->expired_at->isPast();
    }

    public function getPublicUrl(): string
    {
        if ($this->custom_domain) {
            return 'https://' . $this->custom_domain;
        }

        return url('/i/' . $this->slug);
    }
}
```

---

### 3.3 InvitationContentService.php — EAV Manager

```php
<?php

namespace App\Services;

use App\Models\Invitation;

class InvitationContentService
{
    /**
     * Ambil definisi field untuk event type tertentu.
     * Setiap field memiliki: label, required, type.
     */
    public function getFieldDefinitions(string $eventTypeName): array
    {
        return match($eventTypeName) {
            'wedding'       => $this->weddingFields(),
            'birthday'      => $this->birthdayFields(),
            'khitanan'      => $this->khitananFields(),
            'aqiqah'        => $this->aqiqahFields(),
            'gender_reveal' => $this->genderRevealFields(),
            'syukuran'      => $this->syukuranFields(),
            default         => $this->genericFields(),
        };
    }

    public function validate(Invitation $invitation, array $data): array
    {
        $fields = $this->getFieldDefinitions($invitation->eventType->name);
        $errors = [];

        foreach ($fields as $key => $config) {
            if ($config['required'] && empty($data[$key])) {
                $errors[$key] = "{$config['label']} wajib diisi.";
            }
        }

        return $errors;
    }

    public function saveAll(Invitation $invitation, array $data): void
    {
        foreach ($data as $key => $value) {
            if (!is_null($value) && $value !== '') {
                $type = $this->inferType($key);
                $invitation->setContent($key, $value, $type);
            }
        }
    }

    private function inferType(string $key): string
    {
        if (str_ends_with($key, '_photo') || str_ends_with($key, '_image')) {
            return 'path';
        }

        if (in_array($key, ['pregnancy_photos', 'character_color_primary'])) {
            return 'json';
        }

        return 'text';
    }

    private function weddingFields(): array
    {
        return [
            'groom_name'   => ['label' => 'Nama Mempelai Pria', 'required' => true],
            'bride_name'   => ['label' => 'Nama Mempelai Wanita', 'required' => true],
            'groom_photo'  => ['label' => 'Foto Mempelai Pria', 'required' => false],
            'bride_photo'  => ['label' => 'Foto Mempelai Wanita', 'required' => false],
            'groom_father' => ['label' => 'Nama Ayah Mempelai Pria', 'required' => false],
            'groom_mother' => ['label' => 'Nama Ibu Mempelai Pria', 'required' => false],
            'bride_father' => ['label' => 'Nama Ayah Mempelai Wanita', 'required' => false],
            'bride_mother' => ['label' => 'Nama Ibu Mempelai Wanita', 'required' => false],
            'groom_bio'    => ['label' => 'Bio Mempelai Pria', 'required' => false],
            'bride_bio'    => ['label' => 'Bio Mempelai Wanita', 'required' => false],
            'groom_instagram'  => ['label' => 'Instagram Mempelai Pria', 'required' => false],
            'bride_instagram'  => ['label' => 'Instagram Mempelai Wanita', 'required' => false],
            'opening_verse'    => ['label' => 'Ayat/Quote Pembuka', 'required' => false],
            'instagram_hashtag'=> ['label' => 'Hashtag Pernikahan', 'required' => false],
        ];
    }

    private function birthdayFields(): array
    {
        return [
            'child_name'      => ['label' => 'Nama Anak', 'required' => true],
            'child_age'       => ['label' => 'Usia yang Diraikan', 'required' => true],
            'child_photo'     => ['label' => 'Foto Anak', 'required' => false],
            'child_birthdate' => ['label' => 'Tanggal Lahir', 'required' => false],
            'child_father'    => ['label' => 'Nama Ayah', 'required' => false],
            'child_mother'    => ['label' => 'Nama Ibu', 'required' => false],
            'character_theme' => ['label' => 'Tema Karakter', 'required' => false],
        ];
    }

    private function aqiqahFields(): array
    {
        return [
            'baby_name'       => ['label' => 'Nama Bayi', 'required' => true],
            'baby_gender'     => ['label' => 'Jenis Kelamin', 'required' => true],
            'baby_birthdate'  => ['label' => 'Tanggal Lahir', 'required' => true],
            'baby_photo'      => ['label' => 'Foto Bayi', 'required' => false],
            'baby_weight'     => ['label' => 'Berat Lahir', 'required' => false],
            'baby_length'     => ['label' => 'Panjang Lahir', 'required' => false],
            'baby_birth_place'=> ['label' => 'Tempat Lahir', 'required' => false],
            'father_name'     => ['label' => 'Nama Ayah', 'required' => true],
            'mother_name'     => ['label' => 'Nama Ibu', 'required' => true],
            'baby_name_meaning'=> ['label' => 'Arti Nama', 'required' => false],
            'gratitude_message'=> ['label' => 'Pesan Syukur', 'required' => false],
        ];
    }

    private function genderRevealFields(): array
    {
        return [
            'father_name'         => ['label' => 'Nama Ayah', 'required' => true],
            'mother_name'         => ['label' => 'Nama Ibu', 'required' => true],
            'due_date'            => ['label' => 'HPL (Perkiraan Lahir)', 'required' => false],
            'pregnancy_week'      => ['label' => 'Usia Kehamilan', 'required' => false],
            'pregnancy_story'     => ['label' => 'Cerita Kehamilan', 'required' => false],
            'reveal_type'         => ['label' => 'Tipe Reveal', 'required' => false],
            'reveal_scheduled_at' => ['label' => 'Waktu Reveal', 'required' => false],
            'team_pink_label'     => ['label' => 'Label Tim Pink', 'required' => false],
            'team_blue_label'     => ['label' => 'Label Tim Biru', 'required' => false],
            'poll_closes_at'      => ['label' => 'Polling Ditutup', 'required' => false],
        ];
    }

    private function khitananFields(): array
    {
        return [
            'child_name'    => ['label' => 'Nama Anak', 'required' => true],
            'child_father'  => ['label' => 'Nama Ayah', 'required' => true],
            'child_mother'  => ['label' => 'Nama Ibu', 'required' => true],
            'child_photo'   => ['label' => 'Foto Anak', 'required' => false],
            'child_age'     => ['label' => 'Usia Anak', 'required' => false],
            'family_photo'  => ['label' => 'Foto Keluarga', 'required' => false],
            'ceremony_notes'=> ['label' => 'Catatan Upacara', 'required' => false],
        ];
    }

    private function syukuranFields(): array
    {
        return [
            'event_purpose'    => ['label' => 'Tujuan Acara', 'required' => true],
            'organizer_name'   => ['label' => 'Nama Penyelenggara', 'required' => true],
            'event_type_detail'=> ['label' => 'Jenis Syukuran', 'required' => false],
            'opening_doa'      => ['label' => 'Doa/Kata Pembuka', 'required' => false],
            'closing_message'  => ['label' => 'Pesan Penutup', 'required' => false],
        ];
    }

    private function genericFields(): array
    {
        return [
            'event_title'       => ['label' => 'Judul Acara', 'required' => true],
            'event_description' => ['label' => 'Deskripsi Acara', 'required' => false],
            'organizer_name'    => ['label' => 'Nama Penyelenggara', 'required' => false],
        ];
    }
}
```

---

### 3.4 GenderPollService.php

```php
<?php

namespace App\Services;

use App\Models\{GenderPollVote, Invitation};

class GenderPollService
{
    public function vote(
        Invitation $invitation,
        string $voterName,
        string $teamChoice,
        string $message,
        string $ipAddress
    ): array {
        // Cek double vote dari IP
        $existing = GenderPollVote::where('invitation_id', $invitation->id)
                                  ->where('ip_address', $ipAddress)
                                  ->exists();

        if ($existing) {
            return ['success' => false, 'message' => 'Kamu sudah memberikan prediksi!'];
        }

        // Cek apakah polling masih terbuka
        $pollOpen = $invitation->setting?->gender_poll_open ?? true;
        $pollClosesAt = $invitation->getContent('poll_closes_at');

        if (! $pollOpen || ($pollClosesAt && now()->isAfter($pollClosesAt))) {
            return ['success' => false, 'message' => 'Polling sudah ditutup.'];
        }

        GenderPollVote::create([
            'invitation_id' => $invitation->id,
            'voter_name'    => $voterName,
            'vote'          => $teamChoice,
            'message'       => $message,
            'ip_address'    => $ipAddress,
        ]);

        return ['success' => true, 'tally' => $this->getTally($invitation)];
    }

    public function getTally(Invitation $invitation): array
    {
        $votes = GenderPollVote::where('invitation_id', $invitation->id)
                               ->selectRaw('vote, COUNT(*) as count')
                               ->groupBy('vote')
                               ->pluck('count', 'vote');

        $pink  = $votes['pink'] ?? 0;
        $blue  = $votes['blue'] ?? 0;
        $total = $pink + $blue;

        return [
            'pink'     => $pink,
            'blue'     => $blue,
            'total'    => $total,
            'pink_pct' => $total > 0 ? round(($pink / $total) * 100) : 50,
            'blue_pct' => $total > 0 ? round(($blue / $total) * 100) : 50,
        ];
    }

    public function reveal(Invitation $invitation, string $gender): void
    {
        // Simpan hasil reveal
        $invitation->setContent('result_gender', $gender);

        // Tutup polling
        $invitation->setting()->update(['gender_poll_open' => false]);

        // Dispatch event untuk animasi & notifikasi
        event(new \App\Events\GenderRevealed($invitation, $gender));
    }
}
```

---

### 3.5 InvitationFeatureGate.php

```php
<?php

namespace App\Services;

use App\Models\Invitation;

class InvitationFeatureGate
{
    private array $features;

    public function __construct(private readonly Invitation $invitation)
    {
        // Cache features per invitation — hanya query sekali per request
        $this->features = cache()->remember(
            "feature_gate:{$invitation->id}",
            now()->addMinutes(10),
            fn () => $invitation->package
                ?->features
                ->pluck('feature_value', 'feature_key')
                ->toArray() ?? []
        );
    }

    // Semua data operasional (tamu, foto, RSVP, dll.) UNLIMITED untuk semua paket.
    // Gate hanya mengontrol AKSES FITUR, bukan kuota data.

    public function can(string $feature): bool
    {
        return match($feature) {
            // Amplop & Payment
            'amplop_digital'    => $this->bool('amplop_digital'),
            'qris'              => $this->bool('amplop_digital'),   // QRIS bagian dari amplop digital

            // WhatsApp Gateway
            'whatsapp_blast'    => $this->bool('whatsapp_blast'),
            'wa_scheduling'     => $this->bool('wa_scheduling'),
            'wa_followup'       => $this->bool('wa_followup'),
            'wa_stats'          => $this->bool('wa_stats'),

            // Domain
            'custom_domain'     => $this->bool('custom_domain'),
            'multi_domain'      => $this->bool('multi_domain'),

            // Builder & Tema
            'premium_theme'     => $this->bool('premium_theme'),
            'live_streaming'    => $this->bool('live_streaming'),
            'instagram_filter'  => $this->bool('instagram_filter'),
            'multi_admin'       => $this->bool('multi_admin'),
            'priority_support'  => $this->bool('priority_support'),

            // Event-type khusus
            'interactive_games' => $this->bool('interactive_games'),
            'gift_wishlist'     => $this->bool('gift_wishlist'),

            default             => false,
        };
    }

    // Page builder level: 'basic' | 'intermediate' | 'full'
    public function pageBuilderLevel(): string
    {
        return $this->features['page_builder'] ?? 'basic';
    }

    // Analytics level: 'basic' | 'full' | 'advanced'
    public function analyticsLevel(): string
    {
        return $this->features['analytics'] ?? 'basic';
    }

    public function invalidateCache(): void
    {
        cache()->forget("feature_gate:{$this->invitation->id}");
    }

    private function bool(string $key): bool
    {
        return ($this->features[$key] ?? 'false') === 'true';
    }
}
```

---

## BAGIAN 4 — RANCANGAN HAK AKSES

### 4.1 Role & Permission Matrix

Sistem menggunakan **Spatie Laravel Permission** dengan 4 role:

| Role | Deskripsi |
|------|-----------|
| `super_admin` | Akses penuh ke seluruh sistem termasuk kelola admin lain |
| `admin` | Kelola konten platform (tema, paket, pengguna) |
| `customer` | Pengguna biasa — kelola undangan miliknya sendiri |
| `guest_visitor` | Tidak login — hanya akses halaman publik |

### 4.2 Paket & Feature Gate

> **Semua paket: Unlimited** tamu, RSVP, buku tamu, foto, video, pengunjung, statistik, amplop digital, undangan, dan transaksi.
> Perbedaan paket hanya berdasarkan **akses fitur** — tidak ada pembatasan jumlah data.

| Fitur | Basic | Premium | Exclusive |
|-------|:-----:|:-------:|:---------:|
| **Data** (semua unlimited) | ✅ | ✅ | ✅ |
| RSVP | ✅ | ✅ | ✅ |
| Buku Tamu | ✅ | ✅ | ✅ |
| Countdown | ✅ | ✅ | ✅ |
| Background Music | ✅ | ✅ | ✅ |
| Galeri Foto & Video | ✅ | ✅ | ✅ |
| Import Tamu CSV | ✅ | ✅ | ✅ |
| QR Code per Tamu | ✅ | ✅ | ✅ |
| Kirim WA Manual | ✅ | ✅ | ✅ |
| Page Builder | Dasar | Menengah | Penuh |
| **Amplop Digital** | ❌ | ✅ | ✅ |
| **Love Story** | ❌ | ✅ | ✅ |
| **Tema Premium** | ❌ | ✅ | ✅ |
| **Analitik** | Dasar | Lengkap | Advanced |
| **WA Broadcast** | ❌ | ✅ | ✅ |
| **WA Scheduling** | ❌ | ✅ | ✅ |
| **WA Statistik** | ❌ | ✅ | ✅ |
| **Custom Domain** | ❌ | 1 Domain | Unlimited |
| **Live Streaming** | ❌ | ❌ | ✅ |
| **WA Follow-up RSVP** | ❌ | ❌ | ✅ |
| **Multi Admin Event** | ❌ | ❌ | ✅ |
| **Filter Instagram** | ❌ | ❌ | ✅ |
| **Priority Support** | ❌ | ❌ | ✅ |
| Masa Aktif | 90 hari | 180 hari | 365 hari |

---

## BAGIAN 5 — POLA PENGEMBANGAN: CARA MENAMBAH EVENT TYPE BARU

Ketika ingin menambahkan event type baru (contoh: **Seminar**, **Reuni**):

```
1. INSERT ke tabel event_types                    ← 1 baris data
2. INSERT ke tabel event_type_fields              ← Definisi field yang diperlukan
3. Tambah case di InvitationContentService        ← ~10-15 baris kode
4. Buat Step2[EventType].tsx                      ← 1 komponen React baru
5. Tambah sidebar menu condition                  ← 1-2 baris kode di DashboardLayout
6. Buat view template halaman publik              ← 1 template

TIDAK perlu:
✗ ALTER TABLE apapun (kecuali fitur benar-benar baru)
✗ Mengubah model Invitation
✗ Mengubah InvitationController
✗ Database migration baru
```

---

## BAGIAN 6 — HALAMAN PUBLIK: EAGER LOADING

### 6.1 InvitationPageController.php

```php
public function show(string $slug)
{
    $invitation = Invitation::with([
        'eventType',
        'theme',
        'contents',                  // eager load semua EAV sekaligus
        'events',
        'setting',
        'galleryPhotos',
        'preweddingPhotos',          // wedding
        'pregnancyPhotos',           // gender reveal
        'videoGallery',              // wedding
        'stories',
        'loveStories',               // wedding
        'bankAccounts',
        'qrisAccounts',
        'liveStreamSessions',        // wedding / birthday gold
        'instagramFilter',           // wedding
        'dressCode.items',
        'dressCode.palettes',
        'wishlistItems',             // birthday
        'games',                     // birthday
    ])
    ->where('slug', $slug)
    ->active()
    ->firstOrFail();

    // Track page view via queue (non-blocking)
    \App\Jobs\TrackPageView::dispatch(
        $invitation->id,
        request()->ip(),
        request()->header('User-Agent'),
        request()->get('ref', 'direct')
    );

    return Inertia::render('Public/Invitation', [
        'invitation' => \App\Http\Resources\InvitationPublicResource::make($invitation),
    ]);
}
```

---

## BAGIAN 7 — TEKNOLOGI STACK

### Backend
| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Laravel | 12.x |
| PHP | PHP | 8.4+ |
| Database | MySQL | 8.0+ |
| Cache & Queue | Redis | 7.x |
| Queue Manager | Laravel Horizon | Latest |
| Auth | Laravel Sanctum | Latest |
| Auth Social | Laravel Socialite | Latest |
| Permission | Spatie Permission | Latest |
| Media | Spatie Media Library | Latest |
| Activity Log | Spatie Activity Log | Latest |
| PDF | barryvdh/laravel-dompdf | Latest |
| QR Code | SimpleSoftwareIO/simple-qrcode | Latest |
| Testing | Pest PHP | 3.x |
| WebSocket | Laravel Reverb | Latest |

### Frontend
| Layer | Teknologi | Versi |
|-------|-----------|-------|
| SSR Bridge | Inertia.js | Latest |
| JS Framework | React.js | 18.x |
| Type Safety | TypeScript | 5.x |
| CSS Framework | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | Latest |
| Animasi Utama | Framer Motion | Latest |
| Animasi Premium | GSAP | Latest (tema premium saja) |
| Form | React Hook Form | Latest |
| Validasi | Zod | Latest |
| State | Zustand | Latest |
| Slider | Swiper.js | Latest |
| Icons | Lucide React | Latest |
| Charts | Recharts | Latest |
| Build Tool | Vite | Latest |
| Rich Text | Tiptap | Latest |

---

## BAGIAN 8 — CATATAN RISIKO TEKNIS

### 8.1 EAV Performance
- **Wajib** eager load `contents` di semua query halaman publik
- Gunakan `->pluck('content_value', 'content_key')` bukan loop satu per satu
- Cache halaman publik 5 menit di Redis, invalidate saat konten berubah

### 8.2 Gender Reveal — Proteksi
- Anti double-vote via kombinasi `ip_address` + session fingerprint
- `result_gender` hanya dapat di-set 1x oleh owner (validasi di service)
- Setelah reveal, polling otomatis ditutup

### 8.3 Live Stream Embed
- YouTube embed memiliki X-Frame-Options policy — gunakan `youtube-nocookie.com`
- Instagram Live tidak support embed — redirect ke link langsung
- Tambahkan `is_public` flag untuk live stream yang hanya boleh dilihat tamu terdaftar

### 8.4 Games State
- `game_responses` dapat grow cepat jika banyak undangan aktif
- Tambahkan indeks di `(game_id, responded_at)` untuk query terbaru
- Pertimbangkan partitioning di masa depan jika volume besar

---

## BAGIAN 9 — FITUR PREMIUM: WHATSAPP GATEWAY, CUSTOM DOMAIN, PAGE BUILDER

### 9.1 WhatsApp Gateway

#### Arsitektur Provider

WA Gateway menggunakan **Strategy Pattern** yang sama dengan Payment Gateway — provider bisa diganti tanpa mengubah logika bisnis.

```php
// app/Services/WhatsApp/Contracts/WhatsAppProviderInterface.php
interface WhatsAppProviderInterface
{
    public function send(string $phone, string $message): WhatsAppResult;
    public function bulkSend(array $recipients): array;          // [{phone, message}]
    public function getStatus(string $providerRef): string;
    public function getDriver(): string;
}

// Providers yang didukung (konfigurasi via admin panel):
// FonnteProvider, WablasProvider, ZenzivaSmsProvider
// Tambah provider baru: extend + register — tidak ubah core
```

#### Alur Kirim Massal via Queue

```
User klik "Kirim Massal"
        │
        ▼
WhatsAppService::sendBulk($invitation, $guestIds, $templateId)
        │
        ▼
Buat WhatsAppSendLog per tamu (status: pending)
        │
        ▼
Dispatch Job: SendWhatsAppInvitation::dispatch($log)
        │ (diproses Horizon — tidak blocking)
        ▼
Job: ambil log → substitusi variabel → kirim via Provider
        │
        ├── Berhasil → update status = 'sent', sent_at = now()
        └── Gagal    → update status = 'failed', retry_count++
                           → re-dispatch jika retry_count < 3
```

#### Template Variables

```php
// Variabel yang tersedia dalam template pesan:
$variables = [
    '{nama_tamu}'     => $guest->name,
    '{link_undangan}' => $invitation->publicUrl($guest),  // URL + ?tamu=NamaTamu
    '{nama_acara}'    => $invitation->title,
    '{tanggal_acara}' => $invitation->event_date?->format('d F Y'),
    '{nama_pengirim}' => $invitation->owner->name,
];

// Contoh template body:
// "Halo {nama_tamu}, kami mengundang Anda ke {nama_acara}.
//  Buka undangan: {link_undangan}"
```

#### Feature Gate Check

```php
// Di controller sebelum aksi WA massal:
$gate = new InvitationFeatureGate($invitation);

if (!$gate->can('whatsapp_blast')) {
    return back()->with('error', 'Fitur ini tidak tersedia di paket Anda.');
}
```

---

### 9.2 Custom Domain

#### Alur Verifikasi DNS

```
1. User daftarkan: pernikahan-budi.com
   → System simpan di custom_domains, generate verification_token

2. System tampilkan instruksi:
   Tambahkan TXT record di DNS manager domain Anda:
   Host: _undesia-verify.pernikahan-budi.com
   Value: undesia-verify-abc123xyz

3. Command::schedule (tiap 10 menit):
   php artisan domain:verify-pending
   → Cek DNS TXT record via dns_get_record()
   → Jika match → status = 'verifying' → trigger SSL provisioning

4. SSL via Let's Encrypt / Cloudflare proxy:
   → ssl_status = 'active'
   → domain status = 'active'
   → User dapat pakai domain

5. Middleware ResolveDomainInvitation:
   → Setiap request cek header Host
   → Jika cocok custom_domains.domain → set $invitation ke request
   → Route ke PublicInvitationController
```

#### Artisan Commands

```php
// Cek DNS pending domains — dijadwalkan tiap 10 menit
php artisan domain:verify-pending

// Cek renewal SSL mendekati expired
php artisan domain:check-ssl-renewal
```

#### Feature Gate

```php
$gate = new InvitationFeatureGate($invitation);

// Cek sebelum izinkan tambah domain
if (!$gate->can('custom_domain')) {
    abort(403, 'Custom domain tidak tersedia di paket Anda.');
}

// Cek multi-domain
if (!$gate->can('multi_domain') && $invitation->customDomains()->count() >= 1) {
    abort(403, 'Paket Anda hanya mendukung 1 custom domain.');
}
```

---

### 9.3 Page Builder

#### Inisialisasi Section Default

Saat undangan dibuat, sistem otomatis membuat `invitation_sections` dengan konfigurasi default berdasarkan event type:

```php
// InvitationService::create() memanggil:
PageBuilderService::initializeSections($invitation);

// PageBuilderService.php
public function initializeSections(Invitation $invitation): void
{
    $defaultSections = $this->getDefaultSections($invitation->eventType->name);
    foreach ($defaultSections as $order => $section) {
        InvitationSection::create([
            'invitation_id' => $invitation->id,
            'section_key'   => $section['key'],
            'is_active'     => $section['default_active'],
            'sort_order'    => $order,
            'settings'      => $section['default_settings'] ?? null,
        ]);
    }
}

private function getDefaultSections(string $eventType): array
{
    $common = [
        ['key' => 'hero',       'default_active' => true],
        ['key' => 'event_info', 'default_active' => true],
        ['key' => 'countdown',  'default_active' => true],
        ['key' => 'gallery',    'default_active' => true],
        ['key' => 'rsvp',       'default_active' => true],
        ['key' => 'guestbook',  'default_active' => true],
        ['key' => 'gift',       'default_active' => false],
        ['key' => 'maps',       'default_active' => true],
        ['key' => 'footer',     'default_active' => true],
    ];

    return match($eventType) {
        'wedding' => [
            ...$common,
            ['key' => 'love_story', 'default_active' => true],
            ['key' => 'video',      'default_active' => false],
        ],
        'birthday' => [
            ...$common,
            ['key' => 'video', 'default_active' => false],
        ],
        default => $common,
    };
}
```

#### Feature Gate per Builder Action

```php
// Di PageBuilderController — cek level builder sebelum izinkan aksi
$level = (new InvitationFeatureGate($invitation))->pageBuilderLevel();

match(true) {
    $action === 'reorder' && $level === 'basic'        => abort(403, 'Upgrade paket untuk drag & drop.'),
    $action === 'live_preview' && $level === 'basic'   => abort(403, 'Live preview tersedia di paket Premium ke atas.'),
    $action === 'duplicate' && $level === 'basic'      => abort(403, 'Upgrade untuk duplikat section.'),
    default => null,
};
```

#### React Component — PageBuilder

```tsx
// resources/js/Pages/Dashboard/Invitation/Builder.tsx
// Dnd Kit untuk drag & drop (tersedia hanya jika level === 'full')
// Framer Motion untuk animasi perubahan order

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'

export default function BuilderPage({ invitation, sections, builderLevel }) {
  const isDragEnabled = builderLevel === 'full'

  return (
    <DndContext enabled={isDragEnabled} collisionDetection={closestCenter}>
      <SortableContext items={sections.map(s => s.section_key)}>
        <AnimatePresence>
          {sections.map(section => (
            <motion.div key={section.section_key} layout>
              <SectionCard
                section={section}
                canDrag={isDragEnabled}
                canPreview={builderLevel !== 'basic'}
                canDuplicate={builderLevel !== 'basic'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    </DndContext>
  )
}
```

---

### 9.4 Kebijakan Unlimited Usage

**Prinsip:**
Tidak ada pembatasan berbasis kuota di seluruh platform. Semua paket mendukung unlimited tamu, RSVP, buku tamu, foto, video, pengiriman WA, pengunjung, statistik, amplop digital, undangan, dan transaksi.

**Yang Membedakan Paket:**
Hanya akses fitur — bukan batas penggunaan.

**Implikasi Teknis:**
- Tidak ada kolom `max_guests`, `max_photos`, `max_invitations` di tabel manapun
- `InvitationFeatureGate` tidak memiliki method `maxGuests()` atau `maxPhotos()`
- `package_features` hanya berisi feature keys berbasis boolean atau level (`true`/`false`/`basic`/`full`)
- Infrastruktur (storage, bandwidth) dikelola di level server, bukan di level aplikasi

**Catatan Infrastruktur:**
Storage file (foto, video, aset) menggunakan Cloudflare R2 / AWS S3. Kebijakan batas storage per user dapat dikonfigurasi di level bucket policy — bukan di level kode aplikasi.

---

*Dokumen ini disusun pada 10 Juni 2026 sebagai ekstensi dari SYSTEM_REDESIGN.md v1.0.0*
*Versi: 2.0.0 | Mencakup semua jenis undangan: Wedding, Birthday, Khitanan, Aqiqah, Gender Reveal, Syukuran*
