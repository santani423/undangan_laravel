# Feature Mapping — Undesia

Dokumen ini adalah hasil **FASE 1 (Full Audit)** sebelum migrasi ke arsitektur
_Standalone React Frontend + Laravel REST API_. Isinya: inventaris seluruh fitur,
halaman, endpoint, template, dan titik kopling frontend ↔ Laravel yang ditemukan,
beserta peta tujuan migrasinya.

Kolom **Halaman lama** = komponen Inertia di `resources/js/pages/…`.
Kolom **Frontend baru** = path SPA (URL publik tidak berubah).
Kolom **API v1** = endpoint baru di `/api/v1/…` yang melayani halaman/aksi tersebut.

> Status per baris di akhir migrasi dicatat di `docs/MIGRATION_REPORT.md`.

---

## 1. Ringkasan Audit

| Area | Temuan |
|---|---|
| Stack lama | Laravel 12 + Inertia 2 + React 19 + Vite 6 + Tailwind 4 + Ziggy, SSR opsional (`ssr.jsx`) |
| Kode frontend | ±30.200 baris di luar tema (61 halaman, ±110 komponen) + ±81.400 baris di 48 tema React |
| Ukuran aset tema | 69 MB di `resources/js/pages/invitation/themes` |
| Pemakaian Inertia | 90 file: `Head` (64), `Link` (41), `usePage` (25), `router` (21), `useForm` (13) |
| Pemakaian Ziggy `route()` | 96 pemanggilan (nama route Laravel) |
| `fetch`/`axios` langsung | 21 titik di luar tema memakai URL relatif ke Laravel (akan putus bila beda origin) |
| Tema | **Tidak ada satu pun tema yang mengimpor Inertia.** Tema hanya bergantung pada `@/types/invitation` dan `@/components/invitation/*`, menerima data lewat props |
| State management | Tanpa Redux/Zustand: props Inertia + state lokal + `use-appearance` |
| Auth | Session Laravel (web guard) + Spatie Permission, area `admin` / `customer` via middleware `area:` |
| Pembayaran | Xendit Invoice, Midtrans Snap, QRIS statis (konfirmasi admin), transfer manual (unggah bukti) |
| Test baseline | `php artisan test`: **143 lulus, 1 gagal** (lihat §7) |

---

## 2. Fitur Publik (tanpa login)

| Fitur | Route lama | Controller | Halaman lama | Frontend baru | API v1 |
|---|---|---|---|---|---|
| Landing page | `GET /` | `HomeController@index` | `welcome` | `/` | `GET /landing` |
| Halaman produk pernikahan | `GET /undangan/pernikahan` | `HomeController@wedding` | `wedding/index` | `/undangan/pernikahan` | `GET /landing/wedding` |
| Katalog tema | `GET /themes?event_type=` | closure `web.php` | `themes/index` | `/themes` | `GET /themes` |
| Contoh undangan per tema | `GET /themes/{slug}/sample` | `InvitationPublicController@sample` | `invitation/show` | `/themes/:theme/sample` | `GET /themes/{slug}/sample` |
| Viewer undangan | `GET /{code}` | `InvitationPublicController@show` | `invitation/show` | `/:code` | `GET /invitations/{code}` |
| Viewer + nama tamu | `GET /{code}/{visitor}`, `?tamu=` | idem | idem | `/:code/:visitor` | `GET /invitations/{code}/{visitor}` |
| RSVP | `POST /api/inv/{code}/rsvp` | `InvitationPublicApiController@rsvp` | (tema) | — | `POST /invitations/{code}/rsvp` (+ alias lama tetap) |
| Ucapan / buku tamu digital | `GET/POST /api/inv/{code}/wishes` | `@wishes`, `@submitWish` | (tema) | — | `GET/POST /invitations/{code}/wishes` (+ alias lama) |
| OG / share preview WhatsApp | `app.blade.php` (meta server-side) | — | — | dirender crawler-renderer | `GET /seo/{path}` (HTML khusus bot) |
| Sitemap | `GET /sitemap.xml` | `SitemapController` | — | file statis `frontend/public/sitemap.xml` | — |
| Preview tema HTML statis | `GET /preview/themes/wedding/{theme}` | `WeddingThemePreviewController` | — | file statis `frontend/public/preview/themes/wedding/*` | — |

Sub-fitur di dalam viewer (semua dari props `invitation`, tanpa perubahan kontrak data):
countdown, Google Maps/OpenStreetMap embed & link, galeri, love story / life journey,
musik latar (custom/default per jenis acara), amplop digital & QRIS, rekening bank,
dress code, QR code tamu, favicon & judul per undangan, label "Contoh Undangan".

---

## 3. Autentikasi & Akun

| Fitur | Route lama | Halaman lama | Frontend baru | API v1 |
|---|---|---|---|---|
| Login (+ dev accounts saat `APP_DEBUG`) | `GET/POST /login` | `auth/login` | `/login` | `GET /auth/options`, `POST /auth/login` |
| Register | `GET/POST /register` | `auth/register` | `/register` | `POST /auth/register` |
| Logout | `POST /logout` | — | (menu user) | `POST /auth/logout` |
| User aktif | prop bersama `auth.user` | — | `AuthProvider` | `GET /auth/me` |
| Lupa password | `GET/POST /forgot-password` | `auth/forgot-password` | `/forgot-password` | `POST /auth/forgot-password` |
| Reset password | `GET /reset-password/{token}`, `POST /reset-password` | `auth/reset-password` | `/reset-password/:token` | `POST /auth/reset-password` (link email → frontend) |
| Verifikasi email | `GET /verify-email`, `GET /verify-email/{id}/{hash}`, `POST /email/verification-notification` | `auth/verify-email` | `/verify-email` | `POST /auth/email/verification-notification`; link bertanda tangan tetap di web backend lalu redirect ke frontend |
| Konfirmasi password | `GET/POST /confirm-password` | `auth/confirm-password` | `/confirm-password` | `POST /auth/confirm-password` |
| Login Google (OAuth) | `GET /auth/google/redirect`, `/callback` | tombol | tombol → redirect penuh ke backend | tetap rute **web** backend (butuh session), callback redirect ke frontend |
| Redirect pasca-login + onboarding (tema/paket dipilih sebelum login) | `ResolvesPostAuthRedirect`, `OnboardingContextResolver` | — | navigasi ke `redirect` dari respons | field `redirect` di respons login/register |
| Generic `/dashboard` → dashboard sesuai role | closure | — | `/dashboard` (guard frontend) | — |

Otorisasi: middleware `auth` + `area:admin|customer` (Spatie role `super_admin`, `admin`, `customer`).
User area lain diarahkan ke dashboard miliknya — dipertahankan (respons 403 JSON berisi `redirect`).

---

## 4. Area Customer

| Fitur | Route lama | Controller | Halaman lama | API v1 |
|---|---|---|---|---|
| Dashboard / onboarding pertama | `GET /customer` | `Customer\DashboardController@index` | `customer/dashboard`, `customer/onboarding` | `GET /customer` |
| Daftar undangan | `GET /customer/invitations` | `InvitationController@index` | `customer/invitations/index` | `GET /customer/invitations` |
| Wizard 1 — pilih jenis acara | `GET …/create` | `@create` | `customer/invitations/create` | `GET /customer/invitations/create` |
| Wizard 2 — pilih tema & paket | `GET …/create/theme` | `@selectTheme` | `customer/invitations/select-theme` | `GET /customer/invitations/create/theme` |
| Wizard 3 — isi detail | `GET …/create/detail` | `@createDetail` | `customer/invitations/create-detail` | `GET /customer/invitations/create/detail` |
| Simpan undangan baru | `POST /customer/invitations` | `@store` | — | `POST /customer/invitations` |
| Cek kode / slug / rekomendasi slug | `GET …/check-code`, `check-slug`, `slug-recommendations` | `@checkCode` dst. | (fetch) | idem di `/customer/invitations/…` |
| Editor undangan (detail, acara, galeri, love story, tema, tamu, komentar, pengaturan, amplop digital) | `GET …/{slug}/edit`, `/{slug}/detail`, `/{slug}/settings` | `@edit` | `customer/invitations/edit` (+ `components/invitations/invitation-editor.tsx`) | `GET /customer/invitations/{slug}/edit` (dan `/detail`, `/settings`) |
| Update konten | `PATCH …/{invitation}` | `@update` → `InvitationEditorService` | — | `PATCH /customer/invitations/{slug}` |
| Update pengaturan (salam pembuka, kode, musik, fitur) | `PATCH …/{slug}/settings` | `@updateSettings` | — | `PATCH /customer/invitations/{slug}/settings` |
| Upload musik | `POST …/{slug}/upload-music` | `@uploadMusic` | — | `POST /customer/invitations/{slug}/upload-music` |
| Ganti tema | `PATCH …/{invitation}/theme` | `@updateTheme` | — | `PATCH /customer/invitations/{slug}/theme` |
| Hapus undangan | `DELETE …/{invitation}` | `abort(501)` (belum diimplementasi) | — | tetap 501 (tidak diubah) |
| Detail undangan | `GET …/{invitation}` | closure (placeholder) | `customer/invitations/show` | statis (tanpa data) |
| Buku tamu (CRUD, filter, statistik) | `…/{invitation}/guests*` | `GuestBookController` | `customer/invitations/guest-book/index` | `/customer/invitations/{slug}/guests*` |
| Tampilan layar buku tamu (slider, background) | `PATCH …/guests/display-settings` | `@updateDisplaySettings` | — | idem |
| Operator check-in + scan QR | `GET …/guests/operator`, `POST …/scan`, `GET …/search`, `POST …/{guest}/manual-checkin` | `@operator` dst. | `customer/invitations/guest-book/operator` | idem |
| Ekspor tamu CSV / Excel / PDF | `GET …/guests/export/{csv,excel,pdf}` | `@export*` | (link unduh) | idem (link absolut ke API, cookie session) |
| Moderasi komentar | `…/{invitation}/comments*` | `CommentController` | `customer/invitations/comments/index` | idem |
| Dompet digital global | `/customer/digital-wallets*` | `DigitalWalletController` | `customer/digital-wallets/index` | idem |
| Dompet digital per undangan | `…/{invitation}/digital-wallets`, `/sync` | `@invitationWallets`, `@syncInvitationWallets` | `customer/digital-wallets/invitation-wallets` | idem |
| Pembayaran (Xendit / Midtrans / QRIS / transfer manual) | `GET/POST …/{invitation}/payment`, `POST …/payment/manual-proof` | `PaymentController` | `customer/invitations/payment` | idem; redirect ke gateway via field `location` |
| Halaman hasil bayar | `GET /customer/payments/{success,failed}` | `@success`, `@failed` | `customer/payments/*` | idem (URL redirect gateway menunjuk ke frontend) |
| Riwayat transaksi | `GET /customer/transactions`, `/{id}` | `TransactionController` | `customer/transactions/*` | idem |
| Profil customer | `GET/PATCH /customer/profile` | `ProfileController` | `customer/profile/index` | idem |
| Langganan / upgrade | `GET /customer/subscription`, `/upgrade` | closure (placeholder) | `customer/subscription/*` | statis |

---

## 5. Area Admin

| Fitur | Route lama | Controller | Halaman lama | API v1 |
|---|---|---|---|---|
| Dashboard admin | `GET /admin` | closure (placeholder) | `admin/dashboard` | statis |
| Daftar user + ringkasan | `GET /admin/users` | `Admin\UserController@index` | `admin/users/index` | `GET /admin/users` |
| Detail user (undangan, transaksi, log) | `GET /admin/users/{user}` | `@show` | `admin/users/show` | `GET /admin/users/{id}` |
| Admin / role / permission | `GET /admin/users/{admins,roles,permissions}` | closure (placeholder) | `admin/users/*` | statis |
| Daftar undangan / custom domain | `GET /admin/invitations`, `/custom-domains` | closure (placeholder) | `admin/invitations/*` | statis |
| Editor undangan milik customer | `GET/PATCH /admin/invitations/{id}`, `/settings`, `/theme`, `/upload-music`, `check-slug` | `Admin\InvitationController` | `admin/invitations/show` | idem |
| Jenis acara (CRUD + toggle) | `/admin/event-types*` | `EventTypeController` | `admin/event-types/index` | idem |
| Template/tema (CRUD, toggle, urutan drag-and-drop) | `/admin/themes*` | `Themes\ThemeController` | `admin/themes/index` | idem |
| Kategori tema | `GET /admin/themes/categories` | closure | `admin/themes/categories` | statis |
| Paket (halaman lama) | `GET /admin/packages` | closure | `admin/packages/index` | statis |
| Paket & fitur paket (CRUD) | `/admin/settings/packages*` dan alias `/settings/packages*` | `Settings\PackageController` | `admin/settings/packages`, `settings/packages` | idem (kedua prefix dipertahankan) |
| Transaksi: daftar, detail, approve/reject bukti | `/admin/transactions*` | `Transactions\TransactionController` | `admin/transactions/index` | idem |
| Verifikasi pembayaran | `GET /admin/transactions/payments` | `@payments` | `admin/transactions/payments` | idem |
| Refund | `GET /admin/transactions/refunds` | closure | `admin/transactions/refunds` | statis |
| Pengaturan pembayaran (gateway, metode, webhook, QRIS + test) | `/admin/settings/payment*` | `PaymentSettingController` | `admin/settings/payment` | idem |
| Pengaturan umum / WhatsApp / notifikasi | `/admin/settings/{general,whatsapp,notification}` | closure | `admin/settings/*` | statis |
| Testimoni | `GET /admin/content/testimonials` | closure | `admin/content/testimonials` | statis |
| Laporan platform / revenue | `/admin/reports/{platform,revenue}` | closure | `admin/reports/*` | statis |
| Log aktivitas | `GET /admin/reports/activity-logs` | `ActivityLogController` | `admin/reports/activity-logs` | idem |

"Statis" = halaman memang belum punya data backend di implementasi lama (hanya
`Inertia::render` tanpa props). Halaman tetap dipindahkan apa adanya; tidak dibuat
data dummy.

## 6. Pengaturan (semua user login)

| Fitur | Route lama | Halaman lama | API v1 |
|---|---|---|---|
| Profil (nama/email), hapus akun | `GET/PATCH/DELETE /settings/profile` | `settings/profile` | idem |
| Ganti password | `GET/PUT /settings/password` | `settings/password` | idem |
| Tampilan (light/dark) | `GET /settings/appearance` | `settings/appearance` | statis (localStorage) |
| Pengaturan aplikasi + logo/favicon (admin) | `/settings/app*` | `settings/app` | idem |
| Pembayaran (admin, halaman lama) | `GET /settings/payment` | `settings/payment` | statis |

---

## 7. Template Undangan

Renderer dipilih berdasarkan `themes.slug` oleh `resolveThemeComponent()` di
`pages/invitation/show.tsx`.

| Jenis | Komponen React aktif | Alias slug yang ikut didukung | Folder desain HTML belum dikonversi |
|---|---|---|---|
| Wedding | `blossom-garden` (WeddingBase), `wedding_theme_01` … `wedding_theme_16` (17) | `wedding`, `blossom-garden`, `rustic-charm`, `them1`, `wedding-theme-NN`, `ambra-tika`, `undangan-ambra-tika`, `johan-joana`, `johan-joana-09` | — |
| Birthday | `BirthdayStarryNight`, `birthday_theme_01` … `birthday_theme_11` (12) | `birthday`, `starry-night`, `birthday-theme-NN` | — |
| Aqiqah | `aqiqah_theme_01` … `aqiqah_theme_14` (14) | `aqiqah-theme-NN` | `aqiqah/prom` (file mentah) |
| Gender reveal | `gender_reveal_theme_01` … `_03` (3) | `gender-reveal-theme-01/02` | `gender_reveal_theme_04` … `_13` (HTML) |
| Khitanan | `khitanan_theme_01`, `_02` (2) | `khitanan-theme-NN` | `khitanan_theme_03` … `_12` (HTML) |
| Syukuran | `syukuran_theme_01`, `_02` (2) | `syukuran-theme-NN` | — |

Total **50 renderer React**. Seeder membuat 20 slug per jenis; slug tanpa renderer
menampilkan fallback "Tema … sedang dalam pengembangan" (perilaku lama, dipertahankan).

Ketergantungan tema (diverifikasi): `@/types/invitation`, `@/components/invitation/{Countdown,DigitalWalletSection,GallerySection,GuestQrCode,MusicPlayer,RSVPForm,Toast,WishesSection}`,
CSS per tema, aset lokal (gambar/font/audio/obj/mtl), `three`, `@react-three/fiber`, `gsap`.
Tema 10/11 birthday & wedding 5/6/7 memanggil `rsvpEndpoint`/`wishesEndpoint` langsung —
URL ini absolut dari backend, jadi kompatibel lintas origin selama endpoint publik
bersifat stateless + CORS.

Sumber/aset terkait di luar folder tema:
- `resources/views/themes/weddingThemes/{bahagia-wedding,them1,wedding_theme_14,15,16}` — tema HTML statis (preview) + source Vite asli.
- `resources/views/themes/birthdayThemes/birthday_theme_{10,11}` — source & dist Vite asli (bahan port React).
- `public/images/theme-covers/*.svg` — sampul dibuat `php artisan themes:covers` (backend).
- `public/audio/*` — musik default per jenis acara (URL dibuat backend `InvitationMusic`).

Pratinjau di editor: tab "Tema" memakai `sample_url` (contoh undangan) — tidak merender tema langsung.

---

## 8. Titik Kopling Frontend ↔ Laravel yang Harus Diputus

| # | Kopling | Lokasi | Rencana |
|---|---|---|---|
| 1 | Rendering halaman via Inertia (`Inertia::render`) | 39 controller method + 19 closure route | Controller mengembalikan JSON `{success, data}`; closure tanpa data dihapus (halaman statis di frontend) |
| 2 | Root view `app.blade.php`, `@routes`, `@vite`, SSR | `resources/views`, `ssr.jsx` | Dihapus; frontend punya `index.html` sendiri |
| 3 | Shared props (`auth.user`, `flash`, `name`, `quote`, `ziggy`) | `HandleInertiaRequests` | `GET /auth/me`, `GET /app/config`, flash dari field `message` respons |
| 4 | `redirect()/back()->with()` + error bag session | ±100 titik di controller | Respons JSON: `message`, `redirect` (path frontend), 422 `errors` |
| 5 | `Inertia::location()` ke gateway | `PaymentController` | Field `location` → `window.location` |
| 6 | Ziggy `route()` global | 96 panggilan | `route()` frontend dengan manifest nama → path (URL lama dipertahankan) |
| 7 | `fetch`/`axios` ke URL relatif | 21 titik | API client terpusat (`credentials: include`, XSRF) |
| 8 | `Theme::rendererSlugs()` membaca folder `resources/js/…/themes` | `app/Models/Theme.php` (dipakai seeder) | Daftar renderer dipindah ke `config/themes.php` |
| 9 | URL publik dibangun dengan `url()`/`route()` backend (preview, redirect gateway, OAuth, reset password, `sample_url`, onboarding) | lihat `grep route(` | Helper `FrontendUrl` berbasis `FRONTEND_URL` |
| 10 | Meta OG server-side untuk WhatsApp | `app.blade.php` | Endpoint crawler `GET /seo/{path}` + aturan Nginx berbasis User-Agent |
| 11 | Error page Inertia (404/403/410/500/503) | `bootstrap/app.php` | JSON error envelope + halaman `error` di frontend |
| 12 | Halaman 404/500 debug detail (`APP_DEBUG`) | `bootstrap/app.php` | Field `debug` di respons JSON 500 saat debug |
| 13 | Preview tema HTML statis dilayani controller | `WeddingThemePreviewController` | Dipindah ke `frontend/public/preview/…` |

---

## 9. Temuan Risiko & Kualitas (dari audit)

| Tingkat | Temuan | Tindakan |
|---|---|---|
| **Tinggi** | `GET /test-invitation` (routes/test.php) membuat record `invitations` **tanpa autentikasi** | Route dihapus |
| Sedang | `GET /tess` menyajikan halaman uji statis | Route dihapus; file dipertahankan sebagai referensi desain |
| Sedang | `public/Archive.zip` (16 MB, arsip build + `.htaccess`) dapat diunduh publik | Dicatat; direkomendasikan dihapus manual |
| Sedang | `public/build` (output Vite lama) ter-commit | Dihapus pada fase cleanup (frontend build kini di `frontend/dist`) |
| Rendah | File SQLite `laravel` dan `get_error.php`/`get_top.php` di root repo (tidak web-accessible) | Dicatat, tidak diubah |
| Rendah | Viewer publik tidak memfilter `status = active` (draft bisa dilihat via link), API RSVP/wishes memfilter | Perilaku dipertahankan (bukan bagian migrasi) |
| Info | Test `ProfileUpdateTest › user can delete their account` sudah gagal sebelum migrasi (User memakai SoftDeletes) | Dicatat sebagai pre-existing |
| Info | Flash `info` dikirim controller tapi tidak pernah dibagikan Inertia | Kini ikut dikirim sebagai `message_type: info` |

---

## 10. Rencana Migrasi (urutan kerja)

1. **API preparation** — install Sanctum, `routes/api/v1/*.php` dengan prefix `/api/v1`, helper respons JSON, `FrontendUrl`, konversi seluruh controller, error handler JSON, CORS, crawler-renderer SEO. Webhook `/api/webhooks/*` dan alias `/api/inv/*` dipertahankan.
2. **Frontend scaffold** — Vite + React 19 + TypeScript + Tailwind 4 + React Router 7 di `frontend/`.
3. **Pemindahan kode** — `resources/js/{components,hooks,layouts,lib,pages,types}` → `frontend/src/…`; tema → `frontend/src/features/invitation/themes`; CSS → `frontend/src/assets/css`.
4. **Lapisan navigasi** — `@/lib/navigation` (`Link`, `Head`, `router`, `usePage`, `useForm`) di atas React Router + API client, sehingga kode halaman & desain tidak perlu ditulis ulang.
5. **Routing, auth, guard role** — route table, `AuthProvider`, `RequireAuth`/`GuestOnly`/area guard, error boundary, progress bar.
6. **Ganti semua `fetch` relatif** ke API client.
7. **Cleanup** — hapus Inertia/Ziggy (composer & npm), `HandleInertiaRequests`, `app.blade.php`, `ssr.jsx`, `resources/js`, `resources/css`, `public/build`, route web UI.
8. **Testing** — update test Pest ke asersi JSON, `npm run build`, `tsc`, uji endpoint utama.
9. **Dokumentasi** — ARCHITECTURE, API_DOCUMENTATION, MIGRATION_REPORT, DEPLOYMENT.
