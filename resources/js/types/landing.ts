export interface LandingFeature {
    key: string;
    icon: string;
    title: string;
    description: string;
}

export interface LandingPackageByType {
    event_type: string;
    label: string;
    packages: {
        id: number;
        tier: 'basic' | 'premium' | 'exclusive';
        tier_label: string;
        label: string;
        price: number;
        original_price: number | null;
        is_popular: boolean;
        features: string[];
    }[];
}

export interface LandingThemeSample {
    id: number;
    name: string;
    slug: string;
    category: string;
    event_type: string;
    thumbnail: string | null;
    color_primary: string | null;
    color_secondary: string | null;
    is_premium: boolean;
    is_exclusive: boolean;
    /** Preview URL of the theme's seeded sample invitation, null when none exists. */
    sample_url: string | null;
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
    seoTitle: string;
    features: LandingFeature[];
    packagesByType: LandingPackageByType[];
    themeSamples: LandingThemeSample[];
    testimonials: LandingTestimonial[];
    stats: LandingStats;
    contact: LandingContact;
    [key: string]: unknown;
}
