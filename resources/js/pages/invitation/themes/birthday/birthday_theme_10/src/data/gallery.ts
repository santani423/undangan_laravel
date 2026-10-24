import { projectAsset } from '../config/assets';
import type { GalleryImage } from '../types/invitation';

/**
 * Gallery photos. The bundled files are illustrated placeholders generated from
 * the asset pack (`npm run generate:gallery`). Replace `src` with real photos,
 * e.g. `projectAsset('gallery/foto-ulang-tahun-1.jpg')`, and remove `demo: true`.
 */
export const galleryImages: GalleryImage[] = [
  {
    id: 'kue-pertama',
    src: projectAsset('gallery/memory-01.svg'),
    alt: 'Ilustrasi kue ulang tahun dengan tiga lilin menyala',
    caption: 'Tiup lilin pertama — ulang tahun ke-1',
    demo: true,
  },
  {
    id: 'mobil-mainan',
    src: projectAsset('gallery/memory-02.svg'),
    alt: 'Ilustrasi mobil mainan merah di jalan taman',
    caption: 'Balapan mobil-mobilan di taman',
    demo: true,
  },
  {
    id: 'beri-beruang',
    src: projectAsset('gallery/memory-03.svg'),
    alt: 'Ilustrasi boneka beruang memegang balon',
    caption: 'Bersama Beri, sahabat beruang kesayangan',
    demo: true,
  },
  {
    id: 'menara-balok',
    src: projectAsset('gallery/memory-04.svg'),
    alt: 'Ilustrasi tumpukan balok mainan warna-warni',
    caption: 'Menara balok tertinggi buatan sendiri',
    demo: true,
  },
  {
    id: 'hari-kado',
    src: projectAsset('gallery/memory-05.svg'),
    alt: 'Ilustrasi kotak kado biru dengan pita merah muda',
    caption: 'Kejutan kado dari Kakek dan Nenek',
    demo: true,
  },
  {
    id: 'rumah-pohon',
    src: projectAsset('gallery/memory-06.svg'),
    alt: 'Ilustrasi rumah mainan dan pohon di bukit',
    caption: 'Piknik sore di dekat rumah',
    demo: true,
  },
];
