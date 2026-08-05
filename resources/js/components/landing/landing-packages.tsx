import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Auth } from '@/types';
import { type LandingPackageTier } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { Check, MessageCircle, Star } from 'lucide-react';

interface LandingPackagesProps {
    tiers: LandingPackageTier[];
    whatsappLink: string;
    auth: Auth;
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export default function LandingPackages({ tiers, whatsappLink, auth }: LandingPackagesProps) {
    if (tiers.length === 0) {
        return null;
    }

    const ctaHref = auth.user ? route('customer.invitations.create') : route('register');
    const askMessage = 'Halo, saya ingin tanya-tanya dulu soal paket undangan Undesia.';
    const askHref = `${whatsappLink}?text=${encodeURIComponent(askMessage)}`;

    return (
        <section id="paket" className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                        Paket Undangan
                        <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Pilih yang Sesuai Kebutuhan Anda</span>
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                </div>

                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.tier}
                            className={`relative overflow-hidden border-0 text-gray-800 transition-all duration-500 hover:-translate-y-2 ${
                                tier.is_popular
                                    ? 'bg-gradient-to-br from-white via-rose-50 to-pink-50 shadow-2xl md:scale-105'
                                    : 'bg-white shadow-lg hover:shadow-2xl'
                            }`}
                        >
                            {tier.is_popular && (
                                <div className="absolute top-0 right-0 z-10">
                                    <Badge className="rounded-none rounded-bl-lg border-transparent bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-white shadow-md">
                                        <Star className="mr-1 size-4" />
                                        Terpopuler
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-4 text-center">
                                <CardTitle className="mb-2 font-serif text-2xl font-bold text-gray-800">{tier.label}</CardTitle>
                                <div className="mb-2">
                                    <span className="text-sm text-gray-500">mulai dari</span>
                                    <div className="bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-4xl font-bold text-transparent">
                                        {formatRupiah(tier.price_from)}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="mb-8 space-y-3">
                                    {tier.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-rose-500">
                                                <Check className="size-3 text-white" />
                                            </div>
                                            <span className="text-sm leading-relaxed text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={ctaHref}
                                    className={`block w-full rounded-full py-3 text-center font-medium shadow-lg transition-all duration-300 hover:shadow-xl ${
                                        tier.is_popular
                                            ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white hover:from-rose-600 hover:to-rose-500'
                                            : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-800 hover:to-gray-700'
                                    }`}
                                >
                                    Pilih {tier.label}
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <a
                        href={askHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
                    >
                        <MessageCircle className="size-4" />
                        Tanya dulu via WhatsApp sebelum memesan
                    </a>
                </div>
            </div>
        </section>
    );
}
