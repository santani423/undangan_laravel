# Project Memory - Undesia

Dokumen ini adalah ringkasan konteks proyek agar diskusi teknis berikutnya bisa langsung masuk ke inti masalah. Terakhir dianalisis dari source code lokal pada 2026-06-23.

## 1. Gambaran Umum

Undesia adalah aplikasi SaaS undangan digital berbasis Laravel 12 + Inertia + React. Domain utama aplikasi:

- Admin mengelola paket, tema, user, konten platform, laporan, dan setting sistem.
- Customer membuat dan mengelola undangan digital berdasarkan jenis acara, tema, paket, detail acara, galeri, cerita, musik, tamu, komentar, dompet digital, dan pembayaran.
- Publik membuka undangan melalui kode undangan, mengisi RSVP, dan mengirim ucapan.
- Pembayaran paket berbayar menggunakan Xendit Invoice dan webhook untuk aktivasi undangan.

Stack utama:

- Backend: PHP 8.2, Laravel 12, Eloquent ORM, Laravel auth starter.
- Frontend: React 19, TypeScript, Inertia React 2, Vite 6, Tailwind CSS 4.
- UI: Radix UI primitives, lucide-react, class-variance-authority, clsx, tailwind-merge.
- Auth/ACL: Spatie Laravel Permission.
- Routing helper: Ziggy.
- Payment gateway: Xendit via custom `App\Services\XenditService`.
- Test: Pest + Laravel testing.

## 2. Struktur Folder Penting

- `app/Models`: model Eloquent untuk user, undangan, paket, tema, transaksi, payment, guest, RSVP, komentar, galeri, dompet digital, fitur premium, analytics, dan konfigurasi gateway.
- `app/Http/Controllers/Admin`: controller admin. Yang paling aktif saat ini: `Themes\ThemeController` dan `Settings\PackageController`.
- `app/Http/Controllers/Customer`: controller customer untuk invitation, guest book, comments, digital wallet, payment, transaction.
- `app/Http/Controllers/Webhook`: endpoint webhook Xendit.
- `app/Http/Controllers/Settings`: profile/password/app settings.
- `app/Services`: service integrasi eksternal, saat ini `XenditService`.
- `routes/web.php`: route publik utama, include route settings/auth/admin/customer, dan catch-all viewer undangan.
- `routes/customer.php`: dashboard customer, CRUD undangan, guests, comments, digital wallets, subscription, payments, transactions.
- `routes/admin.php`: dashboard admin, user pages, invitation pages, theme CRUD, package settings CRUD, laporan, settings.
- `routes/api.php`: webhook Xendit dan public API RSVP/wishes.
- `database/migrations`: skema DB lengkap.
- `database/seeders`: data awal event type, package, theme, roles/permissions, users, sample invitation, gateway config, app settings.
- `resources/js/pages`: halaman Inertia React.
- `resources/js/layouts`: layout admin, customer, auth, settings, app shell.
- `resources/js/components`: shared UI component, sidebar, upload/crop, invitation components.
- `resources/js/types`: tipe TypeScript global dan invitation.
- `resources/css/app.css`: entry CSS Tailwind.
- `public/themes`: template HTML statis untuk sebagian tema.
- `storage/app/public`: target upload file undangan, musik, logo, QR, dan aset publik.

## 3. Arsitektur Runtime

Backend Laravel mengirim halaman via Inertia. Entry frontend ada di `resources/js/app.tsx`, memakai `createInertiaApp`, dynamic page resolution dari `resources/js/pages/**/*.tsx`, dan Ziggy untuk route helper.

Middleware Inertia `HandleInertiaRequests` membagikan props global:

- `name`: nama aplikasi.
- `quote`: random quote Laravel.
- `auth.user`: user login.
- `flash.success` dan `flash.error`.

Error handler di `bootstrap/app.php` merender `resources/js/pages/error.tsx` untuk status 404, 403, 410, 500, dan 503 jika request bukan JSON.

State management frontend tidak memakai Redux/Zustand. Pola state adalah:

- Server state lewat props Inertia.
- Local component state dengan React hooks.
- Form submit lewat Inertia router/form pattern.
- Global ringan hanya appearance/theme via `use-appearance`.

## 4. Alur Bisnis Utama

### Auth dan Role

Auth memakai Laravel starter. `User` memakai Spatie `HasRoles`. Seeder membuat role dan permission. Route admin/customer saat ini sama-sama hanya memakai middleware `auth`; pembatasan role/permission belum terlihat diterapkan di route group.

### Pembuatan Undangan

Alur customer:

1. Customer pilih jenis acara dari `EventType`.
2. Customer pilih tema aktif yang cocok dengan `event_type`.
3. Customer pilih paket aktif yang cocok dengan `invitation_type`.
4. Customer isi detail dinamis berdasarkan `EventTypeField`.
5. `InvitationController@store` membuat:
   - `invitations` dengan status awal `draft`.
   - `invitation_settings` default.
   - `invitation_contents` untuk field dinamis.
   - `invitation_events` untuk jadwal acara.
   - `gallery_photos` untuk galeri.
   - `stories` dan `gallery_photos` kategori `love_story` untuk cerita.
6. Upload gambar base64 disimpan ke disk `public`, biasanya di path `invitations/{id}/...`.

Catatan penting:

- `Invitation::getRouteKeyName()` memakai `slug`.
- Public viewer mencari undangan berdasarkan `invitation_code`, bukan slug.
- Status umum invitation: `draft`, `active`, `archived`.
- Public API hanya menerima undangan `status = active`.

### Edit Undangan

`InvitationController@edit` memuat event type fields, theme, package features, events, contents, gallery, stories, guests, comments, dan digital wallets. Halaman edit juga menjadi pusat beberapa subfitur: detail, settings, guest management, comment moderation, theme switch, music upload, dan wallet linking.

Update utama:

- `update`: update status, field dynamic contents, events, gallery, love story.
- `updateSettings`: greeting, invitation_code, music settings, feature JSON.
- `uploadMusic`: validasi berdasarkan `package.max_music_upload_mb`.
- `updateTheme`: cek kompatibilitas theme event type dan update `usage_count`.

### Tamu, RSVP, dan Komentar

Customer mengelola tamu lewat `GuestBookController`:

- list/pagination/filter.
- create/update/delete guest.
- check-in guest.
- export CSV.
- check slug.

Public RSVP lewat `POST /api/inv/{code}/rsvp`:

- Jika `guest_slug` cocok, update guest existing.
- Jika tidak, buat guest baru.
- Jika ada message dan komentar diizinkan, buat `comments` status `pending`.

Public wishes:

- `GET /api/inv/{code}/wishes` mengambil komentar `approved`.
- `POST /api/inv/{code}/wishes` membuat komentar `pending`.

### Dompet Digital

Customer memiliki master dompet digital di `digital_wallets`. Relasi ke undangan lewat pivot `invitation_digital_wallets` dengan `is_displayed` dan `display_order`. Model `DigitalWallet` punya accessor untuk URL logo dan QRIS.

### Paket dan Fitur

`packages` menyimpan tier, label, harga, periode billing, durasi aktif, trial, batas galeri, batas upload musik, tipe undangan, status aktif, dan order tampil. `package_features` menyimpan fitur fleksibel per paket dengan `feature_key`, `feature_type`, dan `feature_value`.

Admin package CRUD ada di:

- `Admin\Settings\PackageController@index`
- `store`
- `update`
- `updateFeatures`
- `destroy`

Ada route package di dua tempat:

- `/admin/settings/packages`
- `/settings/packages`

Keduanya mengarah ke controller yang sama.

### Tema

Tema disimpan di `themes` dengan `slug`, kategori, event type, preview/thumbnail, warna, tags, premium/exclusive, price, usage count, active flag. Admin CRUD ada di `Admin\Themes\ThemeController`.

Public `/themes` menampilkan tema aktif untuk katalog.

### Pembayaran Xendit

Alur pembayaran:

1. Customer buka `/customer/invitations/{invitation}/payment`.
2. Jika paket gratis, undangan langsung aktif.
3. Jika paket berbayar, `PaymentController@pay` membuat invoice Xendit dahulu.
4. Setelah Xendit sukses, aplikasi membuat/update `transactions` dan membuat `payments`.
5. User diarahkan ke `invoice_url` Xendit via `Inertia::location`.
6. Xendit webhook `POST /api/webhooks/xendit` mencari transaksi dari `external_id`/`invoice_number`.
7. Webhook mengubah:
   - `transactions.status`: `paid`, `expired`, `failed`, atau `pending`.
   - `payments.status`: `success`, `cancelled`, `failed`, atau `pending`.
   - Aktivasi undangan saat status Xendit `PAID` atau `SETTLED`.

Catatan risiko:

- Verifikasi `x-callback-token` di `XenditWebhookController` saat analisis ini masih dikomentari.
- `XenditService::verifyWebhookToken` mengizinkan webhook jika token config kosong.
- `PaymentController@activateInvitation` untuk paket gratis memakai 365 hari, sementara webhook berbayar memakai `package.duration_days`.

## 5. Database Ringkas

Tabel inti Laravel:

- `users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`.

Auth/permission:

- Spatie tables: `permissions`, `roles`, `model_has_permissions`, `model_has_roles`, `role_has_permissions`.

User/profile:

- `users`: name, email, password, phone_number, is_active, soft delete.
- `user_profiles`: user_id unique, phone, whatsapp token, notification preferences, language, timezone, photo, bio.

Master data:

- `event_types`: name, label, description, icon, active.
- `event_type_fields`: field definitions per event type.
- `packages`: package pricing/limits/status/order.
- `package_features`: flexible package capabilities.
- `themes`: template/theme metadata.
- `app_settings`: key/value setting with type and group.

Invitation aggregate:

- `invitations`: owner, event_type, package, theme, slug, invitation_code, title, status, publication/password flags, activation/expiry, comment/plus-one settings.
- `invitation_settings`: feature toggles, greeting cover, music settings, JSON features, display settings.
- `invitation_events`: event name/date/time/location/maps/countdown/order.
- `invitation_contents`: dynamic key-value content per invitation.
- `invitation_payment_methods`: manual payment method per invitation.
- `gallery_photos`: invitation media.
- `stories`: timeline/love story content.
- `slider_photos`: guest/user-submitted photos.
- `guests`: invitees, slug, RSVP/check-in fields, QR fields, notes/message.
- `rsvps`: RSVP records.
- `comments`: wishes/comments with moderation status.

Premium/features:

- `bank_accounts`, `qris_accounts`, `digital_wallets`, `invitation_digital_wallets`.
- `digital_envelope_transactions`.
- `gender_poll_votes`.
- `live_stream_sessions`.
- `interactive_games`, `game_responses`.
- `instagram_filters`.
- `dress_codes`, `dress_code_items`, `dress_code_palettes`.
- `gift_wishlist_items`.
- `page_views`.

Finance/system:

- `transactions`: invoice per invitation/package/user.
- `payments`: gateway payment attempts/webhook payloads.
- `payment_gateway_configs`, `payment_gateway_audit_logs`.
- `activity_logs`, `testimonials`.

Relasi mental utama:

- User has many Invitations, Transactions, DigitalWallets, BankAccounts, QrisAccounts.
- Invitation belongs to User, EventType, Package, Theme.
- Invitation has one Settings and Transaction.
- Invitation has many Events, Contents, Guests, RSVPs, Comments, GalleryPhotos, Stories, Payments via Transaction, PageViews, and feature-specific records.
- Package has many PackageFeatures, Invitations, Transactions.
- Theme belongs to creator user optionally.
- Transaction belongs to User, Invitation, Package and has many Payments.
- Guest belongs to Invitation and has one RSVP plus many comments/photos/game responses/envelope records.
- Invitation belongs to many DigitalWallets through `invitation_digital_wallets`.

## 6. Route/API Ringkas

Web/public:

- `GET /`: welcome page.
- `GET /themes`: public theme catalog.
- `GET /dashboard`: generic auth dashboard.
- `GET /{code}`: public invitation viewer.
- `GET /{code}/{visitor}`: public invitation viewer with visitor slug/name.

API:

- `POST /api/webhooks/xendit`: Xendit webhook.
- `POST /api/inv/{code}/rsvp`: public RSVP.
- `GET /api/inv/{code}/wishes`: approved wishes.
- `POST /api/inv/{code}/wishes`: submit wish.

Customer:

- `/customer`: dashboard.
- `/customer/invitations`: list/create/store.
- `/customer/invitations/create/theme`: select theme/package.
- `/customer/invitations/create/detail`: fill details.
- `/customer/invitations/check-code`: check invitation_code availability.
- `/customer/invitations/{invitation}/payment`: payment page.
- `/customer/invitations/{invitation}/edit`: edit invitation.
- `/customer/invitations/{slug}/settings`: settings page/update.
- `/customer/invitations/{slug}/upload-music`: upload music.
- `/customer/invitations/{invitation}/guests`: guest CRUD/checkin/export/check-slug.
- `/customer/invitations/{invitation}/comments`: moderation actions.
- `/customer/invitations/{invitation}/digital-wallets`: link/sync wallets per invitation.
- `/customer/digital-wallets`: global wallet CRUD.
- `/customer/payments/success`, `/customer/payments/failed`: redirect result pages.
- `/customer/transactions`: transaction list/detail.

Admin:

- `/admin`: dashboard.
- `/admin/users/*`: currently mostly Inertia placeholder pages.
- `/admin/invitations/*`: currently mostly Inertia placeholder pages.
- `/admin/themes`: CRUD implemented.
- `/admin/settings/packages`: CRUD implemented.
- `/admin/settings/*`, `/admin/reports/*`, `/admin/content/testimonials`: mostly page render placeholders.

Settings:

- `/settings/profile`, `/settings/password`, `/settings/appearance`.
- `/settings/app`: app settings with logo/favicon upload/delete.
- `/settings/payment`: page placeholder.
- `/settings/packages`: package CRUD alias.

## 7. Frontend Notes

Layouts:

- `admin-layout.tsx`, `admin-sidebar.tsx`: admin shell/navigation.
- `customer-layout.tsx`, `customer-sidebar.tsx`: customer shell/navigation.
- `app-layout.tsx`, `app-shell.tsx`, `app-sidebar.tsx`: base starter layouts.
- `settings-layout.tsx` and `layouts/settings/*`: settings section.

Invitation UI:

- Public viewer page: `resources/js/pages/invitation/show.tsx`.
- Themes:
  - Wedding Blossom Garden: `resources/js/pages/invitation/themes/wedding/blossom-garden/*`.
  - Birthday Starry Night: `resources/js/pages/invitation/themes/birthday/*`.
- Shared invitation components: RSVP form, countdown, gallery, music player, digital wallet section, wishes section, QR code, toast.

UI system:

- `resources/js/components/ui/*` contains shadcn/Radix-style primitives.
- Icons use `lucide-react`.
- Utility class merger in `resources/js/lib/utils.ts`.

## 8. Development Commands

Common commands:

- Install PHP deps: `composer install`.
- Install JS deps: `npm install`.
- Run all dev services: `composer dev`.
- Run Laravel only: `php artisan serve`.
- Run Vite only: `npm run dev`.
- Build frontend: `npm run build`.
- Format frontend resources: `npm run format`.
- Lint frontend: `npm run lint`.
- Run tests: `php artisan test` or `vendor/bin/pest`.
- Seed data: `php artisan db:seed`.

Seeder test accounts from `DatabaseSeeder`:

- `superadmin@undesia.id / SuperAdmin@2026!`
- `admin@undesia.id / Admin@2026!`
- `demo@undesia.id / Demo@2026!`

## 9. Catatan Kualitas dan Risiko

- Banyak halaman admin masih hanya `Inertia::render`, belum punya backend data/action.
- Beberapa route customer juga placeholder, misalnya delete invitation dan profile update memakai `abort(501)`.
- Middleware route admin belum membatasi role/permission selain `auth`.
- Ada mojibake/encoding rusak pada beberapa komentar PHP, misalnya karakter box drawing terbaca `â...`.
- Public invitation viewer tidak memfilter `status = active` di `InvitationPublicController@show`; ia hanya cek expired. Public API sudah cek active.
- Webhook Xendit token verification sedang dikomentari.
- `routes/web.php` punya catch-all `/{code}` dan `/{code}/{visitor}` di bagian akhir. Route baru harus diletakkan sebelum catch-all agar tidak tertangkap sebagai kode undangan.
- Upload base64 image selalu disimpan sebagai `.jpg` tanpa validasi MIME mendalam.
- `Package` casts indentation sedikit berantakan, tetapi fungsional.
- Ada beberapa dokumen desain besar di root (`FINAL_ARCHITECTURE.md`, `FINAL_DATABASE_DESIGN.md`, dll.) yang mungkin berisi rancangan lebih luas daripada implementasi saat ini.

## 10. Format Instruksi yang Efektif Untuk Diskusi Berikutnya

Saat melaporkan bug, berikan format ini:

```text
Jenis: Bug
Area: contoh Customer > Edit Undangan > Upload Musik
URL/Route: contoh /customer/invitations/abc/settings
User/Role: contoh demo@undesia.id sebagai customer
Data terkait: invitation slug/code, package, theme, guest slug, transaction id jika ada
Langkah reproduksi:
1. ...
2. ...
3. ...
Hasil aktual: apa yang terjadi
Hasil yang diharapkan: apa yang seharusnya terjadi
Error/log: paste pesan error browser, Network tab, Laravel log, stack trace, atau screenshot
Batasan: jangan ubah bagian X / harus kompatibel dengan Y
Prioritas: blocker/high/normal/low
```

Saat meminta fitur baru:

```text
Jenis: Fitur
Tujuan bisnis: kenapa fitur ini dibutuhkan
Pengguna: admin/customer/tamu publik
Area/halaman: lokasi fitur
Alur yang diinginkan:
1. ...
2. ...
3. ...
Data yang perlu disimpan: field, validasi, relasi
UI yang diharapkan: tabel/form/modal/tab/filter/dll
Aturan bisnis: limit paket, permission, status, notifikasi, payment, dll
Acceptance criteria:
- ...
- ...
Batasan teknis/desain: contoh pakai komponen UI existing, jangan ubah migration lama, dll
```

Saat meminta analisis error teknis:

```text
Jenis: Error teknis
Command yang dijalankan: contoh php artisan migrate
Output lengkap: paste error dari terminal
File yang baru diubah: sebutkan path
Kapan mulai terjadi: setelah perubahan apa
Environment: local/staging/production, PHP/Node jika relevan
Yang sudah dicoba: langkah yang sudah dilakukan
```

Semakin konkret route, role, data ID/slug, payload, dan pesan error, semakin cepat analisis bisa langsung menuju file/controller/model yang tepat.
