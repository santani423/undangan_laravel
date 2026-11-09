import GuestQrCode from '@/components/invitation/GuestQrCode';
import { MailOpen } from 'lucide-react';
import { useWedding } from '../lib/context';
import { Divider } from './Ornament';

/** The invitation cover content (shared by the cinematic overlay and the lite layout). */
export function CoverContent({ onOpen }: { onOpen: () => void }) {
    const w = useWedding();
    const { bride, groom } = w.couple;
    return (
        <div className="wt14-cover">
            <p className="wt14-cover-subtitle">{w.invitationSubtitle}</p>
            <p className="wt14-cover-title">{w.invitationTitle}</p>
            <Divider className="wt14-cover-divider" />
            <h1 className="wt14-cover-names">
                {bride.nickname}
                <span className="wt14-amp">&amp;</span>
                {groom.nickname}
            </h1>
            {w.mainDateLabel && <p className="wt14-cover-date">{w.mainDateLabel}</p>}

            {w.sections.guest && (
                <div className="wt14-cover-guest">
                    <p className="wt14-cover-guest-title">{w.guest.title}</p>
                    <p className="wt14-cover-guest-name">{w.guest.name || w.guest.label}</p>
                    <p className="wt14-cover-guest-note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
                    {w.guest.qrData && (
                        <div className="wt14-cover-qr">
                            <GuestQrCode data={w.guest.qrData} size={96} />
                            <small>QR check-in tamu</small>
                        </div>
                    )}
                </div>
            )}

            <button type="button" onClick={onOpen} className="wt14-btn wt14-btn-lg">
                <MailOpen size={18} aria-hidden="true" /> {w.guest.buttonText}
            </button>
            {w.isExampleData && <p className="wt14-cover-sample">Nama, tanggal, lokasi, dan rekening di undangan ini masih data contoh.</p>}
        </div>
    );
}
