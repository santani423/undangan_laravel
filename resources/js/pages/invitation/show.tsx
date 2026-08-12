import type {
    AqiqahInvitation,
    BirthdayInvitation,
    GenderRevealInvitation,
    InvitationData,
    KhitananInvitation,
    SyukuranInvitation,
    WeddingInvitation,
} from '@/types/invitation';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
// aqiqah
import AqiqahTheme01 from './themes/aqiqah/aqiqah_theme_01/AqiqahTheme01';
import AqiqahTheme02 from './themes/aqiqah/aqiqah_theme_02/AqiqahTheme02';
// Birthday 
import BirthdayStarryNight from './themes/birthday/birthday_theme_01/BirthdayStarryNight';
import BirthdayTheme01 from './themes/birthday/birthday_theme_01/BirthdayStarryNight';
import BirthdayTheme02 from './themes/birthday/birthday_theme_02/BirthdayTheme02';
// Gender reveal
import GenderRevealTheme01 from './themes/gender_reveal/gender_reveal_theme_01/GenderRevealTheme01';
import GenderRevealTheme02 from './themes/gender_reveal/gender_reveal_theme_02/GenderRevealTheme02';
// khitanan
import KhitananTheme01 from './themes/khitanan/khitanan_theme_01/KhitananTheme01';
import KhitananTheme02 from './themes/khitanan/khitanan_theme_02/KhitananTheme02';
// syukuran
import SyukuranTheme01 from './themes/syukuran/syukuran_theme_01/SyukuranTheme01';
import SyukuranTheme02 from './themes/syukuran/syukuran_theme_02/SyukuranTheme02';
// Wedding
import WeddingBase from './themes/wedding/blossom-garden/WeddingBase';
import WeddingTheme01 from './themes/wedding/wedding_theme_01/WeddingTheme01';
import WeddingTheme02 from './themes/wedding/wedding_theme_02/WeddingTheme02';
import WeddingTheme03 from './themes/wedding/wedding_theme_03/WeddingTheme03';
import WeddingTheme04 from './themes/wedding/wedding_theme_04/WeddingTheme04';
import WeddingTheme05 from './themes/wedding/wedding_theme_05/WeddingTheme05';
import WeddingTheme06 from './themes/wedding/wedding_theme_06/WeddingTheme06';
import WeddingTheme07 from './themes/wedding/wedding_theme_07/WeddingTheme07';
import WeddingTheme08 from './themes/wedding/wedding_theme_08/WeddingTheme08';
import WeddingTheme09 from './themes/wedding/wedding_theme_09/WeddingTheme09';
import WeddingTheme10 from './themes/wedding/wedding_theme_10/WeddingTheme10';
import WeddingTheme11 from './themes/wedding/wedding_theme_11/WeddingTheme11';
import WeddingTheme12 from './themes/wedding/wedding_theme_12/WeddingTheme12';

interface Props {
    invitation: InvitationData;
    themeSlug: string;
    visitor?: string;
}

function resolveThemeComponent(themeSlug: string, invitation: InvitationData, visitor?: string): React.ReactNode {
    console.log('Resolving theme component for slug:', themeSlug);
    switch (themeSlug) {
        // Birthday themes
        case 'birthday':
        case 'starry-night':
            return <BirthdayStarryNight invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'birthday_theme_01':
            return <BirthdayTheme01 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'birthday_theme_02':
        case 'confetti-pop':
            return <BirthdayTheme02 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Wedding themes
        case 'wedding':
        case 'blossom-garden':
        case 'rustic-charm':
            return <WeddingBase invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_01':
            return <WeddingTheme01 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_02':
            return <WeddingTheme02 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_03':
            return <WeddingTheme03 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_04':
            return <WeddingTheme04 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_05':
            return <WeddingTheme05 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_06':
            return <WeddingTheme06 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_07':
            return <WeddingTheme07 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_08':
            return <WeddingTheme08 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_09':
            return <WeddingTheme09 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_10':
            return <WeddingTheme10 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_11':
            return <WeddingTheme11 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_12':
            return <WeddingTheme12 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Khitanan themes
        case 'khitanan':
        case 'sky-blue-junior':
        case 'khitanan_theme_01':
            return <KhitananTheme01 invitation={invitation as KhitananInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'khitanan_theme_02':
            return <KhitananTheme02 invitation={invitation as KhitananInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Aqiqah themes
        case 'aqiqah':
        case 'baby-bloom':
        case 'aqiqah_theme_01':
            return <AqiqahTheme01 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'little-star':
        case 'aqiqah_theme_02':
            return <AqiqahTheme02 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Gender reveal themes
        case 'gender_reveal':
        case 'pink-or-blue':
        case 'gender_reveal_theme_01':
            return <GenderRevealTheme01 invitation={invitation as GenderRevealInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'balloon-fiesta':
        case 'gender_reveal_theme_02':
            return <GenderRevealTheme02 invitation={invitation as GenderRevealInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Syukuran themes
        case 'syukuran':
        case 'warm-gathering':
        case 'syukuran_theme_01':
            return <SyukuranTheme01 invitation={invitation as SyukuranInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'sandy-shore':
        case 'syukuran_theme_02':
            return <SyukuranTheme02 invitation={invitation as SyukuranInvitation} visitor={visitor} greeting={invitation.greeting} />;

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
    if (invitation.type === 'khitanan') {
        return (invitation as KhitananInvitation).childPhoto || '';
    }
    if (invitation.type === 'aqiqah') {
        return (invitation as AqiqahInvitation).babyPhoto || '';
    }
    if (invitation.type === 'gender_reveal') {
        return (invitation as GenderRevealInvitation).parentsPhoto || '';
    }
    if (invitation.type === 'syukuran') {
        return (invitation as SyukuranInvitation).hostPhoto || '';
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
