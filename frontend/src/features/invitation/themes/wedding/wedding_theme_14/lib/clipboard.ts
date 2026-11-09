/** Copy text with the async Clipboard API, falling back to a hidden textarea + execCommand. */
export async function copyText(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            /* permission denied or unfocused document — try the legacy path */
        }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    const selection = document.getSelection();
    const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }
    document.body.removeChild(ta);
    if (previous && selection) {
        selection.removeAllRanges();
        selection.addRange(previous);
    }
    if (!ok) throw new Error('Clipboard unavailable');
}
