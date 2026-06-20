import type {
    BirthdayInvitation,
    InvitationData,
    WeddingInvitation,
} from '@/types/invitation';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import BirthdayStarryNight from './themes/birthday/BirthdayStarryNight';
import WeddingBase from './themes/wedding/blossom-garden/WeddingBase';

interface Props {
    invitation: InvitationData;
    themeSlug: string;
    visitor?: string;
}

function resolveThemeComponent(
    themeSlug: string,
    invitation: InvitationData,
    visitor?: string,
): React.ReactNode {
    console.log(
        `Resolving theme component for slug: ${themeSlug}, invitation type: ${invitation.type}`,
    );
    console.log("invitation",invitation);
    console.log("visitor",visitor);
    
    switch (themeSlug) {
        // Birthday themes
        case 'birthday':
        case 'starry-night':
            return (
                <BirthdayStarryNight
                    invitation={invitation as BirthdayInvitation}
                    visitor={visitor}
                />
            );

        // Wedding themes
        case 'wedding':
        case 'blossom-garden':
        case 'rustic-charm':
            return (
                <WeddingBase
                    invitation={invitation as WeddingInvitation}
                    visitor={visitor}
                />
            );

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
                        <p style={{ color: '#666' }}>
                            Tema "{themeSlug}" sedang dalam pengembangan.
                        </p>
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

export default function InvitationShow({
    invitation,
    themeSlug,
    visitor,
}: Props) {
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
            <Head
                title={
                    invitation.pageTitle ||
                    invitation.title ||
                    'Undangan Digital'
                }
            />
            {resolveThemeComponent(themeSlug, invitation, visitor)}
        </>
    );
}