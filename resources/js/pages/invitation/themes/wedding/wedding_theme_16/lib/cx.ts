/** Joins class names, skipping falsy entries: cx('wt16-btn', active && 'is-active'). */
export function cx(...names: (string | false | null | undefined)[]): string {
    return names.filter(Boolean).join(' ');
}
