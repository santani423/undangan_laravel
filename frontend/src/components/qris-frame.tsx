import GuestQrCode from '@/components/invitation/GuestQrCode';
import QRCode from 'qrcode';

/** Top-level EMVCo TLV entries (tag → value) of a QRIS payload. */
function parseTlv(payload: string): Record<string, string> {
    const entries: Record<string, string> = {};
    let offset = 0;
    while (offset + 4 <= payload.length) {
        const tag = payload.slice(offset, offset + 2);
        const size = Number(payload.slice(offset + 2, offset + 4));
        if (Number.isNaN(size)) break;
        entries[tag] = payload.slice(offset + 4, offset + 4 + size);
        offset += 4 + size;
    }
    return entries;
}

function formatRupiah(value: string | number): string {
    return `Rp${new Intl.NumberFormat('id-ID').format(Number(value))}`;
}

/**
 * QRIS shown in the standard printed-sticker layout: merchant name, amount,
 * QRIS mark, the code inside red corner accents, and the NMID. Everything is
 * read from the payload itself, so it always matches what the QR encodes.
 * Always rendered on white so the code stays scannable in dark mode.
 */
export default function QrisFrame({ payload, size = 220 }: { payload: string; size?: number }) {
    const entries = parseTlv(payload);
    const merchantName = entries['59'] ?? '';
    const amount = entries['54'];
    const nmid = entries['51'] ? parseTlv(entries['51'])['02'] : undefined;
    const frame = Math.round(size * 1.12);

    return (
        <div className="inline-flex flex-col items-center rounded-xl bg-white px-5 pb-4 pt-5 text-neutral-900 shadow-sm ring-1 ring-black/5">
            {merchantName && <p className="text-base font-medium text-neutral-700">{merchantName}</p>}
            {amount && <p className="mt-1 text-2xl font-bold tracking-tight">{formatRupiah(amount)}</p>}

            {/* QRIS mark: wordmark between corner brackets */}
            <div className="relative mt-2 px-1.5 py-0.5">
                <span className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-neutral-900" />
                <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-neutral-900" />
                <span className="text-lg font-black leading-none tracking-[0.12em]">QRIS</span>
            </div>

            <div className="relative mt-4" style={{ width: frame, height: frame }}>
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="0,0 5,4 5,43 0,47" fill="#E11D2E" />
                    <polygon points="100,53 100,100 53,100 57,95 95,95 95,57" fill="#E11D2E" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <GuestQrCode data={payload} size={size} />
                </div>
            </div>

            {nmid && <p className="mt-3 text-sm tracking-wide text-neutral-700">NMID : {nmid}</p>}
        </div>
    );
}

/**
 * Download the framed QRIS as a PNG. Drawn straight onto a canvas (same
 * layout as <QrisFrame>) at print-friendly resolution, so the saved image can
 * be scanned from another device or printed.
 */
export async function downloadQrisImage(payload: string, filename: string): Promise<void> {
    const entries = parseTlv(payload);
    const merchantName = entries['59'] ?? '';
    const amount = entries['54'];
    const nmid = entries['51'] ? parseTlv(entries['51'])['02'] : undefined;

    const width = 900;
    const height = 1220;
    const frameSize = 760;
    const frameX = (width - frameSize) / 2;
    const frameY = 320;
    const qrSize = Math.round(frameSize / 1.12);
    const font = getComputedStyle(document.body).fontFamily || 'sans-serif';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak didukung.');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    if (merchantName) {
        ctx.fillStyle = '#404040';
        ctx.font = `500 48px ${font}`;
        ctx.fillText(merchantName, width / 2, 110);
    }
    if (amount) {
        ctx.fillStyle = '#171717';
        ctx.font = `700 66px ${font}`;
        ctx.fillText(formatRupiah(amount), width / 2, 195);
    }

    // QRIS mark with corner brackets
    ctx.fillStyle = '#171717';
    ctx.font = `900 46px ${font}`;
    ctx.letterSpacing = '6px';
    const markWidth = ctx.measureText('QRIS').width;
    ctx.fillText('QRIS', width / 2 + 3, 272);
    ctx.letterSpacing = '0px';
    const left = width / 2 - markWidth / 2 - 14;
    const right = width / 2 + markWidth / 2 + 14;
    ctx.strokeStyle = '#171717';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, 248); ctx.lineTo(left, 228); ctx.lineTo(left + 20, 228);
    ctx.moveTo(right, 268); ctx.lineTo(right, 288); ctx.lineTo(right - 20, 288);
    ctx.stroke();

    // Red corner accents, same shapes as the SVG in <QrisFrame>
    const point = (x: number, y: number): [number, number] => [frameX + (x / 100) * frameSize, frameY + (y / 100) * frameSize];
    ctx.fillStyle = '#E11D2E';
    for (const shape of [
        [[0, 0], [5, 4], [5, 43], [0, 47]],
        [[100, 53], [100, 100], [53, 100], [57, 95], [95, 95], [95, 57]],
    ]) {
        ctx.beginPath();
        shape.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(...point(x, y)) : ctx.lineTo(...point(x, y))));
        ctx.closePath();
        ctx.fill();
    }

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, payload, { width: qrSize, margin: 2, errorCorrectionLevel: 'M' });
    ctx.drawImage(qrCanvas, frameX + (frameSize - qrSize) / 2, frameY + (frameSize - qrSize) / 2, qrSize, qrSize);

    if (nmid) {
        ctx.fillStyle = '#404040';
        ctx.font = `400 38px ${font}`;
        ctx.fillText(`NMID : ${nmid}`, width / 2, frameY + frameSize + 75);
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Gagal membuat gambar QRIS.');

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
