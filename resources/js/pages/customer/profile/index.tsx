import AppearanceTabs from '@/components/appearance-tabs';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Profil Saya', href: '/customer/profile' },
];

interface Profile {
    name: string;
    email: string;
    phone_number: string | null;
    bio: string | null;
    language: string;
    timezone: string;
    notify_email: boolean;
    notify_whatsapp: boolean;
    photo_url: string | null;
    has_custom_photo: boolean;
    email_verified: boolean;
    member_since: string | null;
    invitations: number;
    transactions: number;
}

const LANGUAGES = [
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'en', label: 'English' },
];

const TIMEZONES = [
    { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
    { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
    { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' },
];

const cardClass = 'bg-card rounded-2xl border border-border/60 p-6 shadow-sm';

export default function ProfileIndex({ profile }: { profile: Profile }) {
    const getInitials = useInitials();
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful, transform } = useForm<{
        name: string;
        email: string;
        phone_number: string;
        bio: string;
        language: string;
        timezone: string;
        notify_email: boolean;
        notify_whatsapp: boolean;
        photo: File | null;
        remove_photo: boolean;
    }>({
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number ?? '',
        bio: profile.bio ?? '',
        language: profile.language,
        timezone: profile.timezone,
        notify_email: profile.notify_email,
        notify_whatsapp: profile.notify_whatsapp,
        photo: null,
        remove_photo: false,
    });

    transform((d) => ({ ...d, _method: 'patch' }));

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const shownPhoto = data.remove_photo ? null : (preview ?? profile.photo_url);

    const pickPhoto = (file: File | undefined) => {
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
    };

    const removePhoto = () => {
        setPreview(null);
        if (fileInput.current) fileInput.current.value = '';
        setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/customer/profile', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreview(null);
                setData((prev) => ({ ...prev, photo: null, remove_photo: false }));
                if (fileInput.current) fileInput.current.value = '';
            },
        });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Saya" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profil Saya</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Kelola informasi akun Anda.</p>
                </div>

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <div className={`${cardClass} flex flex-col items-center gap-4 text-center`}>
                            <Avatar className="h-28 w-28">
                                <AvatarImage src={shownPhoto ?? undefined} alt={data.name} className="object-cover" />
                                <AvatarFallback className="bg-neutral-200 text-3xl text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(data.name || profile.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="text-foreground text-lg font-semibold">{profile.name}</p>
                                <p className="text-muted-foreground text-sm break-all">{profile.email}</p>
                                <p className={`mt-1 text-xs ${profile.email_verified ? 'text-green-600' : 'text-amber-600'}`}>
                                    {profile.email_verified ? 'Email terverifikasi' : 'Email belum terverifikasi'}
                                </p>
                            </div>

                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => pickPhoto(e.target.files?.[0])}
                            />
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                                    Ganti Foto
                                </Button>
                                {shownPhoto && (data.photo || profile.has_custom_photo) && (
                                    <Button type="button" variant="ghost" size="sm" onClick={removePhoto}>
                                        Hapus
                                    </Button>
                                )}
                            </div>
                            <p className="text-muted-foreground text-xs">JPG, PNG, atau WebP. Maksimal 2 MB.</p>
                            <InputError message={errors.photo} />
                        </div>

                        <div className={cardClass}>
                            <h2 className="text-foreground mb-4 text-sm font-semibold">Ringkasan Akun</h2>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Anggota sejak</dt>
                                    <dd className="text-foreground font-medium">{profile.member_since ?? '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Total undangan</dt>
                                    <dd className="text-foreground font-medium">{profile.invitations}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Total transaksi</dt>
                                    <dd className="text-foreground font-medium">{profile.transactions}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <div className={cardClass}>
                            <h2 className="text-foreground mb-4 text-base font-semibold">Informasi Pribadi</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama lengkap</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoComplete="name" />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="phone_number">Nomor telepon / WhatsApp</Label>
                                    <Input
                                        id="phone_number"
                                        type="tel"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        placeholder="08123456789"
                                        autoComplete="tel"
                                    />
                                    <InputError message={errors.phone_number} />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea
                                        id="bio"
                                        rows={3}
                                        maxLength={500}
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                        placeholder="Ceritakan sedikit tentang Anda"
                                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                    <InputError message={errors.bio} />
                                </div>
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h2 className="text-foreground mb-4 text-base font-semibold">Preferensi</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Bahasa</Label>
                                    <Select value={data.language} onValueChange={(v) => setData('language', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>
                                                    {l.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.language} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Zona waktu</Label>
                                    <Select value={data.timezone} onValueChange={(v) => setData('timezone', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIMEZONES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.timezone} />
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <p className="text-foreground text-sm font-medium">Notifikasi</p>
                                <label className="flex items-center gap-3 text-sm">
                                    <Checkbox checked={data.notify_email} onCheckedChange={(v) => setData('notify_email', v === true)} />
                                    Terima notifikasi lewat email
                                </label>
                                <label className="flex items-center gap-3 text-sm">
                                    <Checkbox checked={data.notify_whatsapp} onCheckedChange={(v) => setData('notify_whatsapp', v === true)} />
                                    Terima notifikasi lewat WhatsApp
                                </label>
                            </div>
                        </div>

                        <div className={cardClass}>
                            <h2 className="text-foreground mb-1 text-base font-semibold">Tampilan</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Atur mode tampilan terang atau gelap untuk akun Anda.</p>
                            <AppearanceTabs />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Profil berhasil disimpan.</p>
                            </Transition>
                        </div>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}
