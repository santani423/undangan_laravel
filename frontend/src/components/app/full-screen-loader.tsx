/** Shown while the app boots (session + first page data) and while a page bundle loads. */
export function FullScreenLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950" role="status" aria-label="Memuat">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
        </div>
    );
}
