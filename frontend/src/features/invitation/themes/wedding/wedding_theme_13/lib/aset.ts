/* Aset tema (tekstur 3D, ilustrasi, foto contoh) — diproses Vite agar ikut ter-build dan ber-hash. */
const berkas = import.meta.glob<string>('../assets/*.{jpg,png}', { eager: true, query: '?url', import: 'default' });

export function aset(nama: string): string {
    return berkas[`../assets/${nama}`] ?? '';
}
