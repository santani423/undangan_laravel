import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LandingPackageByType } from '@/types/landing';
import { Check, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';

interface LandingPackagesProps {
    packagesByType: LandingPackageByType[];
    whatsappLink: string;
    onSelectPackage: (packageId: number) => void;
}

function formatRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
}

export default function LandingPackages({ packagesByType, whatsappLink, onSelectPackage }: LandingPackagesProps) {
    const [activeType, setActiveType] = useState(packagesByType[0]?.event_type ?? '');

    if (packagesByType.length === 0) {
        return null;
    }

    const active = packagesByType.find((t) => t.event_type === activeType) ?? packagesByType[0];
    const askMessage = 'Halo, saya ingin tanya-tanya dulu soal paket undangan Undesia.';
    const askHref = `${whatsappLink}?text=${encodeURIComponent(askMessage)}`;

    return (
        <section id="paket" className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                        Paket Undangan
                        <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Pilih yang Sesuai Kebutuhan Anda</span>
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                </div>

                {/* Jenis undangan tabs */}
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    {packagesByType.map((group) => (
                        <button
                            key={group.event_type}
                            type="button"
                            onClick={() => setActiveType(group.event_type)}
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                active.event_type === group.event_type
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-md'
                                    : 'bg-white text-gray-600 shadow-sm hover:bg-rose-50 hover:text-rose-600'
                            }`}
                        >
                            {group.label}
                        </button>
                    ))}
                </div>

                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
                    {active.packages.map((pkg) => (
                        <Card
                            key={pkg.id}
                            className={`relative overflow-hidden border-0 text-gray-800 transition-all duration-500 hover:-translate-y-2 ${
                                pkg.is_popular
                                    ? 'bg-gradient-to-br from-white via-rose-50 to-pink-50 shadow-2xl md:scale-105'
                                    : 'bg-white shadow-lg hover:shadow-2xl'
                            }`}
                        >
                            {pkg.is_popular && (
                                <div className="absolute top-0 right-0 z-10">
                                    <Badge className="rounded-none rounded-bl-lg border-transparent bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-white shadow-md">
                                        <Star className="mr-1 size-4" />
                                        Terpopuler
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="pb-4 text-center">
                                <CardTitle className="mb-2 font-serif text-2xl font-bold text-gray-800">{pkg.tier_label}</CardTitle>
                                <div className="mb-2">
                                    {pkg.price === 0 ? (
                                        <div className="bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-4xl font-bold text-transparent">
                                            Gratis
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-4xl font-bold text-transparent">
                                            {formatRupiah(pkg.price)}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="mb-8 space-y-3">
                                    {pkg.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-rose-500">
                                                <Check className="size-3 text-white" />
                                            </div>
                                            <span className="text-sm leading-relaxed text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onSelectPackage(pkg.id)}
                                    className={`block w-full rounded-full py-3 text-center font-medium shadow-lg transition-all duration-300 hover:shadow-xl ${
                                        pkg.is_popular
                                            ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white hover:from-rose-600 hover:to-rose-500'
                                            : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-800 hover:to-gray-700'
                                    }`}
                                >
                                    Pilih {pkg.tier_label}
                                </button>
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
