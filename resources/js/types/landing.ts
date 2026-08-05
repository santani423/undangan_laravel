export interface LandingFeature {
    key: string;
    icon: string;
    title: string;
    description: string;
}

export interface LandingPackageTier {
    tier: 'basic' | 'premium' | 'exclusive';
    label: string;
    price_from: number;
    is_popular: boolean;
    features: string[];
}

export interface LandingThemeSample {
    id: number;
    name: string;
    category: string;
    event_type: string;
    thumbnail: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
}

export interface LandingTestimonial {
    id: number;
    name: string;
    event_type: string | null;
    content: string;
    rating: number;
    photo_url: string | null;
}

export interface LandingStats {
    invitations_created: number;
    themes_available: number;
    event_types: number;
}

export interface LandingContact {
    whatsapp: string;
    whatsapp_link: string;
    email: string;
    instagram: string;
    facebook: string;
}

export interface WelcomePageProps {
    appName: string;
    appTagline: string;
    features: LandingFeature[];
    packageTiers: LandingPackageTier[];
    themeSamples: LandingThemeSample[];
    testimonials: LandingTestimonial[];
    stats: LandingStats;
    contact: LandingContact;
    [key: string]: unknown;
}
