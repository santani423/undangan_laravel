import type { AqiqahInvitation, BirthdayInvitation, GenderRevealInvitation, InvitationData, KhitananInvitation, SyukuranInvitation, WeddingInvitation } from '@/types/invitation';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import AqiqahTheme01 from './themes/aqiqah/aqiqah_theme_01/AqiqahTheme01';
import AqiqahTheme02 from './themes/aqiqah/aqiqah_theme_02/AqiqahTheme02';
import AqiqahTheme03 from './themes/aqiqah/aqiqah_theme_03/AqiqahTheme03';
import AqiqahTheme04 from './themes/aqiqah/aqiqah_theme_04/AqiqahTheme04';
import AqiqahTheme05 from './themes/aqiqah/aqiqah_theme_05/AqiqahTheme05';
import AqiqahTheme06 from './themes/aqiqah/aqiqah_theme_06/AqiqahTheme06';
import AqiqahTheme07 from './themes/aqiqah/aqiqah_theme_07/AqiqahTheme07';

import BirthdayStarryNight from './themes/birthday/BirthdayStarryNight';
import BirthdayTheme01 from './themes/birthday/birthday_theme_01/BirthdayTheme01';
import BirthdayTheme02 from './themes/birthday/birthday_theme_02/BirthdayTheme02';
import BirthdayTheme03 from './themes/birthday/birthday_theme_03/BirthdayTheme03';
import BirthdayTheme04 from './themes/birthday/birthday_theme_04/BirthdayTheme04';
import BirthdayTheme05 from './themes/birthday/birthday_theme_05/BirthdayTheme05';
import BirthdayTheme06 from './themes/birthday/birthday_theme_06/BirthdayTheme06';
import BirthdayTheme07 from './themes/birthday/birthday_theme_07/BirthdayTheme07';
import BirthdayTheme08 from './themes/birthday/birthday_theme_08/BirthdayTheme08';
import BirthdayTheme09 from './themes/birthday/birthday_theme_09/BirthdayTheme09';

import GenderRevealTheme01 from './themes/gender_reveal/gender_reveal_theme_01/GenderRevealTheme01';
import GenderRevealTheme02 from './themes/gender_reveal/gender_reveal_theme_02/GenderRevealTheme02';
import GenderRevealTheme03 from './themes/gender_reveal/gender_reveal_theme_03/GenderRevealTheme03';

import KhitananTheme01 from './themes/khitanan/khitanan_theme_01/KhitananTheme01';
import KhitananTheme02 from './themes/khitanan/khitanan_theme_02/KhitananTheme02';
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
    console.log('Resolving theme component for slug:', themeSlug, 'with invitation type:', invitation.type);
    switch (themeSlug) {
        // Birthday themes
        case 'birthday':
        case 'starry-night':
            return <BirthdayStarryNight invitation={invitation as BirthdayInvitation} visitor={visitor} />;

        case 'birthday_theme_01':
        case 'birthday-theme-01':
            return (
                <BirthdayTheme01 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_02':
        case 'birthday-theme-02':
            return (
                <BirthdayTheme02 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_03':
        case 'birthday-theme-03':
            return (
                <BirthdayTheme03 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_04':
        case 'birthday-theme-04':
            return (
                <BirthdayTheme04 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_05':
        case 'birthday-theme-05':
            return (
                <BirthdayTheme05 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_06':
        case 'birthday-theme-06':
            return (
                <BirthdayTheme06 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_07':
        case 'birthday-theme-07':
            return (
                <BirthdayTheme07 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_08':
        case 'birthday-theme-08':
            return (
                <BirthdayTheme08 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'birthday_theme_09':
        case 'birthday-theme-09':
            return (
                <BirthdayTheme09 invitation={invitation as BirthdayInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        // Aqiqah themes
        case 'aqiqah_theme_01':
        case 'aqiqah-theme-01':
            return <AqiqahTheme01 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_02':
        case 'aqiqah-theme-02':
            return <AqiqahTheme02 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_03':
        case 'aqiqah-theme-03':
            return <AqiqahTheme03 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_04':
        case 'aqiqah-theme-04':
            return <AqiqahTheme04 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_05':
        case 'aqiqah-theme-05':
            return <AqiqahTheme05 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_06':
        case 'aqiqah-theme-06':
            return <AqiqahTheme06 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'aqiqah_theme_07':
        case 'aqiqah-theme-07':
            return <AqiqahTheme07 invitation={invitation as AqiqahInvitation} visitor={visitor} greeting={invitation.greeting} />;

        // Gender reveal themes
        case 'gender_reveal_theme_01':
        case 'gender-reveal-theme-01':
            return (
                <GenderRevealTheme01 invitation={invitation as GenderRevealInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        case 'gender_reveal_theme_02':
        case 'gender-reveal-theme-02':
            return (
                <GenderRevealTheme02 invitation={invitation as GenderRevealInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        // case 'gender_reveal_theme_03':
        case 'gender_reveal_theme_03':
             
            return (
                <GenderRevealTheme03 invitation={invitation as GenderRevealInvitation} visitor={visitor} greeting={invitation.greeting} />
            );

        // Khitanan themes
        case 'khitanan_theme_01':
        case 'khitanan-theme-01':
            return <KhitananTheme01 invitation={invitation as KhitananInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'khitanan_theme_02':
        case 'khitanan-theme-02':
            return <KhitananTheme02 invitation={invitation as KhitananInvitation} visitor={visitor} greeting={invitation.greeting} />;

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
        case 'wedding_theme_08':
            return <WeddingTheme08 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_09':
        case 'wedding-theme-09':
        case 'johan-joana':
        case 'johan-joana-09':
            return <WeddingTheme09 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        case 'wedding_theme_10':
        case 'wedding-theme-10':
            return <WeddingTheme10 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

       
        case 'wedding_theme_11':
        case 'wedding-theme-11':
            return <WeddingTheme11 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;
        case 'wedding_theme_12':
        case 'wedding-theme-12':
            return <WeddingTheme12 invitation={invitation as WeddingInvitation} visitor={visitor} greeting={invitation.greeting} />;

        

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

const DEFAULT_FAVICON = '/favicon.svg';

// Fallback for older cached responses that predate the server-computed `ogImage` field.
function getFaviconUrl(invitation: InvitationData): string {
    if (invitation.ogImage) return invitation.ogImage;

    switch (invitation.type) {
        case 'wedding': {
            const w = invitation as WeddingInvitation;
            return w.couplePhoto || w.groomPhoto || w.bridePhoto || DEFAULT_FAVICON;
        }
        case 'birthday':
            return (invitation as BirthdayInvitation).celebrantPhoto || DEFAULT_FAVICON;
        case 'khitanan':
            return (invitation as KhitananInvitation).childPhoto || DEFAULT_FAVICON;
        case 'aqiqah':
            return (invitation as AqiqahInvitation).babyPhoto || DEFAULT_FAVICON;
        case 'gender_reveal':
            return (invitation as GenderRevealInvitation).parentsPhoto || DEFAULT_FAVICON;
        case 'syukuran':
            return (invitation as SyukuranInvitation).hostPhoto || DEFAULT_FAVICON;
        default:
            return DEFAULT_FAVICON;
    }
}

export default function InvitationShow({ invitation, themeSlug, visitor }: Props) {
    const faviconUrl = getFaviconUrl(invitation);

    useEffect(() => {
        // Keeps the favicon correct if the client ever renders a different invitation
        // without a full page reload. The initial load's favicon and Open Graph tags
        // (what WhatsApp/Facebook/Telegram crawlers read) are rendered server-side in
        // app.blade.php, since those crawlers don't execute this JavaScript.
        document.querySelectorAll('link[rel~="icon"]').forEach((el) => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
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
