// Scene illustrations for the wedding_theme_14 sample (gallery + love story). Run after gen.mjs helpers.
import { writeFileSync } from 'node:fs';
import { C, H, OUT, W, along, brideFigure, defs, f, flower, groomFigure, ronce } from './gen.mjs';

const svg = (body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<defs>${extra}</defs>${body}</svg>`;

/** Deterministic pseudo-random. */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const vignette = (id, strength = 0.7) =>
    `<radialGradient id="${id}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${strength}"/></radialGradient>`;

/* ───────────── Kembar mayang (janur arrangement in a brass bokor) ───────────── */
function kembarMayang(x, y, s = 1) {
    let leaves = '';
    for (let i = 0; i < 11; i++) {
        const ty = -110 - i * 30;
        const k = 1 - Math.abs(i - 4) / 7; // widest a little below the middle
        for (const dir of [-1, 1]) {
            const ex = dir * (70 + 70 * k);
            leaves += `<path d="M0,${ty} C${f(dir * 30 * k + dir * 10)},${ty - 26} ${f(ex * 0.8)},${ty - 10} ${f(ex)},${ty + 34}" fill="none" stroke="${i % 2 ? '#e9d48c' : '#d8bf6a'}" stroke-width="9" stroke-linecap="round"/>`;
            leaves += flower(ex, ty + 38, 9, i % 3 ? '#f7f0dc' : '#b8352e', C.goldL, 5);
        }
    }
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-10,-60 V-420" stroke="#9fae6a" stroke-width="16"/>
      ${leaves}
      <path d="M0,-470 C14,-440 16,-420 0,-400 C-16,-420 -14,-440 0,-470 Z" fill="#e9d48c" stroke="${C.goldD}" stroke-width="2"/>
      <path d="M-58,0 C-62,-42 -32,-66 0,-68 C32,-66 62,-42 58,0 Z" fill="url(#goldG)" stroke="${C.goldD}" stroke-width="2"/>
      <rect x="-30" y="0" width="60" height="18" rx="4" fill="${C.goldD}"/>
      <path d="M-40,-28 H40" stroke="${C.goldD}" stroke-width="2.5" opacity=".7"/>
    </g>`;
}

/* ───────────── 1. Pasangan pengantin di pelaminan ───────────── */
function couple() {
    const extra = `
      <linearGradient id="gebyok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c4a2c"/><stop offset="1" stop-color="#3b2315"/></linearGradient>
      <pattern id="ukir" width="90" height="90" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="${C.gold}" stroke-width="2" opacity=".28">
          <path d="M10,80 C10,40 40,30 45,45 C50,60 30,62 30,52"/><path d="M80,10 C80,50 50,60 45,45"/>
          <path d="M45,45 C60,30 80,40 80,60"/><circle cx="45" cy="45" r="4"/>
        </g>
      </pattern>
      ${vignette('vigC', 0.65)}`;
    const swag = (a, b, sag) =>
        ronce([a, [a[0] + (b[0] - a[0]) * 0.3, a[1] + sag], [a[0] + (b[0] - a[0]) * 0.7, b[1] + sag], b], { step: 12, rx: 6, ry: 8.5, budEvery: 7 });
    return svg(
        `
  <rect width="${W}" height="${H}" fill="#1c110b"/>
  <path d="M50,1200 V440 C50,250 250,112 450,112 C650,112 850,250 850,440 V1200 Z" fill="url(#gebyok)"/>
  <path d="M50,1200 V440 C50,250 250,112 450,112 C650,112 850,250 850,440 V1200 Z" fill="url(#ukir)"/>
  <path d="M50,1200 V440 C50,250 250,112 450,112 C650,112 850,250 850,440 V1200" fill="none" stroke="url(#goldG)" stroke-width="7"/>
  <path d="M74,1200 V446 C74,270 262,136 450,136 C638,136 826,270 826,446 V1200" fill="none" stroke="${C.gold}" stroke-width="2" opacity=".6"/>
  <ellipse cx="450" cy="640" rx="380" ry="420" fill="url(#glow)"/>
  <g transform="translate(450 112)">
    <path d="M0,-78 C26,-50 46,-14 52,26 C30,18 14,20 0,34 C-14,20 -30,18 -52,26 C-46,-14 -26,-50 0,-78 Z" fill="url(#goldG)" stroke="${C.goldD}" stroke-width="2"/>
    <circle cy="-6" r="10" fill="${C.soganD}"/>
  </g>
  ${swag([96, 360], [450, 300], 70)}${swag([450, 300], [804, 360], 70)}
  ${kembarMayang(118, 1130, 0.9)}${kembarMayang(782, 1130, 0.9)}
  <g transform="translate(18 214) scale(.665)">${brideFigure(1800)}</g>
  <g transform="translate(296 186) scale(.68)">${groomFigure(1800)}</g>
  <rect width="${W}" height="${H}" fill="url(#vigC)"/>`,
        extra,
    );
}

/* ───────────── 2. Joglo saat senja (menuju pawiwahan) ───────────── */
function joglo() {
    seed = 11;
    const stars = Array.from({ length: 40 }, () => `<circle cx="${f(rnd() * 900)}" cy="${f(rnd() * 380)}" r="${f(0.8 + rnd() * 1.6)}" fill="#fff" opacity="${f(0.3 + rnd() * 0.5)}"/>`).join('');
    const extra = `
      <linearGradient id="skyJ" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#231a2c"/><stop offset=".38" stop-color="#5c3540"/><stop offset=".62" stop-color="#c46d48"/><stop offset=".72" stop-color="#eeb06a"/>
      </linearGradient>
      <radialGradient id="sunG"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".35" stop-color="#f6b867" stop-opacity=".8"/><stop offset="1" stop-color="#f6b867" stop-opacity="0"/></radialGradient>
      <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf88"/><stop offset="1" stop-color="#b9683a"/></linearGradient>
      <linearGradient id="groundJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c1a11"/><stop offset="1" stop-color="#120b07"/></linearGradient>
      ${vignette('vigJ', 0.6)}`;
    const roofLines = [560, 590, 620, 668, 690, 724]
        .map((y) => `<path d="M${y < 650 ? 450 - (y - 540) * 1.05 - 52 : y < 712 ? 320 - (y - 650) * 1.95 : 200 - (y - 712) * 2},${y} H${y < 650 ? 450 + (y - 540) * 1.05 + 52 : y < 712 ? 580 + (y - 650) * 1.95 : 700 + (y - 712) * 2}" stroke="#40261a" stroke-width="2"/>`)
        .join('');
    const silhouette = '#120b08';
    return svg(
        `
  <rect width="${W}" height="${H}" fill="url(#skyJ)"/>
  ${stars}
  <circle cx="450" cy="700" r="260" fill="url(#sunG)"/>
  <circle cx="450" cy="712" r="74" fill="#ffd796" opacity=".9"/>
  <path d="M0,820 V730 C110,716 200,660 280,600 C306,582 326,575 348,580 C400,618 520,700 650,738 C740,760 830,770 900,774 V820 Z" fill="#6e3d36" opacity=".8"/>
  <ellipse cx="335" cy="560" rx="22" ry="12" fill="#c9a6a0" opacity=".35"/><ellipse cx="350" cy="540" rx="28" ry="14" fill="#c9a6a0" opacity=".25"/>
  <path d="M0,800 H900 V940 H0 Z" fill="#3a2219"/>
  <path d="M0,830 H900 M0,858 H900 M0,884 H900" stroke="#4d2f22" stroke-width="2"/>
  ${[60, 120, 760, 840].map((x, i) => `<ellipse cx="${x}" cy="${790 - (i % 2) * 14}" rx="${70 + i * 8}" ry="${46 + i * 4}" fill="#24150f"/>`).join('')}
  <rect x="150" y="745" width="600" height="160" fill="url(#hall)" opacity=".85"/>
  ${[176, 292, 398, 494, 600, 712].map((x) => `<rect x="${x}" y="738" width="14" height="168" fill="${silhouette}"/>`).join('')}
  ${[300, 450, 600].map((x) => `<circle cx="${x}" cy="772" r="26" fill="#ffd48a" opacity=".35" filter="url(#softS)"/><rect x="${x - 7}" y="760" width="14" height="22" rx="3" fill="#ffe0a0"/>`).join('')}
  <path d="M396,538 H504 L582,652 H318 Z" fill="#2a1710"/>
  <path d="M318,650 H582 L702,714 H198 Z" fill="#26150e"/>
  <path d="M198,712 H702 L768,744 H132 Z" fill="#22130d"/>
  ${roofLines}
  <path d="M396,538 H504 L582,652 M318,650 L198,712 L132,744 M582,652 L702,714 L768,744 M396,538 L318,652" fill="none" stroke="#e39a5e" stroke-width="2.5" opacity=".55"/>
  <path d="M450,500 C462,516 466,528 462,538 H438 C434,528 438,516 450,500 Z" fill="url(#goldG)"/>
  <rect x="120" y="902" width="660" height="36" fill="#1a0f0a"/>
  <path d="M120,902 H780" stroke="#e39a5e" stroke-width="2" opacity=".5"/>
  <rect y="938" width="${W}" height="262" fill="url(#groundJ)"/>
  <path d="M410,938 H490 L690,1200 H210 Z" fill="#3b2418"/>
  ${[980, 1030, 1090, 1160].map((y) => `<path d="M${f(410 - (y - 938) * 0.763)},${y} H${f(490 + (y - 938) * 0.763)}" stroke="#2a190f" stroke-width="3"/>`).join('')}
  <!-- janur kuning -->
  ${[1, -1]
      .map((d) => {
          const x0 = d === 1 ? 170 : 730;
          const tip = [x0 + d * 150, 640];
          const arc = [
              [x0, 1200],
              [x0 - d * 20, 820],
              [x0 + d * 40, 560],
              tip,
          ];
          const tassels = along(
              [
                  [x0 + d * 6, 760],
                  [x0 + d * 4, 640],
                  [x0 + d * 60, 560],
                  tip,
              ],
              26,
          )
              .map(([x, y]) => `<path d="M${f(x)},${f(y)} q${d * 6},34 ${d * -4},64" fill="none" stroke="#f0d98e" stroke-width="5" stroke-linecap="round"/>`)
              .join('');
          return `<path d="M${arc[0]} C${arc[1]} ${arc[2]} ${arc[3]}" fill="none" stroke="#c9a54e" stroke-width="20" stroke-linecap="round"/>
                  <path d="M${arc[0]} C${arc[1]} ${arc[2]} ${arc[3]}" fill="none" stroke="#f1db93" stroke-width="7" stroke-linecap="round"/>${tassels}`;
      })
      .join('')}
  <!-- the couple walking to the pendhapa, seen from behind -->
  <g fill="${silhouette}" stroke="#e6a061" stroke-width="2" stroke-opacity=".5">
    <path d="M393,906 C392,898 444,898 443,906 L448,992 C454,1040 458,1080 461,1112 L376,1112 C380,1080 384,1040 389,992 Z"/>
    <circle cx="418" cy="872" r="21"/>
    <ellipse cx="418" cy="882" rx="25" ry="20"/>
    <path d="M442,912 C450,940 454,962 452,986" fill="none" stroke="${silhouette}" stroke-width="13" stroke-linecap="round"/>
    <path d="M458,900 C460,890 514,890 516,900 L521,994 L517,1112 L462,1112 L455,994 Z"/>
    <circle cx="487" cy="862" r="22"/>
    <ellipse cx="487" cy="878" rx="15" ry="12"/>
    <path d="M460,908 C454,940 450,962 452,986" fill="none" stroke="${silhouette}" stroke-width="13" stroke-linecap="round"/>
  </g>
  ${flower(406, 846, 6, C.goldL, C.goldL, 5)}${flower(418, 841, 6, C.goldL, C.goldL, 5)}${flower(430, 846, 6, C.goldL, C.goldL, 5)}
  ${ronce(
      [
          [432, 892],
          [440, 920],
          [436, 950],
          [440, 990],
      ],
      { step: 7, rx: 3.6, ry: 4.8, budEvery: 9 },
  )}
  <path d="M497,990 L522,946" stroke="#2e1d14" stroke-width="7" stroke-linecap="round"/>
  <path d="M510,950 C520,942 532,940 538,944 L532,956 C524,952 516,954 510,958 Z" fill="#3b2418" stroke="url(#goldG)" stroke-width="1.5"/>
  ${Array.from({ length: 14 }, () => `<circle cx="${f(80 + rnd() * 740)}" cy="${f(900 + rnd() * 260)}" r="${f(2 + rnd() * 3)}" fill="#ffd27a" opacity="${f(0.4 + rnd() * 0.5)}" filter="url(#softS)"/>`).join('')}
  <rect width="${W}" height="${H}" fill="url(#vigJ)"/>`,
        extra,
    );
}

/* ───────────── 3. Alun-Alun Kidul, malam hari (saling mengenal) ───────────── */
function alunAlun() {
    seed = 23;
    const stars = Array.from({ length: 70 }, () => `<circle cx="${f(rnd() * 900)}" cy="${f(rnd() * 560)}" r="${f(0.7 + rnd() * 1.5)}" fill="#fff" opacity="${f(0.25 + rnd() * 0.6)}"/>`).join('');
    const extra = `
      <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f20"/><stop offset=".55" stop-color="#1d1b35"/><stop offset=".8" stop-color="#42283a"/></linearGradient>
      <radialGradient id="moonG"><stop offset="0" stop-color="#fff4d6" stop-opacity=".9"/><stop offset=".3" stop-color="#f2dfb2" stop-opacity=".35"/><stop offset="1" stop-color="#f2dfb2" stop-opacity="0"/></radialGradient>
      <linearGradient id="fieldA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d22"/><stop offset="1" stop-color="#0e0a0c"/></linearGradient>
      ${vignette('vigA', 0.6)}`;
    const banyan = (cx) => {
        seed = cx;
        const pts = Array.from({ length: 34 }, () => {
            const a = rnd() * Math.PI * 2;
            const r = Math.sqrt(rnd());
            return [cx + Math.cos(a) * r * 120, 560 + Math.sin(a) * r * 105, 48 + rnd() * 32];
        });
        const blobs =
            pts.map(([x, y, r]) => `<circle cx="${f(x + 7)}" cy="${f(y - 7)}" r="${f(r)}" fill="#2a2638"/>`).join('') +
            pts.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#0b090c"/>`).join('');
        const roots = Array.from({ length: 22 }, () => {
            const x = cx - 110 + rnd() * 220;
            return `<path d="M${f(x)},${f(620 + rnd() * 40)} V${f(820 + rnd() * 60)}" stroke="#0b090c" stroke-width="${f(1.5 + rnd() * 2)}"/>`;
        }).join('');
        const posts = Array.from({ length: 9 }, (_, i) => `<rect x="${cx - 120 + i * 30 - 4}" y="842" width="8" height="58" fill="#3a2e2a"/>`).join('');
        return `<g>
          ${blobs}
          ${roots}
          <path d="M${cx - 34},900 C${cx - 30},820 ${cx - 22},720 ${cx - 14},600 H${cx + 14} C${cx + 22},720 ${cx + 30},820 ${cx + 34},900 Z" fill="#0b090c"/>
          <path d="M${cx - 124},852 H${cx + 124} M${cx - 124},880 H${cx + 124}" stroke="#4a3a33" stroke-width="5"/>${posts}
        </g>`;
    };
    const lights = [
        ['#ff6fb5', 300],
        ['#5fe0ff', 380],
        ['#ffe066', 520],
        ['#7dff9a', 600],
        ['#ff9a5f', 450],
        ['#c58bff', 250],
        ['#ff6fb5', 660],
    ]
        .map(([c, x], i) => `<circle cx="${x}" cy="${828 + (i % 3) * 8}" r="${10 + (i % 3) * 4}" fill="${c}" opacity=".75" filter="url(#softS)"/><circle cx="${x}" cy="${828 + (i % 3) * 8}" r="3" fill="#fff" opacity=".9"/>`)
        .join('');
    return svg(
        `
  <rect width="${W}" height="${H}" fill="url(#skyA)"/>
  ${stars}
  <circle cx="660" cy="230" r="160" fill="url(#moonG)"/>
  <circle cx="660" cy="230" r="46" fill="#f6e8c6"/>
  <circle cx="676" cy="220" r="9" fill="#e6d3a8" opacity=".6"/><circle cx="648" cy="246" r="6" fill="#e6d3a8" opacity=".6"/>
  <path d="M0,800 H900 V850 H0 Z" fill="#1b141c"/>
  ${Array.from({ length: 30 }, (_, i) => `<circle cx="${i * 31 + 8}" cy="${804 + (i % 4) * 3}" r="2" fill="#ffd38a" opacity=".7"/>`).join('')}
  ${lights}
  <rect y="840" width="${W}" height="360" fill="url(#fieldA)"/>
  <path d="M380,840 H520 L700,1200 H200 Z" fill="#2b2026" opacity=".7"/>
  ${banyan(205)}${banyan(695)}
  <g fill="#09070a">
    <path d="M416,960 C415,952 446,952 446,960 L452,1062 L410,1062 Z"/><circle cx="431" cy="936" r="15"/><path d="M418,932 C414,960 412,980 416,1000 L428,996 Z"/>
    <path d="M460,956 C460,948 494,948 494,956 L496,1030 L490,1068 L466,1068 L460,1030 Z"/><circle cx="477" cy="930" r="16"/>
    <path d="M446,972 C452,990 456,1000 460,1004 M462,966 C458,986 456,998 456,1004" fill="none" stroke="#09070a" stroke-width="9" stroke-linecap="round"/>
  </g>
  <path d="M422,934 H444" stroke="#e8d7b0" stroke-width="5" stroke-linecap="round" opacity=".85"/>
  <rect width="${W}" height="${H}" fill="url(#vigA)"/>`,
        extra,
    );
}

/* ───────────── 4. Peningset: cincin, daun sirih & melati di nampan ───────────── */
function peningset() {
    seed = 41;
    const extra = `
      <pattern id="kawungFill" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="#4b2c1b"/>
        <g fill="#c99e5c" stroke="#2e1a0f" stroke-width="3">
          <ellipse cx="60" cy="30" rx="18" ry="28"/><ellipse cx="60" cy="90" rx="18" ry="28"/>
          <ellipse cx="30" cy="60" rx="28" ry="18"/><ellipse cx="90" cy="60" rx="28" ry="18"/>
        </g>
        <circle cx="60" cy="60" r="5" fill="#e8cc88"/><circle cx="0" cy="0" r="5" fill="#e8cc88"/><circle cx="120" cy="120" r="5" fill="#e8cc88"/>
        <g fill="#2e1a0f"><circle cx="60" cy="30" r="3"/><circle cx="60" cy="90" r="3"/><circle cx="30" cy="60" r="3"/><circle cx="90" cy="60" r="3"/></g>
      </pattern>
      <radialGradient id="tray" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#9a6238"/><stop offset="1" stop-color="#5a3420"/></radialGradient>
      <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d9c48"/><stop offset="1" stop-color="#3f5a24"/></linearGradient>
      <radialGradient id="light" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="#ffe9c0" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      ${vignette('vigP', 0.75)}`;
    const leaf = (x, y, rot, s) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
          <path d="M0,-120 C64,-100 96,-24 64,40 C44,82 12,104 0,126 C-12,104 -44,82 -64,40 C-96,-24 -64,-100 0,-120 Z" fill="url(#leafG)" stroke="#2f4419" stroke-width="2"/>
          <path d="M0,-112 V118 M0,-40 C24,-56 40,-60 56,-50 M0,-40 C-24,-56 -40,-60 -56,-50 M0,20 C24,4 44,0 60,8 M0,20 C-24,4 -44,0 -60,8" fill="none" stroke="#a9c27a" stroke-width="2.4" opacity=".7"/>
        </g>`;
    const scallop = Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return `<circle cx="${f(450 + Math.cos(a) * 232)}" cy="${f(640 + Math.sin(a) * 232)}" r="14" fill="#f6eedb"/>`;
    }).join('');
    const ring = (x, y, rx, ry, w) =>
        `<ellipse cx="${x}" cy="${y + 10}" rx="${rx}" ry="${ry}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="${w}" filter="url(#softS)"/>
         <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#goldG)" stroke-width="${w}"/>
         <ellipse cx="${x}" cy="${y}" rx="${rx - w / 2 + 2}" ry="${ry - w / 2 + 2}" fill="none" stroke="${C.goldD}" stroke-width="2"/>
         <path d="M${x - rx * 0.7},${y - ry * 0.72} A${rx},${ry} 0 0 1 ${x + rx * 0.2},${y - ry}" fill="none" stroke="#fff6d8" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
    const petals = Array.from({ length: 16 }, () => {
        const a = rnd() * Math.PI * 2;
        const r = 120 + rnd() * 90;
        return `<ellipse cx="${f(450 + Math.cos(a) * r)}" cy="${f(640 + Math.sin(a) * r)}" rx="${f(10 + rnd() * 6)}" ry="${f(7 + rnd() * 4)}" fill="${rnd() > 0.35 ? '#a3282a' : '#f3e6e0'}" transform="rotate(${f(rnd() * 180)} ${f(450 + Math.cos(a) * r)} ${f(640 + Math.sin(a) * r)})" opacity=".92"/>`;
    }).join('');
    const loose = [
        [250, 470],
        [660, 520],
        [300, 820],
        [640, 800],
        [700, 660],
    ]
        .map(([x, y]) => flower(x, y, 16, C.melati, C.goldL, 5))
        .join('');
    const arc = (a0, a1, r) => {
        const p = (a) => [450 + Math.cos(a) * r, 640 + Math.sin(a) * r];
        const k = ((a1 - a0) / 3) * 1.0;
        const c1 = [p(a0)[0] - Math.sin(a0) * r * k * 1.33 * 0.75, p(a0)[1] + Math.cos(a0) * r * k * 1.33 * 0.75];
        const c2 = [p(a1)[0] + Math.sin(a1) * r * k * 1.33 * 0.75, p(a1)[1] - Math.cos(a1) * r * k * 1.33 * 0.75];
        return [p(a0), c1, c2, p(a1)];
    };
    return svg(
        `
  <rect width="${W}" height="${H}" fill="url(#kawungFill)"/>
  <circle cx="460" cy="660" r="320" fill="#000" opacity=".45" filter="url(#soft)"/>
  <circle cx="450" cy="640" r="306" fill="url(#tray)" stroke="#3a2214" stroke-width="6"/>
  <circle cx="450" cy="640" r="282" fill="none" stroke="#b07a4a" stroke-width="3" opacity=".6"/>
  ${[250, 200, 160].map((r) => `<circle cx="450" cy="640" r="${r + 20}" fill="none" stroke="#6a3e25" stroke-width="2" opacity=".5"/>`).join('')}
  ${scallop}<circle cx="450" cy="640" r="232" fill="#f6eedb"/>
  <circle cx="450" cy="640" r="214" fill="none" stroke="#e2d4b4" stroke-width="2" stroke-dasharray="3 7"/>
  ${petals}
  ${leaf(390, 640, -32, 1.05)}${leaf(510, 650, 30, 1)}${leaf(452, 600, 4, 1.1)}
  ${ronce(arc(Math.PI * 0.95, Math.PI * 1.55, 255), { step: 13, rx: 6.5, ry: 9, budEvery: 6 })}
  ${ronce(arc(Math.PI * 1.6, Math.PI * 2.2, 255), { step: 13, rx: 6.5, ry: 9, budEvery: 6 })}
  ${ring(420, 650, 74, 62, 18)}${ring(500, 620, 64, 54, 14)}
  <g transform="translate(500 566)"><path d="M-14,0 L0,-16 L14,0 L0,12 Z" fill="#f4fbff" stroke="#b9c6cc" stroke-width="2"/><path d="M-24,-26 l8,8 M24,-26 l-8,8 M0,-34 v10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>
  ${loose}
  <rect width="${W}" height="${H}" fill="url(#light)"/>
  <rect width="${W}" height="${H}" fill="url(#vigP)"/>`,
        extra,
    );
}

/* ───────────── 5. Nyanting: canting di atas kain kawung (pertama bertemu) ───────────── */
function batik() {
    seed = 5;
    const extra = `
      <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0ad74"/><stop offset=".5" stop-color="#b8693a"/><stop offset="1" stop-color="#6e3a1c"/></linearGradient>
      <linearGradient id="bamboo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd5a2"/><stop offset="1" stop-color="#b08a4e"/></linearGradient>
      <radialGradient id="warm" cx=".75" cy=".1" r=".95"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".3"/><stop offset="1" stop-color="#3a2416" stop-opacity=".22"/></radialGradient>
      ${vignette('vigB', 0.6)}`;
    const size = 150;
    const [cr, cc] = [4, 2]; // the unit being waxed
    const done = (r, c) => r < cr || (r === cr && c < cc);
    const unit = (x, y, style) =>
        [
            [x, y - size / 4, 22, 34],
            [x, y + size / 4, 22, 34],
            [x - size / 4, y, 34, 22],
            [x + size / 4, y, 34, 22],
        ]
            .map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${style}/>`)
            .join('') + `<circle cx="${x}" cy="${y}" r="5" ${style}/>`;
    const WAX = `fill="#caa56a" fill-opacity=".4" stroke="#996632" stroke-width="5"`;
    const SKETCH = `fill="none" stroke="#7d6c55" stroke-width="2" stroke-dasharray="6 6" opacity=".75"`;
    let motifs = '';
    for (let r = -1; r < 9; r++)
        for (let c = -1; c < 7; c++) {
            if (r === cr && c === cc) continue;
            motifs += unit(c * size + 75, r * size + 40, done(r, c) ? WAX + ` opacity="${r < cr - 1 ? 1 : 0.95}"` : SKETCH);
        }
    const [ux, uy] = [cc * size + 75, cr * size + 40];
    motifs += `<ellipse cx="${ux}" cy="${uy - size / 4}" rx="22" ry="34" ${WAX}/>
               <ellipse cx="${ux - size / 4}" cy="${uy}" rx="34" ry="22" ${WAX}/>
               <ellipse cx="${ux}" cy="${uy + size / 4}" rx="22" ry="34" ${WAX}/>
               <ellipse cx="${ux + size / 4}" cy="${uy}" rx="34" ry="22" ${SKETCH}/>
               <path d="M${ux + size / 4 - 34},${uy} A34,22 0 0 1 ${ux + size / 4 + 24},${uy - 15.6}" fill="none" stroke="#996632" stroke-width="5" stroke-linecap="round"/>`;
    const [tx, ty] = [ux + size / 4 + 24, uy - 15.6];
    const canting = `
      <g opacity=".3" filter="url(#softS)" transform="translate(30 36)">
        <path d="M64,-72 L380,-330" stroke="#000" stroke-width="22" stroke-linecap="round"/>
        <ellipse cx="44" cy="-58" rx="34" ry="26" fill="#000"/>
      </g>
      <path d="M64,-72 L380,-330" stroke="url(#bamboo)" stroke-width="20" stroke-linecap="round"/>
      <path d="M64,-72 L380,-330" stroke="#fff4d8" stroke-width="4" stroke-linecap="round" opacity=".45" transform="translate(-4 -5)"/>
      ${[0.36, 0.7].map((t) => `<path d="M${f(64 + 316 * t - 8)},${f(-72 - 258 * t - 9)} l16,18" stroke="#93703c" stroke-width="4" stroke-linecap="round"/>`).join('')}
      <path d="M22,-44 C10,-28 6,-16 0,0" fill="none" stroke="url(#copper)" stroke-width="5.5" stroke-linecap="round"/>
      <ellipse cx="44" cy="-58" rx="34" ry="26" fill="url(#copper)"/>
      <ellipse cx="48" cy="-70" rx="24" ry="10" fill="#4e2e14"/>
      <ellipse cx="48" cy="-71" rx="18" ry="6" fill="#d39b45" opacity=".9"/>
      <path d="M22,-62 C26,-46 54,-38 70,-50" fill="none" stroke="#ffd2a0" stroke-width="3" opacity=".6"/>
      <circle r="5" fill="#8c5c2a"/>`;
    return svg(
        `
  <rect width="${W}" height="${H}" fill="#efe1c2"/>
  ${Array.from({ length: 220 }, () => `<path d="M${f(rnd() * 900)},${f(rnd() * 1200)} h${f(8 + rnd() * 30)}" stroke="#d6c39b" stroke-width="1" opacity=".6"/>`).join('')}
  ${motifs}
  <g transform="translate(${tx} ${ty}) scale(1.45)">${canting}</g>
  <circle cx="860" cy="70" r="210" fill="#2b1a10"/>
  <circle cx="860" cy="70" r="182" fill="#5a3518"/>
  <circle cx="860" cy="70" r="160" fill="#a36b2c"/>
  <ellipse cx="800" cy="40" rx="70" ry="22" fill="#e3b464" opacity=".55"/>
  ${[700, 745, 790].map((x, i) => `<path d="M${x},${300 - i * 14} C${x - 22},${250 - i * 14} ${x + 22},${215 - i * 14} ${x},${170 - i * 14}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".2"/>`).join('')}
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  <rect width="${W}" height="${H}" fill="url(#vigB)"/>`,
        extra,
    );
}

const scenes = { couple, joglo, 'alun-alun': alunAlun, peningset, batik };
for (const [name, fn] of Object.entries(scenes)) writeFileSync(`${OUT}/${name}.svg`, fn());
console.log('scenes written');
