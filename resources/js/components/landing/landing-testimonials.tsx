import { type LandingStats, type LandingTestimonial } from '@/types/landing';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LandingTestimonialsProps {
    testimonials: LandingTestimonial[];
    stats: LandingStats;
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function LandingTestimonials({ testimonials, stats }: LandingTestimonialsProps) {
    const [index, setIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);

    useEffect(() => {
        if (!autoplay || testimonials.length <= 1) {
            return;
        }
        const timer = setInterval(() => {
            setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [autoplay, testimonials.length]);

    const goTo = (i: number) => {
        setIndex(i);
        setAutoplay(false);
    };

    const statTiles = [
        { value: `${stats.invitations_created}+`, label: 'Undangan Dibuat' },
        { value: `${stats.themes_available}+`, label: 'Tema Tersedia' },
        { value: `${stats.event_types}`, label: 'Jenis Acara' },
        { value: '⚡', label: 'Respons Cepat via WhatsApp' },
    ];

    return (
        <section id="testimoni" className="bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="font-serif text-4xl font-bold text-gray-800 md:text-5xl">
                        Kata Mereka
                        <span className="mt-2 block text-2xl font-light text-rose-500 md:text-3xl">Tentang Undesia</span>
                    </h2>
                    <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
                </div>

                {testimonials.length > 0 && (
                    <div className="relative mx-auto max-w-4xl">
                        <div className="overflow-hidden rounded-3xl">
                            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="w-full shrink-0 px-2">
                                        <div className="rounded-3xl bg-white p-8 text-center shadow-xl md:p-12">
                                            <Quote className="mx-auto mb-6 size-10 text-rose-300" />
                                            <blockquote className="mb-8 text-lg leading-relaxed font-light text-gray-700 italic md:text-xl">
                                                “{testimonial.content}”
                                            </blockquote>
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-rose-500 text-lg font-bold text-white shadow-md">
                                                    {initials(testimonial.name)}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-serif text-lg font-bold text-gray-800">{testimonial.name}</h3>
                                                    {testimonial.event_type && (
                                                        <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-3 py-0.5 text-xs font-medium text-white">
                                                            {testimonial.event_type}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-center gap-1">
                                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                    <Star key={i} className="size-5 fill-rose-400 text-rose-400" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {testimonials.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => goTo(index === 0 ? testimonials.length - 1 : index - 1)}
                                    className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2 rounded-full bg-white p-3 text-gray-600 shadow-lg transition-all hover:scale-110 hover:text-rose-500 hover:shadow-xl sm:-translate-x-5"
                                    aria-label="Sebelumnya"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goTo(index === testimonials.length - 1 ? 0 : index + 1)}
                                    className="absolute top-1/2 right-0 translate-x-2 -translate-y-1/2 rounded-full bg-white p-3 text-gray-600 shadow-lg transition-all hover:scale-110 hover:text-rose-500 hover:shadow-xl sm:translate-x-5"
                                    aria-label="Selanjutnya"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                                <div className="mt-8 flex justify-center gap-2">
                                    {testimonials.map((testimonial, i) => (
                                        <button
                                            key={testimonial.id}
                                            type="button"
                                            onClick={() => goTo(i)}
                                            aria-label={`Ke testimoni ${i + 1}`}
                                            className={`h-3 rounded-full transition-all duration-200 ${
                                                i === index ? 'w-8 bg-gradient-to-r from-rose-400 to-rose-500' : 'w-3 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
                    {statTiles.map((tile) => (
                        <div key={tile.label} className="text-center">
                            <div className="mb-2 text-3xl font-bold text-rose-600 md:text-4xl">{tile.value}</div>
                            <div className="text-sm text-gray-600 md:text-base">{tile.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
