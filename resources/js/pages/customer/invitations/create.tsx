import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Baby,
    Cake,
    Check,
    ChevronRight,
    Heart,
    PartyPopper,
    Scissors,
    Star,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Undangan Saya', href: '/customer/invitations' },
    { title: 'Buat Undangan', href: '/customer/invitations/create' },
];

interface EventType {
    id: number;
    name: string;
    label: string;
    description: string;
    icon_path: string;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
    wedding: <Heart className="size-8" />,
    birthday: <Cake className="size-8" />,
    khitanan: <Scissors className="size-8" />,
    aqiqah: <Baby className="size-8" />,
    gender_reveal: <Star className="size-8" />,
    syukuran: <PartyPopper className="size-8" />,
};

const eventTypeColors: Record<string, string> = {
    wedding: 'bg-pink-50 text-pink-600 border-pink-200 hover:border-pink-400 hover:bg-pink-100',
    birthday: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100',
    khitanan: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-100',
    aqiqah: 'bg-green-50 text-green-600 border-green-200 hover:border-green-400 hover:bg-green-100',
    gender_reveal: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400 hover:bg-purple-100',
    syukuran: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
};

const eventTypeSelectedColors: Record<string, string> = {
    wedding: 'border-pink-500 bg-pink-50 ring-2 ring-pink-300',
    birthday: 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-300',
    khitanan: 'border-blue-500 bg-blue-50 ring-2 ring-blue-300',
    aqiqah: 'border-green-500 bg-green-50 ring-2 ring-green-300',
    gender_reveal: 'border-purple-500 bg-purple-50 ring-2 ring-purple-300',
    syukuran: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300',
};

interface Props {
    eventTypes: EventType[];
}

export default function InvitationsCreate({ eventTypes }: Props) {
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);

    function handleNext() {
        if (!selectedEventType) return;
        // lanjut ke step berikutnya (pilih tema), nanti diteruskan
        router.visit(`/customer/invitations/create/theme?event_type_id=${selectedEventType.id}`);
    }

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Undangan" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Buat Undangan Baru</h1>
                    <p className="text-muted-foreground text-sm mt-1">Pilih jenis acara untuk undangan Anda.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                        Jenis Undangan
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="size-6 rounded-full border border-border flex items-center justify-center text-xs font-bold">2</div>
                        Pilih Tema
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <div className="size-6 rounded-full border border-border flex items-center justify-center text-xs font-bold">3</div>
                        Detail Acara
                    </div>
                </div>

                {/* Event Type Cards */}
                <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm">
                    <h2 className="font-semibold text-foreground mb-1">Pilih Jenis Undangan</h2>
                    <p className="text-sm text-muted-foreground mb-5">Jenis undangan menentukan template dan fitur yang tersedia.</p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {eventTypes.map((type) => {
                            const isSelected = selectedEventType?.id === type.id;
                            const baseColor = eventTypeColors[type.name] ?? 'bg-muted text-muted-foreground border-border hover:border-foreground/30 hover:bg-muted/70';
                            const selectedColor = eventTypeSelectedColors[type.name] ?? 'border-foreground ring-2 ring-foreground/20';

                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setSelectedEventType(type)}
                                    className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all duration-150 cursor-pointer ${
                                        isSelected ? selectedColor : baseColor
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                            <Check className="size-3" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        {eventTypeIcons[type.name] ?? <Star className="size-8" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm leading-tight">{type.label}</p>
                                        <p className="text-xs mt-0.5 opacity-70 leading-snug">{type.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!selectedEventType}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Lanjutkan
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>
        </CustomerLayout>
    );
}
