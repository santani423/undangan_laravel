import { Construction } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface AdminPlaceholderProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    badge?: string;
}

export function AdminPlaceholder({
    title,
    description,
    icon: Icon = Construction,
    badge,
}: AdminPlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Icon className="size-8 text-primary" />
            </div>
            {badge && (
                <span className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {badge}
                </span>
            )}
            <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm max-w-md">{description}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
                <Construction className="size-3.5" />
                <span>Halaman ini sedang dalam tahap pengembangan</span>
            </div>
        </div>
    );
}
