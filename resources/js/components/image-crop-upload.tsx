import Cropper from 'react-easy-crop';
import { useCallback, useRef, useState } from 'react';
import { ImageIcon, Minus, Plus, RotateCcw, Upload, X, ZoomIn } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
}

interface Props {
    label: string;
    required?: boolean;
    helpText?: string;
    aspectRatio?: number;   // default 1 (square)
    value: string | null;   // base64 data URL hasil crop
    onChange: (dataUrl: string | null) => void;
}

// ─── Canvas helper ────────────────────────────────────────────────────────────

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: CropArea,
): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', reject);
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    );

    return canvas.toDataURL('image/jpeg', 0.92);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageCropUpload({
    label,
    required = false,
    helpText,
    aspectRatio = 1,
    value,
    onChange,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // raw src sebelum dicrop
    const [rawSrc, setRawSrc] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // crop state
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

    const onCropComplete = useCallback((_: unknown, pixels: CropArea) => {
        setCroppedAreaPixels(pixels);
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setRawSrc(reader.result as string);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setShowModal(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    async function handleApply() {
        if (!rawSrc || !croppedAreaPixels) return;
        const result = await getCroppedImg(rawSrc, croppedAreaPixels);
        onChange(result);
        setShowModal(false);
        setRawSrc(null);
    }

    function handleCancel() {
        setShowModal(false);
        setRawSrc(null);
    }

    function handleRemove() {
        onChange(null);
    }

    function openReplace() {
        fileInputRef.current?.click();
    }

    return (
        <>
            {/* ── Field UI ── */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="ml-1 text-destructive">*</span>}
                </label>

                {value ? (
                    /* Preview hasil crop */
                    <div className="relative w-36 group">
                        <img
                            src={value}
                            alt={label}
                            className="w-36 h-36 rounded-2xl object-cover border border-border shadow-sm"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={openReplace}
                                title="Ganti foto"
                                className="size-8 rounded-full bg-white/90 text-foreground flex items-center justify-center hover:bg-white transition-colors shadow"
                            >
                                <Upload className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                title="Hapus foto"
                                className="size-8 rounded-full bg-white/90 text-destructive flex items-center justify-center hover:bg-white transition-colors shadow"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Upload area */
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 w-36 h-36 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                        <ImageIcon className="size-7" />
                        <span className="text-xs font-medium">Upload Foto</span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                />

                {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            </div>

            {/* ── Crop Modal ── */}
            {showModal && rawSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
                    <div
                        className="bg-card rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <ZoomIn className="size-4 text-primary" />
                                <p className="font-semibold text-sm text-foreground">Crop Foto — {label}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Crop area */}
                        <div className="relative bg-black" style={{ height: 320 }}>
                            <Cropper
                                image={rawSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid
                                style={{
                                    containerStyle: { borderRadius: 0 },
                                    cropAreaStyle: { border: '2px solid hsl(var(--primary))' },
                                }}
                            />
                        </div>

                        {/* Zoom controls */}
                        <div className="px-5 py-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                                    disabled={zoom <= 1}
                                    className="size-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    <Minus className="size-4" />
                                </button>

                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 accent-primary h-1.5 cursor-pointer"
                                />

                                <button
                                    type="button"
                                    onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
                                    disabled={zoom >= 3}
                                    className="size-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                                >
                                    <Plus className="size-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }}
                                    title="Reset"
                                    className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    <RotateCcw className="size-4" />
                                </button>

                                <span className="text-xs text-muted-foreground w-10 text-right">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Drag untuk menggeser • Scroll / slider untuk zoom
                            </p>
                        </div>

                        {/* Footer actions */}
                        <div className="flex gap-3 px-5 pb-5">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
