import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export interface SettingsTab {
    id: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

interface SettingsTabNavProps {
    tabs: SettingsTab[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function SettingsTabNav({ tabs, activeTab, onChange }: SettingsTabNavProps) {
    return (
        <div className="border-b border-border/50 bg-card sticky top-0 z-10">
            <div className="flex items-end gap-0 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'group relative flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
                                active
                                    ? 'border-primary text-primary bg-primary/5'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
                            )}
                        >
                            <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className="ml-0.5 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
