import { Head, Link } from '@inertiajs/react';

const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description: 'Undangan yang Anda cari tidak ditemukan atau mungkin sudah dihapus.',
    },
    410: {
        title: 'Undangan Sudah Tidak Aktif',
        description: 'Undangan ini sudah melewati masa aktifnya dan tidak dapat diakses.',
    },
    500: {
        title: 'Terjadi Kesalahan',
        description: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
    },
    503: {
        title: 'Layanan Tidak Tersedia',
        description: 'Layanan sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.',
    },
};

/** Only sent by the server when APP_DEBUG=true (see bootstrap/app.php). */
interface DebugInfo {
    exception: string;
    message: string;
    file: string;
    line: number;
    trace: string[];
}

export default function Error({ status, debug }: { status: number; debug?: DebugInfo }) {
    const { title, description } = messages[status] ?? {
        title: 'Terjadi Kesalahan',
        description: 'Silakan coba beberapa saat lagi.',
    };

    return (
        <>
            <Head title={`${status} – ${title}`} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 text-center">
                <p className="text-6xl font-bold text-gray-300">{status}</p>
                <h1 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h1>
                <p className="mt-2 max-w-md text-gray-500">{description}</p>
                {debug && (
                    <div className="mt-6 w-full max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
                        <p className="text-xs font-semibold tracking-wide uppercase">Mode debug (APP_DEBUG=true)</p>
                        <p className="mt-2 font-mono text-xs break-all text-red-900">{debug.exception}</p>
                        <p className="mt-1 font-medium break-words">{debug.message}</p>
                        <p className="mt-2 font-mono text-xs break-all">
                            {debug.file}:{debug.line}
                        </p>
                        {debug.trace.length > 0 && (
                            <pre className="mt-3 overflow-x-auto rounded-lg bg-white/70 p-3 font-mono text-xs leading-relaxed text-red-900">
                                {debug.trace.join('\n')}
                            </pre>
                        )}
                    </div>
                )}
                <Link
                    href="/"
                    className="mt-8 rounded-lg bg-rose-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </>
    );
}
