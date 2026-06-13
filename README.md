# UNDESIA — Platform Undangan Digital

Platform undangan digital berbasis web yang dibangun dengan **Laravel 12** + **React 19** + **Inertia.js**. Mendukung manajemen undangan pernikahan/acara, sistem paket berlangganan, RSVP tamu, pembayaran digital, dan dashboard admin lengkap.

---

## Daftar Isi

- [Stack Teknologi](#stack-teknologi)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Direktori](#struktur-direktori)
- [Fitur Utama](#fitur-utama)
- [Modul Admin](#modul-admin)
- [Sistem Paket & Harga](#sistem-paket--harga)
- [Sistem Pembayaran](#sistem-pembayaran)
- [Autentikasi & Otorisasi](#autentikasi--otorisasi)
- [Database](#database)
- [Frontend — Panduan Penggunaan Template](#frontend--panduan-penggunaan-template)
- [Komponen UI](#komponen-ui)
- [Pengujian](#pengujian)
- [Build Produksi](#build-produksi)
- [Perintah Artisan Berguna](#perintah-artisan-berguna)

---

## Stack Teknologi

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Backend | Laravel | 12.x |
| Runtime PHP | PHP | ≥ 8.2 |
| Frontend | React + TypeScript | 19.x / 5.7 |
| Server-Driven UI | Inertia.js | 2.0 |
| CSS | Tailwind CSS | 4.0 |
| Build Tool | Vite | 6.0 |
| RBAC | Spatie Laravel Permission | 8.0 |
| Route Helpers | Ziggy | 2.4 |
| UI Primitives | Radix UI | berbagai versi |
| Icon | Lucide React | 0.475 |
| Database (dev) | SQLite | — |
| Testing PHP | Pest | 3.8 |

---

## Persyaratan Sistem

- PHP ≥ 8.2 dengan ekstensi: `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- Composer ≥ 2.x
- Node.js ≥ 20.x
- npm ≥ 10.x

---

## Instalasi & Setup

```bash
# 1. Clone repository
git clone <repo-url> undesia
cd undesia

# 2. Install dependensi PHP
composer install

# 3. Install dependensi Node.js
npm install

# 4. Salin file environment
cp .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Buat file database SQLite
touch database/database.sqlite   # Linux/Mac
New-Item database/database.sqlite # Windows PowerShell

# 7. Jalankan migrasi + seeder
php artisan migrate --seed
```

---

## Konfigurasi Environment

Edit file `.env` sesuai kebutuhan:

```env
APP_NAME="Undesia"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite untuk development)
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

# Database (MySQL untuk production)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=undesia
# DB_USERNAME=root
# DB_PASSWORD=

# Queue & Cache (database untuk development)
QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="noreply@undesia.id"
MAIL_FROM_NAME="${APP_NAME}"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# WhatsApp (opsional)
WA_API_URL=
WA_API_TOKEN=
```

---

## Menjalankan Aplikasi

### Mode Development (semua service sekaligus)

```bash
composer dev
```

Perintah ini menjalankan secara bersamaan:
- `php artisan serve` — Web server di `http://localhost:8000`
- `php artisan queue:listen` — Queue worker
- `npm run dev` — Vite HMR dev server

### Menjalankan terpisah

```bash
# Terminal 1: Backend
php artisan serve

# Terminal 2: Frontend (Vite HMR)
npm run dev

# Terminal 3: Queue worker
php artisan queue:listen --tries=1
```

### Akses Aplikasi

| URL | Keterangan |
|-----|-----------|
| `http://localhost:8000` | Halaman publik |
| `http://localhost:8000/login` | Login pengguna |
| `http://localhost:8000/register` | Registrasi |
| `http://localhost:8000/dashboard` | Dashboard pengguna |
| `http://localhost:8000/admin` | Dashboard super admin |

### Akun Default (setelah `db:seed`)

Akun dibuat oleh `AdminUserSeeder`. Cek file `database/seeders/AdminUserSeeder.php` untuk email/password default, atau buat akun baru via `/register` lalu assign role admin:

```bash
php artisan tinker
# Di dalam tinker:
$user = App\Models\User::where('email', 'admin@example.com')->first();
$user->assignRole('super-admin');
```

---

## Struktur Direktori

```
undesia/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── Settings/PackageController.php
│   │   │   │   └── Themes/ThemeController.php
│   │   │   ├── Auth/                    # Login, Register, Password Reset
│   │   │   └── Settings/                # Profile, Password, AppSetting
│   │   └── Middleware/
│   ├── Models/                          # 40+ Eloquent models
│   └── Providers/
├── database/
│   ├── migrations/                      # 47 migration files
│   └── seeders/                         # 9 seeder files
├── resources/
│   └── js/
│       ├── components/                  # Komponen React reusable
│       │   ├── ui/                      # Primitif UI (Button, Input, dll)
│       │   └── settings/                # Komponen settings khusus
│       ├── layouts/                     # Layout wrapper
│       │   ├── app/                     # Layout utama (dengan sidebar)
│       │   ├── auth/                    # Layout halaman auth
│       │   └── settings/               # Layout settings
│       ├── pages/                       # Halaman Inertia (React)
│       │   ├── admin/                   # Semua halaman admin
│       │   ├── auth/                    # Login, Register, dll
│       │   ├── settings/               # Settings pengguna
│       │   └── themes/                 # Halaman publik tema
│       ├── hooks/                       # Custom React hooks
│       ├── lib/                         # Utility functions
│       └── types/                       # TypeScript type definitions
├── routes/
│   ├── web.php                          # Route publik
│   ├── admin.php                        # Route admin (prefix /admin)
│   ├── auth.php                         # Route autentikasi
│   └── settings.php                     # Route pengaturan pengguna
└── tests/
    ├── Feature/
    └── Unit/
```

---

## Fitur Utama

### Untuk Pengguna (Pembuat Undangan)
- Membuat undangan digital dengan berbagai template/tema
- Mengelola daftar tamu (guest list)
- RSVP digital dengan konfirmasi kehadiran
- Buku tamu (guestbook) digital
- Countdown timer acara
- Google Maps embed lokasi acara
- Galeri foto acara
- Musik latar
- Kode QR undangan personal per tamu
- Amplop digital (transfer bank & QRIS)
- Gift wishlist
- Gender poll / prediksi kelahiran
- Mini games interaktif
- Live streaming integration
- Instagram AR filter
- Dress code information
- WhatsApp reminder ke tamu
- Custom domain

### Untuk Admin Platform
- Dashboard analitik platform
- Manajemen pengguna, admin, role & permission
- Manajemen undangan & custom domain
- Manajemen template/tema
- Manajemen paket & harga
- Laporan transaksi & pendapatan
- Log aktivitas sistem
- Konfigurasi payment gateway
- Pengaturan notifikasi WhatsApp

---

## Modul Admin

Semua route admin menggunakan prefix `/admin` dan memerlukan autentikasi + role yang sesuai.

### Struktur Menu Admin

```
/admin                          Dashboard
├── /admin/users
│   ├── /users                  Daftar Pengguna
│   ├── /admins                 Daftar Admin
│   ├── /roles                  Manajemen Role
│   └── /permissions            Manajemen Permission
├── /admin/invitations
│   ├── /invitations            Daftar Undangan
│   └── /custom-domains         Custom Domain
├── /admin/event-types          Tipe Acara
├── /admin/themes
│   ├── /themes                 Daftar Tema
│   └── /themes/categories      Kategori Tema
├── /admin/packages             Paket Layanan
├── /admin/transactions
│   ├── /transactions           Semua Transaksi
│   ├── /payments               Detail Pembayaran
│   └── /refunds                Refund
├── /admin/content
│   └── /testimonials           Testimoni
├── /admin/reports
│   ├── /platform               Laporan Platform
│   ├── /revenue                Laporan Pendapatan
│   └── /activity-logs          Log Aktivitas
└── /admin/settings
    ├── /general                Pengaturan Umum
    ├── /packages               Paket & Harga
    ├── /payment                Payment Gateway
    ├── /whatsapp               Konfigurasi WhatsApp
    └── /notification           Pengaturan Notifikasi
```

---

## Sistem Paket & Harga

Platform menggunakan tiga tier paket dengan fitur berbeda:

### Tier Paket

| Fitur | Basic | Premium | Exclusive |
|-------|:-----:|:-------:|:---------:|
| Tamu tidak terbatas | ✓ | ✓ | ✓ |
| Buku Tamu Digital | ✓ | ✓ | ✓ |
| RSVP Lengkap | ✓ | ✓ | ✓ |
| Countdown Timer | ✓ | ✓ | ✓ |
| Google Maps | ✓ | ✓ | ✓ |
| QR Code Undangan | ✓ | ✓ | ✓ |
| Musik Latar | — | ✓ | ✓ |
| Dress Code Info | — | ✓ | ✓ |
| Gender Poll | — | ✓ | ✓ |
| Mini Games | — | ✓ | ✓ |
| Semua Template | — | ✓ | ✓ |
| Custom Domain | — | ✓ | ✓ |
| WhatsApp Reminder | — | ✓ | ✓ |
| Amplop Digital | — | ✓ | ✓ |
| Gift Wishlist | — | ✓ | ✓ |
| Live Streaming | — | — | ✓ |
| Template Eksklusif | — | — | ✓ |
| Custom CSS | — | — | ✓ |
| Page Builder | — | — | ✓ |
| Custom Branding | — | — | ✓ |
| Instagram AR Filter | — | — | ✓ |
| API Access | — | — | ✓ |
| Account Manager | — | — | ✓ |

### Batas Penggunaan

| Resource | Basic | Premium | Exclusive |
|----------|:-----:|:-------:|:---------:|
| Upload Galeri | 10 foto | 50 foto | ∞ |
| Video | 0 | 5 | ∞ |
| Storage | 50 MB | 500 MB | 2 GB |
| WA Blast/hari | 0 | 200 | 1.000 |
| Custom Domain | 0 | 1 | 3 |

### Alur Trial

```
Pilih Paket → Trial Aktif (akses penuh gratis) → Bayar → Masa Aktif Berjalan → [Perpanjang / Akses Berakhir]
```

- **trial_days**: Jumlah hari akses gratis sebelum perlu membayar (0 = langsung bayar)
- **duration_days**: Masa aktif paket setelah pembayaran dikonfirmasi

### Mengelola Paket (Admin)

Buka `/admin/settings/packages`. Tersedia 4 tab:

1. **Daftar Paket** — Tambah/edit/hapus paket, toggle status aktif/nonaktif, atur urutan tampil
2. **Fitur Paket** — Matriks fitur per paket (Basic/Premium/Exclusive)
3. **Batas Penggunaan** — Tabel limit resource per paket
4. **Harga & Promo** — Ringkasan harga dan manajemen kode promo

---

## Sistem Pembayaran

Platform mendukung:

- **Transfer Bank** — Konfigurasi rekening bank di `/admin/settings/payment`
- **QRIS** — Konfigurasi QRIS account
- **Payment Gateway** — Integrasi Midtrans (konfigurasi via `.env` dan `/admin/settings/payment`)
- **Amplop Digital** — Fitur penerimaan hadiah uang langsung di halaman undangan

Seluruh transaksi tercatat di tabel `transactions` + `payments` dengan audit log di `payment_gateway_audit_logs`.

---

## Autentikasi & Otorisasi

### Autentikasi

Menggunakan Laravel Breeze dengan Inertia React. Route tersedia di:
- `GET /login` — Form login
- `POST /login` — Proses login
- `GET /register` — Form registrasi
- `POST /register` — Proses registrasi
- `GET /forgot-password` — Lupa password
- `POST /forgot-password` — Kirim link reset
- `GET /reset-password/{token}` — Form reset password

### Role & Permission (Spatie)

Role default yang di-seed:
- **super-admin** — Akses penuh ke seluruh platform
- **admin** — Akses admin terbatas
- **user** — Pengguna biasa (pembuat undangan)

Mengelola role & permission via:
- UI Admin: `/admin/users/roles` dan `/admin/users/permissions`
- Artisan Tinker:

```bash
php artisan tinker

# Buat role baru
$role = Spatie\Permission\Models\Role::create(['name' => 'editor']);

# Assign role ke user
$user = App\Models\User::find(1);
$user->assignRole('super-admin');

# Cek role
$user->hasRole('super-admin'); // true/false

# Assign permission ke role
$role->givePermissionTo('edit themes');
```

---

## Database

### Migrasi

```bash
# Jalankan semua migrasi
php artisan migrate

# Jalankan migrasi + seed
php artisan migrate --seed

# Rollback semua
php artisan migrate:reset

# Fresh + seed (hapus semua data)
php artisan migrate:fresh --seed
```

### Seeder yang Tersedia

| Seeder | Keterangan |
|--------|-----------|
| `AdminUserSeeder` | Membuat akun admin awal |
| `RolePermissionSeeder` | Setup role & permission Spatie |
| `EventTypeSeeder` | Tipe acara default (pernikahan, dll) |
| `EventTypeFieldSeeder` | Field kustom per tipe acara |
| `PackageSeeder` | Paket Basic, Premium, Exclusive |
| `ThemeSeeder` | Template undangan default |
| `PaymentGatewayConfigSeeder` | Konfigurasi payment gateway |
| `AppSettingSeeder` | Pengaturan platform default |

### Tabel Utama

```
users / user_profiles           — Akun pengguna
invitations                     — Undangan digital
invitation_events               — Acara dalam undangan
invitation_contents             — Konten/blok teks
guests / rsvps / comments       — Tamu & RSVP
themes / packages               — Template & paket
transactions / payments         — Keuangan
activity_logs / page_views      — Analitik
app_settings                    — Konfigurasi platform
```

---

## Frontend — Panduan Penggunaan Template

### Struktur Halaman (Inertia.js)

Setiap halaman adalah komponen React di `resources/js/pages/`. Halaman menerima props dari controller Laravel via Inertia:

```tsx
// Contoh: resources/js/pages/admin/packages/index.tsx
import { usePage } from '@inertiajs/react';

interface PageProps {
    packages: PackageData[];
    flash: { success?: string; error?: string };
}

export default function PackagesPage() {
    const { packages } = usePage<PageProps>().props;
    return <div>{/* render packages */}</div>;
}
```

### Membuat Halaman Baru

1. Buat file di `resources/js/pages/` sesuai struktur route
2. Gunakan layout yang sesuai:

```tsx
// Halaman admin
import AdminLayout from '@/layouts/admin-layout';

export default function MyAdminPage() {
    return (
        <AdminLayout breadcrumbs={[{ title: 'Halaman Saya', href: '/admin/my-page' }]}>
            <Head title="Halaman Saya" />
            {/* konten */}
        </AdminLayout>
    );
}

// Halaman settings
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings-layout';

export default function MySettingsPage() {
    return (
        <AppLayout>
            <SettingsLayout>
                {/* konten */}
            </SettingsLayout>
        </AppLayout>
    );
}

// Halaman auth
import AuthLayout from '@/layouts/auth/layout';

export default function MyAuthPage() {
    return (
        <AuthLayout title="Judul" description="Deskripsi">
            {/* form */}
        </AuthLayout>
    );
}
```

### Navigasi antar Halaman (Inertia)

```tsx
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Link biasa
<Link href={route('admin.dashboard')}>Dashboard</Link>

// Navigasi programatik
router.visit(route('admin.packages.index'));

// POST / PATCH / DELETE
router.post(route('admin.settings.packages.store'), formData);
router.patch(route('admin.settings.packages.update', { package: id }), formData);
router.delete(route('admin.settings.packages.destroy', { package: id }));
```

### Flash Messages

Controller Laravel mengirim flash message via session, halaman menerimanya melalui `usePage().props.flash`:

```tsx
// Di controller (PHP)
return redirect()->back()->with('success', 'Data berhasil disimpan!');
return redirect()->back()->with('error', 'Terjadi kesalahan.');

// Di React
const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
```

### Dark Mode / Tema

Gunakan hook `useAppearance`:

```tsx
import { useAppearance } from '@/hooks/use-appearance';

function MyComponent() {
    const { appearance, updateAppearance } = useAppearance();
    // appearance: 'light' | 'dark' | 'system'
}
```

---

## Komponen UI

Semua komponen UI tersedia di `resources/js/components/ui/`.

### Komponen Dasar

```tsx
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Badge }    from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
```

### Dialog / Modal

```tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

function MyModal() {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Judul Modal</DialogTitle>
                    <DialogDescription>Deskripsi modal</DialogDescription>
                </DialogHeader>
                {/* konten */}
                <DialogFooter>
                    <Button onClick={() => setOpen(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

### Dropdown Menu

```tsx
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Item 2</DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

### Select

```tsx
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
    <SelectTrigger>
        <SelectValue placeholder="Pilih opsi" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem value="option1">Opsi 1</SelectItem>
        <SelectItem value="option2">Opsi 2</SelectItem>
    </SelectContent>
</Select>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
    id="agree"
    checked={checked}
    onCheckedChange={(val) => setChecked(!!val)}
/>
<Label htmlFor="agree">Saya setuju</Label>
```

### Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
    <Tooltip>
        <TooltipTrigger asChild>
            <Button>Hover saya</Button>
        </TooltipTrigger>
        <TooltipContent>Ini tooltip!</TooltipContent>
    </Tooltip>
</TooltipProvider>
```

### Sheet (Drawer/Sidebar Panel)

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
    <SheetTrigger asChild>
        <Button>Buka Panel</Button>
    </SheetTrigger>
    <SheetContent side="right">
        <SheetHeader>
            <SheetTitle>Panel Kanan</SheetTitle>
        </SheetHeader>
        {/* konten panel */}
    </SheetContent>
</Sheet>
```

### Button Variants

```tsx
<Button>Default</Button>
<Button variant="destructive">Hapus</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Dengan size
<Button size="sm">Kecil</Button>
<Button size="lg">Besar</Button>
<Button size="icon"><IconName /></Button>
```

### Utility: cn()

Gunakan `cn()` dari `@/lib/utils` untuk menggabungkan class Tailwind secara kondisional:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
    'base-class another-class',
    isActive && 'bg-primary text-white',
    isDisabled && 'opacity-50 cursor-not-allowed',
)}>
```

### Ikon

Semua ikon dari `lucide-react`:

```tsx
import { Plus, Edit, Trash2, Save, X, ChevronDown } from 'lucide-react';

<Plus className="size-4" />
<Edit className="size-3.5 text-muted-foreground" />
```

---

## Custom React Hooks

```tsx
// Deteksi tampilan mobile
import { useIsMobile } from '@/hooks/use-mobile';
const isMobile = useIsMobile();

// Inisial nama user (untuk avatar)
import { useInitials } from '@/hooks/use-initials';
const getInitials = useInitials();
getInitials('Budi Santoso'); // → "BS"

// Pengaturan tema gelap/terang
import { useAppearance } from '@/hooks/use-appearance';
const { appearance, updateAppearance } = useAppearance();
```

---

## Pengujian

```bash
# Jalankan semua test
php artisan test

# Atau dengan Pest langsung
./vendor/bin/pest

# Test spesifik
./vendor/bin/pest tests/Feature/Auth

# Dengan coverage
./vendor/bin/pest --coverage
```

Test tersimpan di:
- `tests/Feature/` — Integration tests (HTTP, database)
- `tests/Unit/` — Unit tests (model, service)

---

## Build Produksi

```bash
# Build frontend untuk production
npm run build

# Build SSR (opsional)
npm run build:ssr

# Optimasi Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Jalankan migrasi di production
php artisan migrate --force
```

---

## Perintah Artisan Berguna

```bash
# Reset dan seed ulang database (development only!)
php artisan migrate:fresh --seed

# Buka REPL interaktif
php artisan tinker

# Monitor log secara real-time (Laravel Pail)
php artisan pail

# Bersihkan cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Jalankan queue worker
php artisan queue:listen
php artisan queue:work

# Generate Ziggy routes untuk frontend
php artisan ziggy:generate

# Linting PHP (Laravel Pint)
./vendor/bin/pint

# Format frontend
npm run format

# Lint frontend
npm run lint
```

---

## Kontribusi & Konvensi Kode

### PHP
- Ikuti PSR-12 (diatur oleh Laravel Pint)
- Jalankan `./vendor/bin/pint` sebelum commit

### TypeScript/React
- Komponen menggunakan PascalCase
- File pages menggunakan kebab-case
- Jalankan `npm run lint` dan `npm run format` sebelum commit

### Database
- Setiap perubahan skema harus melalui migration baru
- Jangan mengedit migration yang sudah di-commit

---

## Lisensi

MIT License — lihat file `LICENSE` untuk detail.
