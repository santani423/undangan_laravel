import { Card, CardContent } from '@/components/ui/card';
import { type LandingFeature } from '@/types/landing';
import { Link } from '@inertiajs/react';
import { BookOpen, Camera, Clock, Gift, Globe, MapPin, Music, Share2, Users, Video, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    Users,
    BookOpen,
    Clock,
    MapPin,
    Camera,
    Music,
    Share2,
    Video,
    Gift,
    Globe,
};

interface LandingFeaturesProps {
    features: LandingFeature[];
}

export default function LandingFeatures({ features }: LandingFeaturesProps) {
    return (
        <section id="fitur" className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                        Fitur Utama
                        <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Yang Membuat Undesia Istimewa</span>
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {features.map((feature) => {
                        const Icon = ICONS[feature.icon] ?? Users;

                        return (
                            <Card
                                key={feature.key}
                                className="group border-0 bg-gradient-to-br from-white to-rose-50/40 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                            >
                                <CardContent className="flex h-full flex-col justify-between p-6 text-center text-gray-800">
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                        <Icon className="size-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-serif text-lg leading-tight font-bold text-gray-800">{feature.title}</h3>
                                        <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <p className="mb-6 text-lg text-gray-600">Semua fitur ini tersedia dalam satu platform yang mudah digunakan</p>
                    <Link
                        href={route('themes.index')}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-400 px-8 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-rose-600 hover:to-rose-500 hover:shadow-xl"
                    >
                        Lihat Semua Tema
                    </Link>
                </div>
            </div>
        </section>
    );
}
