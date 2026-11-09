"""Ilustrasi 2.5D pasangan pengantin Sunda (Sunda Siger), gaya datar tanpa wajah.
Pengantin pria: bendo batik, jas tertutup gading berlis emas, samping batik, keris di pinggang.
Pengantin wanita: siger berbentuk gunungan, 7 kembang goyang di sanggul, roncean melati
(5 untai panjang di sisi kanan, 3 untai pendek di sisi kiri), kebaya gading, kelat bahu, samping batik."""
import math, random, os
random.seed(4)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
os.makedirs(OUT, exist_ok=True)

SKIN, SKIN_D = '#D6A47E', '#BF8C66'
HAIR = '#1C1511'
GOLD, GOLD_L, GOLD_D = '#C9A35E', '#EBD39A', '#9C7A3C'
IVORY, IVORY_D = '#F6F0E4', '#E2D7C3'
BATIK, BATIK_D = '#6B4A32', '#4A3222'

defs = f'''
<defs>
  <pattern id="batik" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="26" height="26" fill="{BATIK}"/>
    <rect y="0" width="26" height="3" fill="{BATIK_D}"/><rect y="9" width="26" height="1.4" fill="{GOLD_D}"/>
    <rect y="14" width="26" height="3" fill="{BATIK_D}"/>
    <circle cx="6" cy="21" r="2.2" fill="#E8D5AE"/><circle cx="19" cy="21" r="2.2" fill="#E8D5AE"/>
    <circle cx="12.5" cy="5.5" r="1.3" fill="{GOLD_L}"/>
  </pattern>
  <pattern id="renda" width="18" height="18" patternUnits="userSpaceOnUse">
    <rect width="18" height="18" fill="{IVORY}"/>
    <circle cx="9" cy="9" r="3.2" fill="none" stroke="{IVORY_D}" stroke-width="1"/>
    <circle cx="0" cy="0" r="1.4" fill="{IVORY_D}"/><circle cx="18" cy="18" r="1.4" fill="{IVORY_D}"/>
    <circle cx="18" cy="0" r="1.4" fill="{IVORY_D}"/><circle cx="0" cy="18" r="1.4" fill="{IVORY_D}"/>
  </pattern>
  <linearGradient id="emas" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{GOLD_D}"/><stop offset=".35" stop-color="{GOLD_L}"/><stop offset=".6" stop-color="{GOLD}"/><stop offset="1" stop-color="{GOLD_D}"/>
  </linearGradient>
  <linearGradient id="kainShade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".3" stop-color="#000" stop-opacity="0"/>
    <stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
  </linearGradient>
  <linearGradient id="bajuShade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7A6440" stop-opacity=".22"/><stop offset=".35" stop-color="#7A6440" stop-opacity="0"/>
    <stop offset=".75" stop-color="#7A6440" stop-opacity="0"/><stop offset="1" stop-color="#7A6440" stop-opacity=".25"/>
  </linearGradient>
  <radialGradient id="bayang" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a2a18" stop-opacity=".35"/><stop offset="1" stop-color="#3a2a18" stop-opacity="0"/></radialGradient>
</defs>'''


def strand(x0, y0, length, sway, n_per=None):
    """Untaian melati: kuncup kecil berderet mengikuti kurva lembut."""
    out = []
    steps = int(length / 9)
    for i in range(steps):
        t = i / steps
        x = x0 + math.sin(t * 2.2) * sway * t
        y = y0 + length * t
        rx, ry = (3.6, 5.2) if i % 4 else (4.6, 4.6)
        fill = '#FFFFFF' if i % 5 else '#F3F0E6'
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="#DCD6C6" stroke-width=".6"/>')
    # kuntum melati mekar di ujung
    xe, ye = x0 + math.sin(2.2) * sway, y0 + length
    for k in range(5):
        a = k / 5 * math.tau - math.pi / 2
        out.append(f'<ellipse cx="{xe + math.cos(a) * 5:.1f}" cy="{ye + 4 + math.sin(a) * 5:.1f}" rx="4" ry="2.6" transform="rotate({math.degrees(a):.0f} {xe + math.cos(a) * 5:.1f} {ye + 4 + math.sin(a) * 5:.1f})" fill="#fff" stroke="#DCD6C6" stroke-width=".5"/>')
    return ''.join(out)


def kembang_goyang(x, y, s=1):
    """Kembang goyang: bunga logam bertangkai pegas dengan mata batu."""
    o = f'<path d="M{x} {y + 22 * s} q {-4 * s} {-10 * s} 0 {-22 * s}" stroke="{GOLD_D}" stroke-width="1.6" fill="none"/>'
    for k in range(6):
        a = k / 6 * math.tau
        o += f'<ellipse cx="{x + math.cos(a) * 6 * s:.1f}" cy="{y + math.sin(a) * 6 * s:.1f}" rx="{5 * s:.1f}" ry="{3 * s:.1f}" transform="rotate({math.degrees(a):.0f} {x + math.cos(a) * 6 * s:.1f} {y + math.sin(a) * 6 * s:.1f})" fill="url(#emas)" stroke="{GOLD_D}" stroke-width=".6"/>'
    o += f'<circle cx="{x}" cy="{y}" r="{3.2 * s:.1f}" fill="#F7F3E8" stroke="{GOLD_D}" stroke-width=".8"/>'
    return o


def siger(cx, base_y, w, h):
    """Siger berbentuk gunungan dengan tepi bergerigi dan ornamen bertingkat."""
    L, Rr = cx - w / 2, cx + w / 2
    # tepi luar bergerigi
    pts = []
    n = 22
    for i in range(n + 1):
        t = i / n
        x = L + w * t
        peak = 1 - abs(t - .5) * 2
        y = base_y - h * (peak ** 1.25) - (6 if i % 2 else 0) * (0.3 + peak)
        pts.append(f'{x:.1f},{y:.1f}')
    outer = f'<path d="M{L},{base_y} L{" L".join(pts)} L{Rr},{base_y} Q{cx},{base_y + 16} {L},{base_y} Z" fill="url(#emas)" stroke="{GOLD_D}" stroke-width="1.4"/>'
    inner = ''
    for k, s in enumerate([.78, .56, .34]):
        ww, hh = w * s, h * s
        inner += f'<path d="M{cx - ww / 2},{base_y - 4} Q{cx - ww * .2},{base_y - hh * .9} {cx},{base_y - hh} Q{cx + ww * .2},{base_y - hh * .9} {cx + ww / 2},{base_y - 4}" fill="none" stroke="{GOLD_D}" stroke-width="1.3"/>'
    jewels = ''.join(f'<circle cx="{cx + dx}" cy="{base_y - 10 - dy}" r="{r}" fill="#FBF6EA" stroke="{GOLD_D}" stroke-width=".8"/>'
                     for dx, dy, r in [(0, h * .55, 5), (-w * .2, h * .22, 3.5), (w * .2, h * .22, 3.5), (-w * .36, 4, 2.6), (w * .36, 4, 2.6), (0, h * .25, 3.5)])
    band = f'<path d="M{L + 4},{base_y} Q{cx},{base_y + 14} {Rr - 4},{base_y}" stroke="{GOLD_D}" stroke-width="3" fill="none"/>'
    return outer + inner + jewels + band


def wiron(x0, x1, y0, y1, n=6):
    """Lipatan wiron di bagian depan samping."""
    return ''.join(f'<line x1="{x0 + (x1 - x0) * i / n:.1f}" y1="{y0}" x2="{x0 + (x1 - x0) * i / n + 3:.1f}" y2="{y1}" stroke="{BATIK_D}" stroke-width="2" opacity=".7"/>' for i in range(n + 1))


# ===================== PENGANTIN PRIA =====================
gx = 330
groom = f'''
<g id="pria">
  <ellipse cx="{gx}" cy="1150" rx="120" ry="16" fill="url(#bayang)"/>
  <!-- selop -->
  <path d="M{gx - 58},1136 q 4,-16 26,-16 h 20 q 6,10 0,18 z" fill="#5A3A26"/><path d="M{gx + 58},1136 q -4,-16 -26,-16 h -20 q -6,10 0,18 z" fill="#5A3A26"/>
  <!-- samping batik -->
  <path d="M{gx - 92},640 L{gx + 92},640 L{gx + 78},1124 L{gx - 78},1124 Z" fill="url(#batik)"/>
  <path d="M{gx - 92},640 L{gx + 92},640 L{gx + 78},1124 L{gx - 78},1124 Z" fill="url(#kainShade)"/>
  <path d="M{gx - 8},660 L{gx + 30},660 L{gx + 26},1124 L{gx - 12},1124 Z" fill="url(#batik)" stroke="{BATIK_D}" stroke-width="1"/>
  {wiron(gx - 6, gx + 26, 664, 1120, 5)}
  <!-- jas tertutup gading -->
  <path d="M{gx - 34},300 Q{gx - 98},304 {gx - 108},344 L{gx - 104},700 Q{gx},716 {gx + 104},700 L{gx + 108},344 Q{gx + 98},304 {gx + 34},300 Z" fill="{IVORY}" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{gx - 34},300 Q{gx - 98},304 {gx - 108},344 L{gx - 104},700 Q{gx},716 {gx + 104},700 L{gx + 108},344 Q{gx + 98},304 {gx + 34},300 Z" fill="url(#bajuShade)"/>
  <path d="M{gx},312 L{gx},708" stroke="url(#emas)" stroke-width="5"/>
  {''.join(f'<circle cx="{gx}" cy="{340 + i * 48}" r="5.5" fill="url(#emas)" stroke="{GOLD_D}" stroke-width=".8"/>' for i in range(7))}
  <path d="M{gx - 104},696 Q{gx},712 {gx + 104},696" stroke="url(#emas)" stroke-width="5" fill="none"/>
  <!-- sabuk & keris -->
  <rect x="{gx - 100}" y="628" width="200" height="16" rx="3" fill="url(#batik)"/>
  <rect x="{gx - 100}" y="632" width="200" height="4" fill="url(#emas)"/>
  <path d="M{gx - 74},560 q -10,30 2,74 l 10,0 q 8,-40 -4,-74 z" fill="#5A3A26"/>
  <path d="M{gx - 72},548 q -8,8 -4,18 q 10,4 16,-4 q -2,-12 -12,-14 z" fill="url(#emas)"/>
  <!-- lengan -->
  <path d="M{gx - 104},344 Q{gx - 128},460 {gx - 112},560 Q{gx - 60},600 {gx - 8},596 L{gx - 6},570 Q{gx - 56},560 {gx - 80},520 L{gx - 84},380 Z" fill="{IVORY}" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{gx + 104},344 Q{gx + 128},460 {gx + 112},560 Q{gx + 60},604 {gx + 10},600 L{gx + 8},574 Q{gx + 56},564 {gx + 80},520 L{gx + 84},380 Z" fill="{IVORY}" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{gx - 16},566 l 4,32 M{gx + 18},570 l -4,32" stroke="url(#emas)" stroke-width="4"/>
  <ellipse cx="{gx}" cy="588" rx="22" ry="16" fill="{SKIN}"/><ellipse cx="{gx + 4}" cy="584" rx="16" ry="11" fill="{SKIN_D}" opacity=".5"/>
  <!-- kerah berdiri -->
  <path d="M{gx - 34},300 Q{gx},322 {gx + 34},300 L{gx + 32},282 Q{gx},300 {gx - 32},282 Z" fill="{IVORY}" stroke="url(#emas)" stroke-width="3"/>
  <!-- leher & kepala -->
  <rect x="{gx - 20}" y="250" width="40" height="44" fill="{SKIN_D}"/>
  <ellipse cx="{gx}" cy="210" rx="54" ry="66" fill="{SKIN}"/>
  <ellipse cx="{gx - 54}" cy="214" rx="9" ry="15" fill="{SKIN_D}"/><ellipse cx="{gx + 54}" cy="214" rx="9" ry="15" fill="{SKIN_D}"/>
  <path d="M{gx - 46},176 Q{gx - 50},150 {gx - 30},140" stroke="{HAIR}" stroke-width="8" fill="none"/>
  <!-- bendo -->
  <path d="M{gx - 60},188 Q{gx - 62},120 {gx},116 Q{gx + 62},120 {gx + 60},188 Q{gx},170 {gx - 60},188 Z" fill="url(#batik)" stroke="{BATIK_D}" stroke-width="2"/>
  <path d="M{gx - 60},188 Q{gx},170 {gx + 60},188" stroke="url(#emas)" stroke-width="4" fill="none"/>
  <path d="M{gx - 40},180 L{gx - 28},128 M{gx - 14},174 L{gx - 8},120 M{gx + 14},174 L{gx + 8},120 M{gx + 40},180 L{gx + 28},128" stroke="{GOLD_D}" stroke-width="1.6" opacity=".9"/>
  <path d="M{gx + 52},150 q 22,4 20,30 q -10,2 -18,-8 z" fill="url(#batik)" stroke="{BATIK_D}" stroke-width="1.5"/>
</g>'''

# ===================== PENGANTIN WANITA =====================
bx = 585
ronce_kanan = ''.join(strand(bx - 52 + i * 5, 250 + i * 6, 300 - i * 14, 10 - i * 3) for i in range(5))   # sisi kanan pengantin (kiri penonton): 5 untai panjang
ronce_kiri = ''.join(strand(bx + 52 - i * 5, 252 + i * 6, 170 - i * 10, -8 + i * 2) for i in range(3))    # sisi kiri: 3 untai pendek
bride = f'''
<g id="wanita">
  <ellipse cx="{bx}" cy="1150" rx="105" ry="15" fill="url(#bayang)"/>
  <path d="M{bx - 44},1136 q 4,-14 24,-14 h 14 q 4,8 0,16 z" fill="#5A3A26"/><path d="M{bx + 44},1136 q -4,-14 -24,-14 h -14 q -4,8 0,16 z" fill="#5A3A26"/>
  <!-- samping batik ramping -->
  <path d="M{bx - 74},610 L{bx + 74},610 L{bx + 56},1128 L{bx - 60},1128 Z" fill="url(#batik)"/>
  <path d="M{bx - 74},610 L{bx + 74},610 L{bx + 56},1128 L{bx - 60},1128 Z" fill="url(#kainShade)"/>
  <path d="M{bx + 4},700 L{bx + 34},700 L{bx + 30},1128 L{bx - 2},1128 Z" fill="url(#batik)" stroke="{BATIK_D}" stroke-width="1"/>
  {wiron(bx + 6, bx + 30, 704, 1124, 5)}
  <!-- kebaya panjang -->
  <path d="M{bx - 30},300 Q{bx - 84},306 {bx - 90},346 L{bx - 98},820 Q{bx - 20},850 {bx},760 Q{bx + 20},850 {bx + 98},820 L{bx + 90},346 Q{bx + 84},306 {bx + 30},300 Z" fill="url(#renda)" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{bx - 30},300 Q{bx - 84},306 {bx - 90},346 L{bx - 98},820 Q{bx - 20},850 {bx},760 Q{bx + 20},850 {bx + 98},820 L{bx + 90},346 Q{bx + 84},306 {bx + 30},300 Z" fill="url(#bajuShade)"/>
  <path d="M{bx - 98},820 Q{bx - 20},850 {bx},760 Q{bx + 20},850 {bx + 98},820" stroke="url(#emas)" stroke-width="3" fill="none"/>
  <!-- kerah V & bros -->
  <path d="M{bx - 30},300 L{bx},420 L{bx + 30},300 Z" fill="{SKIN}"/>
  <path d="M{bx - 30},300 L{bx},420 L{bx + 30},300" stroke="url(#emas)" stroke-width="3" fill="none"/>
  <path d="M{bx - 30},304 Q{bx},360 {bx + 30},304" stroke="url(#emas)" stroke-width="2.4" fill="none"/>
  {''.join(f'<circle cx="{bx}" cy="{440 + i * 34}" r="{8 - i * 1.4:.1f}" fill="url(#emas)" stroke="{GOLD_D}" stroke-width=".8"/>' for i in range(3))}
  <!-- lengan & kelat bahu -->
  <path d="M{bx - 90},346 Q{bx - 112},460 {bx - 96},560 Q{bx - 50},596 {bx - 6},592 L{bx - 4},566 Q{bx - 46},556 {bx - 66},520 L{bx - 70},380 Z" fill="url(#renda)" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{bx + 90},346 Q{bx + 112},460 {bx + 96},560 Q{bx + 50},600 {bx + 8},596 L{bx + 6},570 Q{bx + 46},560 {bx + 66},520 L{bx + 70},380 Z" fill="url(#renda)" stroke="{IVORY_D}" stroke-width="1.5"/>
  <path d="M{bx - 104},380 l 16,-30 l 16,30 z" fill="url(#emas)" stroke="{GOLD_D}" stroke-width="1"/><path d="M{bx + 72},380 l 16,-30 l 16,30 z" fill="url(#emas)" stroke="{GOLD_D}" stroke-width="1"/>
  <ellipse cx="{bx}" cy="584" rx="20" ry="14" fill="{SKIN}"/>
  <!-- buket melati kecil di tangan -->
  {''.join(f'<circle cx="{bx - 14 + (i % 5) * 7}" cy="{606 + (i // 5) * 7}" r="4" fill="#fff" stroke="#DCD6C6" stroke-width=".6"/>' for i in range(15))}
  {strand(bx - 6, 616, 120, 6)}{strand(bx + 8, 616, 100, -5)}
  <!-- leher & kepala -->
  <rect x="{bx - 16}" y="262" width="32" height="40" fill="{SKIN_D}"/>
  <path d="M{bx - 30},300 Q{bx},318 {bx + 30},300" stroke="url(#emas)" stroke-width="4" fill="none"/>
  <ellipse cx="{bx}" cy="232" rx="46" ry="58" fill="{SKIN}"/>
  <!-- rambut & sanggul -->
  <path d="M{bx - 50},250 Q{bx - 58},170 {bx},166 Q{bx + 58},170 {bx + 50},250 Q{bx + 40},200 {bx},196 Q{bx - 40},200 {bx - 50},250 Z" fill="{HAIR}"/>
  <ellipse cx="{bx}" cy="160" rx="62" ry="34" fill="{HAIR}"/>
  <!-- kembang goyang: 5 menghadap depan -->
  {''.join(kembang_goyang(bx + dx, 112 + dy, 1.0) for dx, dy in [(-50, 18), (-26, 2), (0, -6), (26, 2), (50, 18)])}
  <!-- siger -->
  {siger(bx, 200, 128, 84)}
  <!-- roncean melati -->
  {ronce_kanan}{ronce_kiri}
</g>'''

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="160 70 600 1100" width="900" height="1650">{defs}{groom}{bride}</svg>'
open(os.path.join(OUT, 'panganten.svg'), 'w').write(svg)

# Latar lukisan untuk komposisi 2.5D: lengkung ornamen emas di atas gading
bg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
<defs>
  <radialGradient id="g" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#FBF4E6"/><stop offset=".6" stop-color="#F0E2C8"/><stop offset="1" stop-color="#D9C3A0"/></radialGradient>
  <linearGradient id="emas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{GOLD_D}"/><stop offset=".4" stop-color="{GOLD_L}"/><stop offset="1" stop-color="{GOLD_D}"/></linearGradient>
</defs>
<rect width="900" height="1200" fill="url(#g)"/>
<path d="M120 1200 V420 Q120 120 450 90 Q780 120 780 420 V1200" fill="none" stroke="url(#emas)" stroke-width="10"/>
<path d="M150 1200 V430 Q150 150 450 122 Q750 150 750 430 V1200" fill="none" stroke="url(#emas)" stroke-width="3"/>
{''.join(f'<path d="M{450 + s * (60 + i * 46)} {150 + i * 30 + (i * i) * 3} q {s * 20} -26 {s * 44} -6 q {-s * 10} 22 {-s * 44} 6 z" fill="url(#emas)" opacity=".85"/>' for i in range(7) for s in (-1, 1))}
<circle cx="450" cy="140" r="16" fill="url(#emas)"/><circle cx="450" cy="140" r="7" fill="#FBF4E6"/>
{''.join(f'<circle cx="{120 + (i % 2) * 660}" cy="{460 + i // 2 * 70}" r="5" fill="url(#emas)"/>' for i in range(20))}
</svg>'''
open(os.path.join(OUT, 'latar-panganten.svg'), 'w').write(bg)
print('svg ok')
