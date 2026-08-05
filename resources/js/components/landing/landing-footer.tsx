import { type LandingContact } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import LandingLogo from './landing-logo';

interface LandingFooterProps {
    contact: LandingContact;
    appName: string;
}

const QUICK_LINKS = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'Paket', href: '#paket' },
    { label: 'Testimoni', href: '#testimoni' },
];

const SERVICES = [
    'Undangan Website',
    'RSVP & Buku Tamu Digital',
    'Amplop Digital / QRIS',
    'Live Streaming',
    'Domain Kustom',
    'Konsultasi Gratis via WhatsApp',
];

export default function LandingFooter({ contact, appName }: LandingFooterProps) {
    const handleAnchorClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <LandingLogo variant="dark" className="mb-6" />
                        <p className="mb-6 leading-relaxed text-gray-300">
                            Solusi undangan digital modern dan eksklusif untuk momen spesial Anda. Desain elegan dengan fitur lengkap.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href={contact.whatsapp_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="WhatsApp"
                                className="rounded-full bg-green-600 p-3 text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg"
                            >
                                <Phone className="size-5" />
                            </a>
                            <a
                                href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-3 text-white shadow-md transition-all hover:from-pink-600 hover:to-purple-700 hover:shadow-lg"
                            >
                                <Instagram className="size-5" />
                            </a>
                            <a
                                href={`https://facebook.com/${encodeURIComponent(contact.facebook)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="rounded-full bg-blue-600 p-3 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                            >
                                <Facebook className="size-5" />
                            </a>
                            <a
                                href={`mailto:${contact.email}`}
                                aria-label="Email"
                                className="rounded-full bg-gray-600 p-3 text-white shadow-md transition-all hover:bg-gray-700 hover:shadow-lg"
                            >
                                <Mail className="size-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 font-serif text-xl font-bold text-rose-300">Tautan Cepat</h3>
                        <nav className="space-y-3">
                            {QUICK_LINKS.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => handleAnchorClick(e, item.href)}
                                    className="block text-gray-300 transition-colors hover:text-rose-300"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <Link href={route('themes.index')} className="block text-gray-300 transition-colors hover:text-rose-300">
                                Semua Tema
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <h3 className="mb-6 font-serif text-xl font-bold text-rose-300">Layanan Kami</h3>
                        <div className="space-y-3">
                            {SERVICES.map((service) => (
                                <div key={service} className="text-gray-300">
                                    {service}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-6 font-serif text-xl font-bold text-rose-300">Hubungi Kami</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-1 size-5 shrink-0 text-rose-400" />
                                <div className="text-gray-300">
                                    <div className="font-medium">Alamat</div>
                                    <div className="text-sm">Jakarta, Indonesia</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="mt-1 size-5 shrink-0 text-rose-400" />
                                <div className="text-gray-300">
                                    <div className="font-medium">WhatsApp</div>
                                    <a
                                        href={contact.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm transition-colors hover:text-rose-300"
                                    >
                                        {contact.whatsapp}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="mt-1 size-5 shrink-0 text-rose-400" />
                                <div className="text-gray-300">
                                    <div className="font-medium">Email</div>
                                    <a href={`mailto:${contact.email}`} className="text-sm transition-colors hover:text-rose-300">
                                        {contact.email}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <a
                            href={contact.whatsapp_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 block rounded-full bg-gradient-to-r from-rose-500 to-rose-400 py-3 text-center font-medium text-white shadow-md transition-all hover:from-rose-600 hover:to-rose-500 hover:shadow-lg"
                        >
                            Konsultasi Gratis
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
                    <span className="text-sm text-gray-400">
                        © {new Date().getFullYear()} {appName} – Semua Hak Dilindungi
                    </span>
                    <span className="text-sm text-gray-400">Dibuat dengan ♡ di Indonesia</span>
                </div>
            </div>
        </footer>
    );
}
