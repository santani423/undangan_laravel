/** Groups digits in fours for readability ("1234 5678 90"); non-numeric values are returned as-is. */
export function formatAccountNumber(value: string): string {
    const compact = value.replace(/\s+/g, '');
    return /^\d+$/.test(compact) ? compact.replace(/(\d{4})(?=\d)/g, '$1 ') : value;
}
