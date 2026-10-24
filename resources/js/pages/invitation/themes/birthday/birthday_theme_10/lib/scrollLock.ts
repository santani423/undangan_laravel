let locks = 0;

/** Reference-counted page scroll lock (cover + lightbox can overlap). Returns a release function. */
export function lockScroll() {
    locks++;
    if (locks === 1) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }
    let released = false;
    return () => {
        if (released) return;
        released = true;
        locks = Math.max(0, locks - 1);
        if (locks === 0) {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    };
}
