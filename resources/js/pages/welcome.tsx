import LandingCta from '@/components/landing/landing-cta';
import LandingFeatures from '@/components/landing/landing-features';
import LandingFooter from '@/components/landing/landing-footer';
import LandingHeader from '@/components/landing/landing-header';
import LandingHero from '@/components/landing/landing-hero';
import LandingPackages from '@/components/landing/landing-packages';
import LandingShowcase from '@/components/landing/landing-showcase';
import LandingTestimonials from '@/components/landing/landing-testimonials';
import { useAuthGate } from '@/hooks/use-auth-gate';
import { type SharedData } from '@/types';
import { type WelcomePageProps } from '@/types/landing';
import { Head, usePage } from '@inertiajs/react';

export default function Welcome(props: WelcomePageProps) {
    const { auth } = usePage<SharedData>().props;
    const { appName, appTagline, seoTitle, features, packagesByType, themeSamples, testimonials, stats, contact } = props;
    const { requireAuth, modal } = useAuthGate();

    const startPlainInvitation = () => requireAuth(route('customer.invitations.create'), {});

    const startFromTheme = (themeId: number) =>
        requireAuth(route('customer.invitations.create.theme', { theme_id: themeId }), { themeId });

    const startFromPackage = (packageId: number) =>
        requireAuth(route('customer.invitations.create.theme', { package_id: packageId }), { packageId });

    return (
        <>
            {/* Description, canonical, Open Graph and JSON-LD are server-rendered in app.blade.php (partials/seo). */}
            <Head title={seoTitle}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=playfair-display:500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white">
                <LandingHeader auth={auth} onCreateInvitation={startPlainInvitation} />
                <main>
                    <LandingHero auth={auth} appTagline={appTagline} onCreateInvitation={startPlainInvitation} />
                    <LandingFeatures features={features} />
                    <LandingPackages packagesByType={packagesByType} whatsappLink={contact.whatsapp_link} onSelectPackage={startFromPackage} />
                    <LandingShowcase themes={themeSamples} onCreateFromTheme={startFromTheme} />
                    <LandingTestimonials testimonials={testimonials} stats={stats} />
                    <LandingCta auth={auth} onCreateInvitation={startPlainInvitation} />
                </main>
                <LandingFooter contact={contact} appName={appName} />
            </div>

            {modal}
        </>
    );
}
