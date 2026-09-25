interface EventTypeTabsProps {
    tabs: { value: string; label: string; count?: number }[];
    active: string;
    onChange: (value: string) => void;
}

export default function EventTypeTabs({ tabs, active, onChange }: EventTypeTabsProps) {
    return (
        <div className="flex justify-center">
            <div role="tablist" className="flex max-w-full gap-2 overflow-x-auto px-1 pb-2">
                {tabs.map((tab) => {
                    const isActive = tab.value === active;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(tab.value)}
                            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-md'
                                    : 'border border-gray-200 bg-white text-gray-600 hover:border-rose-300 hover:text-rose-500'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && <span className={`ml-1.5 ${isActive ? 'text-rose-100' : 'text-gray-400'}`}>{tab.count}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
