/** Joins class names, skipping falsy entries: cx('bt10-btn', active && 'is-active'). */
export function cx(...names: (string | false | null | undefined)[]): string {
    return names.filter(Boolean).join(' ');
}
