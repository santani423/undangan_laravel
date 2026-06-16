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

export default function Error({ status }: { status: number }) {
    const { title, description } = messages[status] ?? {
        title: 'Terjadi Kesalahan',
        description: 'Silakan coba beberapa saat lagi.',
    };

    return (
        <>
            <Head title={`${status} – ${title}`} />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <p className="text-6xl font-bold text-gray-300">{status}</p>
                <h1 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h1>
                <p className="mt-2 max-w-md text-gray-500">{description}</p>
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
