import type { BirthdayInvitation, InvitationData, WeddingInvitation } from '@/types/invitation';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import BirthdayStarryNight from './themes/birthday/BirthdayStarryNight';
import WeddingBase from './themes/wedding/blossom-garden/WeddingBase';
import WeddingTheme01 from './themes/wedding/wedding_theme_01/WeddingTheme01';
import WeddingTheme02 from './themes/wedding/wedding_theme_02/WeddingTheme02';
import WeddingTheme03 from './themes/wedding/wedding_theme_03/WeddingTheme03';
import WeddingTheme04 from './themes/wedding/wedding_theme_04/WeddingTheme04';
import WeddingTheme05 from './themes/wedding/wedding_theme_05/WeddingTheme05';
import WeddingTheme06 from './themes/wedding/wedding_theme_06/WeddingTheme06';
import WeddingTheme07 from './themes/wedding/wedding_theme_07/WeddingTheme07';
import WeddingTheme09 from './themes/wedding/wedding_theme_09/WeddingTheme09';

interface Props {
    invitation: InvitationData;
    themeSlug: string;
    visitor?: string;
}

function resolveThemeComponent(themeSlug: string, invitation: InvitationData, visitor?: string): React.ReactNode {
    switch (themeSlug) {
        // Birthday themes
        case 'birthday':
        case 'starry-night':
            return <BirthdayStarryNight invitation={invitation as BirthdayInvitation} visitor={visitor} />;

        // Wedding themes
        case 'wedding':
        case 'blossom-garden':
        case 'rustic-charm':
            return <WeddingBase invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'them1':
        case 'wedding_theme_01':
            return <WeddingTheme01 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_02':
            return <WeddingTheme02 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_03':
            return <WeddingTheme03 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_04':
            return <WeddingTheme04 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_05':
        case 'wedding-theme-05':
            return <WeddingTheme05 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_06':
        case 'wedding-theme-06':
            return <WeddingTheme06 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'ambra-tika':
        case 'undangan-ambra-tika':
        case 'wedding_theme_07':
        case 'wedding-theme-07':
            return <WeddingTheme07 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_09':
        case 'wedding-theme-09':
        case 'johan-joana':
        case 'johan-joana-09':
            return <WeddingTheme09 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Fallback
        default:
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <h1
                            style={{
                                fontSize: '2rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {invitation.title || 'Undangan Digital'}
                        </h1>
                        <p style={{ color: '#666' }}>Tema "{themeSlug}" sedang dalam pengembangan.</p>
                    </div>
                </div>
            );
    }
}

function getFaviconUrl(invitation: InvitationData): string {
    if (invitation.type === 'wedding') {
        const w = invitation as WeddingInvitation;
        return w.couplePhoto || w.groomPhoto || w.bridePhoto || '';
    }
    if (invitation.type === 'birthday') {
        return (invitation as BirthdayInvitation).celebrantPhoto || '';
    }
    return '';
}

export default function InvitationShow({ invitation, themeSlug, visitor }: Props) {
    const faviconUrl = getFaviconUrl(invitation);

    useEffect(() => {
        if (!faviconUrl) return;
        // Remove existing favicons
        document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/jpeg';
        link.href = faviconUrl;
        document.head.appendChild(link);
    }, [faviconUrl]);

    return (
        <>
            <Head title={invitation.pageTitle || invitation.title || 'Undangan Digital'} />
            {resolveThemeComponent(themeSlug, invitation, visitor)}
        </>
    );
}
