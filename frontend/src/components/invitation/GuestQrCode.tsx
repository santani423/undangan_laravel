import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface GuestQrCodeProps {
    data: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function GuestQrCode({ data, size = 140, className, style }: GuestQrCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;
        QRCode.toCanvas(canvasRef.current, data, {
            width: size,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        });
    }, [data, size]);

    return <canvas ref={canvasRef} className={className} style={style} />;
}
