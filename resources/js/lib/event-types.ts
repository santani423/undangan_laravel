// Keys mirror the event_type slug stored in the database; order defines display order.
export const EVENT_TYPE_LABELS: Record<string, string> = {
    wedding: 'Pernikahan',
    birthday: 'Ulang Tahun',
    khitanan: 'Khitanan',
    aqiqah: 'Aqiqah',
    gender_reveal: 'Gender Reveal',
    syukuran: 'Syukuran',
};

export function eventTypeLabel(value: string): string {
    return EVENT_TYPE_LABELS[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Groups items by event_type, known types first in EVENT_TYPE_LABELS order.
export function groupByEventType<T extends { event_type: string }>(items: T[]): [string, T[]][] {
    const map = new Map<string, T[]>();
    for (const item of items) {
        const list = map.get(item.event_type) ?? [];
        list.push(item);
        map.set(item.event_type, list);
    }
    const order = Object.keys(EVENT_TYPE_LABELS);
    const rank = (type: string) => (order.includes(type) ? order.indexOf(type) : order.length);
    return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b));
}
