"""Tulis MANIFEST aset (JSON + Markdown) untuk proyek Pangantén Sunda."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
P, S, R = 'Prosedural (Python numpy/OpenCV, make_sunda_assets.py)', 'Prosedural (Python, make_assets.py — dipakai bersama)', 'Render dari adegan 3D proyek ini (Three.js, kamera diatur skrip)'
info = {
 'batu.jpg': (P, 'Tekstur batu andesit berlumut untuk jalan setapak, umpak, tepi kolam'), 'batu_n.jpg': (P, 'Normal map batu'),
 'jati.jpg': (P, 'Serat kayu jati: pendopo, saung, gapura, sasak, bingkai'), 'jati_n.jpg': (P, 'Normal map kayu jati'),
 'bambu.jpg': (P, 'Kulit batang bambu, obor, lantai saung'), 'ijuk.jpg': (P, 'Atap ijuk (serat aren) julang ngapak'), 'ijuk_n.jpg': (P, 'Normal map ijuk'),
 'bilik.jpg': (P, 'Anyaman bambu (bilik): dinding pelana, saung, lampion'), 'bilik_n.jpg': (P, 'Normal map bilik'),
 'air_n.jpg': (P, 'Normal map riak air kolam (dianimasikan)'), 'melati.png': (P, 'Bunga melati 5 kelopak (RGBA) untuk rangkaian & semak'),
 'daun_bambu.png': (P, 'Daun bambu ramping (RGBA)'), 'daun_pisang.png': (P, 'Daun pisang dengan sobekan (RGBA)'),
 'batik_rereng.jpg': (P, 'Batik rereng berdasar gumading ala Garutan: taplak tiang uleman, karpet pelaminan, lapisan tutup amplop'),
 'grass.jpg': (S, 'Rumput tanah'), 'grass_n.jpg': (S, 'Normal map rumput'), 'paper.jpg': (S, 'Kertas undangan berserat'), 'paper_n.jpg': (S, 'Normal map kertas'),
 'leaf.png': (S, 'Daun rangkaian bunga'), 'leaf_n.jpg': (S, 'Normal map daun / semak'), 'petal.png': (S, 'Kelopak (mawar putih & kelopak melayang)'),
 'flame.png': (S, 'Api pelita/obor'), 'fabric.jpg': (S, 'Kain linen (cadangan)'), 'fabric_n.jpg': (S, 'Normal map kain (cadangan)'),
 'sky_golden.jpg': ('Prosedural (Python, make_golden.py)', 'Langit equirectangular golden hour + pantulan lingkungan'),
 'panganten.png': ('Ilustrasi vektor SVG (make_panganten_svg.py) dirasterisasi Chromium', 'Ilustrasi 2.5D pengantin Sunda Siger: bendo, jas, samping batik, keris; siger gunungan, 7 kembang goyang, roncean melati 5 & 3 untai, kelat bahu'),
 'latar-panganten.jpg': ('Ilustrasi vektor SVG dirasterisasi Chromium', 'Latar lengkung emas untuk komposisi 2.5D'),
}
for i in range(1, 5): info[f'kisah-{i}.jpg'] = (R, f'Foto contoh kisah ke-{i} (ganti di WEDDING.kisah)')
for i in range(1, 7): info[f'galeri-{i}.jpg'] = (R, f'Foto contoh galeri ke-{i} (ganti di WEDDING.galeri)')
rows = []
for f in sorted(os.listdir(os.path.join(ROOT, 'assets'))):
    if f not in info: continue
    path = os.path.join(ROOT, 'assets', f); im = Image.open(path)
    rows.append({'nama': f.rsplit('.', 1)[0], 'path': 'assets/' + f, 'format': f.rsplit('.', 1)[1].upper(), 'ukuran_px': f'{im.width}x{im.height}', 'kb': os.path.getsize(path) // 1024, 'metode': info[f][0], 'fungsi': info[f][1]})
rows += [
 {'nama': 'geometri-3d', 'path': 'src/adegan.js', 'format': 'Three.js prosedural', 'metode': 'Kode', 'fungsi': 'Pendopo panggung beratap julang ngapak + capit gunting, saung, gapura, sasak, kolam, rumpun bambu, pisang, semak melati, mawar putih, roncean melati, obor bambu, tiang uleman, amplop, segel, kartu lipat'},
 {'nama': 'tekstur-kanvas', 'path': 'src/adegan.js', 'format': 'Canvas 2D runtime', 'metode': 'Kode', 'fungsi': 'Ornamen sulur bergaya ukiran Sunda pada amplop, kartu, panel pelaminan; segel lilin marun bermonogram; papan keterangan kisah'},
 {'nama': 'ikon-ui', 'path': 'src/index.html', 'format': 'SVG inline', 'metode': 'Gambar tangan (SVG)', 'fungsi': 'Ikon RSVP, kalender, lokasi, hadiah, buku tamu, musik, rumah beratap capit gunting; pembatas ornamen; artwork pemuat siger-gunungan'},
 {'nama': 'musik', 'path': 'src/musik.js', 'format': 'Web Audio (sintesis)', 'metode': 'Kode', 'fungsi': 'Nuansa kecapi suling: petikan Karplus-Strong + suling sinus, tangga nada pendekatan salendro'},
]
json.dump(rows, open(os.path.join(ROOT, 'MANIFEST.json'), 'w'), indent=1, ensure_ascii=False)
md = ['# Manifest Aset — Pangantén Sunda', '', '| Aset | Path | Format | Metode | Fungsi |', '|---|---|---|---|---|']
md += [f"| {r['nama']} | `{r['path']}` | {r['format']} | {r['metode']} | {r['fungsi']} |" for r in rows]
open(os.path.join(ROOT, 'MANIFEST.md'), 'w').write('\n'.join(md) + '\n')
print(len(rows), 'entri')
