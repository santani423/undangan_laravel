import { Ikon, type NamaIkon } from './Ikon';

export interface ItemDok {
    id: string;
    ikon: NamaIkon;
    label: string;
}

/* Dok navigasi bawah: tautan jangkar ke tiap adegan, adegan aktif ditandai. */
export default function DokNavigasi({ item, aktif }: { item: ItemDok[]; aktif: string }) {
    return (
        <nav className="wt13-dok" aria-label="Navigasi undangan">
            {item.map((it) => (
                <a key={it.id} href={`#${it.id}`} aria-current={it.id === aktif ? 'true' : 'false'}>
                    <Ikon nama={it.ikon} />
                    <span>{it.label}</span>
                </a>
            ))}
        </nav>
    );
}
