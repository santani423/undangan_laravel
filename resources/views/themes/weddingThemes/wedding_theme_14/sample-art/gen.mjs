// Generates the illustrated sample photos for wedding_theme_14 (Pawiwahan Agung, adat Jawa Yogyakarta).
// Faceless-style flat illustrations in the theme palette (sogan, emas, gading). Output: svg/*.svg (900×1200).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = `${dirname(fileURLToPath(import.meta.url))}/svg`;
mkdirSync(OUT, { recursive: true });

const C = {
    deep: '#21140d',
    soganD: '#3d2618',
    sogan: '#5f3b27',
    teak: '#7a4a2c',
    gold: '#c9a14f',
    goldL: '#e8cc88',
    goldD: '#94702f',
    ivory: '#f2e6cc',
    skin: '#c78c5e',
    skinS: '#a87049',
    skinL: '#d9a374',
    hair: '#16100c',
    velvet: '#151013',
    melati: '#fbf7ee',
    leaf: '#6f8a4e',
    leafD: '#4e6636',
    lip: '#a5463d',
};

const W = 900;
const H = 1200;
const f = (n) => +n.toFixed(1);
const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${f(900 - x)},${y}`);

/** Points along a cubic bezier, spaced ~step px apart, with tangent angle. */
function along([p0, p1, p2, p3], step) {
    const at = (t) => {
        const u = 1 - t;
        return [
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ];
    };
    const pts = [];
    let last = at(0);
    pts.push([...last, 0]);
    for (let t = 0.002; t <= 1; t += 0.002) {
        const p = at(t);
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= step) {
            const ang = (Math.atan2(p[1] - last[1], p[0] - last[0]) * 180) / Math.PI;
            pts.push([...p, ang]);
            last = p;
        }
    }
    return pts;
}

/** Strand of jasmine buds (ronce melati) along a bezier. */
function ronce(curve, { step = 13, rx = 7, ry = 9.5, budEvery = 6 } = {}) {
    return along(curve, step)
        .map(([x, y, a], i) =>
            i % budEvery === budEvery - 1
                ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx * 0.7}" ry="${ry * 0.8}" fill="${C.leaf}" transform="rotate(${f(a + 90)} ${f(x)} ${f(y)})"/>`
                : `<g transform="rotate(${f(a + 90)} ${f(x)} ${f(y)})"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="${C.melati}" stroke="#d9cfb8" stroke-width="1.4"/><ellipse cx="${f(x - rx * 0.3)}" cy="${f(y - ry * 0.35)}" rx="${rx * 0.35}" ry="${ry * 0.3}" fill="#fff" opacity=".9"/></g>`,
        )
        .join('');
}

/** Small six-petal flower (cunduk mentul head, embroidery). */
function flower(x, y, r, fill, center = C.ivory, petals = 6) {
    let s = '';
    for (let i = 0; i < petals; i++) {
        const a = (i * 360) / petals;
        s += `<ellipse cx="${f(x)}" cy="${f(y - r * 0.6)}" rx="${f(r * 0.38)}" ry="${f(r * 0.62)}" fill="${fill}" transform="rotate(${a} ${f(x)} ${f(y)})"/>`;
    }
    return s + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.32)}" fill="${center}"/>`;
}

const defs = `
<defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26170e"/><stop offset="1" stop-color="#43291a"/></linearGradient>
  <linearGradient id="archG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5634"/><stop offset=".55" stop-color="#5f3b27"/><stop offset="1" stop-color="#3a2416"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".38" r=".55"><stop offset="0" stop-color="#e2ae6e" stop-opacity=".75"/><stop offset=".6" stop-color="#b07644" stop-opacity=".25"/><stop offset="1" stop-color="#5f3b27" stop-opacity="0"/></radialGradient>
  <radialGradient id="skinG" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="${C.skinL}"/><stop offset=".7" stop-color="${C.skin}"/><stop offset="1" stop-color="${C.skinS}"/></radialGradient>
  <linearGradient id="velvetG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d2429"/><stop offset=".45" stop-color="${C.velvet}"/><stop offset="1" stop-color="#0b080a"/></linearGradient>
  <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldL}"/><stop offset=".5" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldD}"/></linearGradient>
  <pattern id="kawung" width="84" height="84" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${C.gold}" stroke-width="1.6" opacity=".22">
      <ellipse cx="42" cy="21" rx="12" ry="19"/><ellipse cx="42" cy="63" rx="12" ry="19"/>
      <ellipse cx="21" cy="42" rx="19" ry="12"/><ellipse cx="63" cy="42" rx="19" ry="12"/>
    </g>
    <circle cx="42" cy="42" r="2.4" fill="${C.gold}" opacity=".3"/>
  </pattern>
  <pattern id="parang" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <rect width="36" height="36" fill="#4a2b1a"/>
    <path d="M0,18 C9,6 9,30 18,18 S27,6 36,18" fill="none" stroke="${C.goldL}" stroke-width="3" opacity=".75"/>
    <path d="M0,4 H36 M0,32 H36" stroke="#2a170d" stroke-width="3"/>
    <circle cx="18" cy="26" r="2" fill="${C.ivory}" opacity=".7"/>
  </pattern>
  <pattern id="batikBand" width="28" height="28" patternUnits="userSpaceOnUse">
    <rect width="28" height="28" fill="${C.sogan}"/>
    <circle cx="14" cy="14" r="5" fill="none" stroke="${C.goldL}" stroke-width="1.6"/><circle cx="0" cy="0" r="2" fill="${C.goldL}"/><circle cx="28" cy="28" r="2" fill="${C.goldL}"/>
  </pattern>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="softS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>`;

const ARCH = 'M140,1200 V500 C140,300 300,168 450,168 C600,168 760,300 760,500 V1200';
const ARCH_IN = 'M156,1200 V503 C156,314 308,184 450,184 C592,184 744,314 744,503 V1200';

function portraitBackground() {
    return `
  <rect width="${W}" height="${H}" fill="url(#bgG)"/>
  <rect width="${W}" height="${H}" fill="url(#kawung)"/>
  <path d="${ARCH} Z" fill="url(#archG)"/>
  <path d="${ARCH} Z" fill="url(#glow)"/>
  <path d="${ARCH_IN} Z" fill="url(#kawung)" opacity=".7"/>
  <path d="${ARCH}" fill="none" stroke="url(#goldG)" stroke-width="5"/>
  <path d="${ARCH_IN}" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity=".7"/>
  <g transform="translate(450 168)">
    <path d="M0,-30 C10,-18 18,-8 22,0 C18,8 10,18 0,30 C-10,18 -18,8 -22,0 C-18,-8 -10,-18 0,-30 Z" fill="url(#goldG)"/>
    <circle r="7" fill="${C.soganD}"/><circle cx="-42" r="5" fill="${C.gold}"/><circle cx="42" r="5" fill="${C.gold}"/>
  </g>`;
}

/* ───────────────────────── Bride (paes ageng Yogyakarta) ───────────────────────── */

function paes() {
    const shapes = [
        'M420,436 C418,466 431,487 450,494 C469,487 482,466 480,436 C468,443 432,443 420,436 Z', // gajahan
        'M391,446 C388,466 395,482 407,491 C412,476 411,460 404,443 Z', // pengapit
        'M369,465 C366,481 371,494 380,501 C384,489 384,476 379,462 Z', // penitis
        'M357,505 C349,523 350,545 362,561 C364,554 361,545 366,538 C364,526 362,514 357,505 Z', // godheg
    ];
    const all = [...shapes, ...shapes.slice(1).map(mirror)];
    return (
        all.map((d) => `<path d="${d}" fill="#0d0907" stroke="${C.gold}" stroke-width="2.6" stroke-linejoin="round"/>`).join('') +
        // cithak between the eyebrows
        `<path d="M450,512 L456,520 L450,528 L444,520 Z" fill="#1d3a26" stroke="${C.gold}" stroke-width="1.2"/>`
    );
}

function brideFigure(bottom = 1260) {
    const necklace = [
        [392, 760, 830, 508, 6],
        [379, 781, 885, 521, 7],
        [366, 803, 940, 534, 8],
    ];
    const dots = along(
        [
            [366, 803],
            [405, 878],
            [495, 878],
            [534, 803],
        ],
        26,
    )
        .map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y + 9)}" r="6" fill="url(#goldG)"/><circle cx="${f(x)}" cy="${f(y + 9)}" r="2.2" fill="#8b2a22"/>`)
        .join('');
    const sprigs = [
        [210, 1020],
        [290, 930],
        [180, 1140],
        [262, 1100],
        [340, 1060],
    ]
        .flatMap(([x, y]) => [
            [x, y],
            [900 - x, y],
        ])
        .map(([x, y]) => flower(x, y, 13, C.gold, C.goldL, 5))
        .join('');
    return `
  <!-- sanggul bokor (behind) -->
  <ellipse cx="450" cy="492" rx="156" ry="152" fill="${C.hair}"/>
  <ellipse cx="450" cy="478" rx="140" ry="128" fill="none" stroke="#3b2d28" stroke-width="3" opacity=".6"/>
  <!-- ronce melati, back strand -->
  ${ronce([
      [584, 500],
      [640, 640],
      [612, 790],
      [652, 990],
  ])}
  <!-- neck, chest -->
  <path d="M404,630 L404,760 Q450,792 496,760 L496,630 Z" fill="${C.skin}"/>
  <ellipse cx="450" cy="664" rx="64" ry="20" fill="${C.skinS}" opacity=".55"/>
  <g transform="translate(0 -38)">
  <path d="M396,738 L504,738 L562,806 L450,992 L338,806 Z" fill="url(#skinG)"/>
  <path d="M398,902 L502,902 L450,992 Z" fill="url(#batikBand)"/>
  <!-- kebaya beludru -->
  <path d="M100,${bottom} C106,962 214,842 338,806 L450,992 L450,${bottom} Z" fill="url(#velvetG)"/>
  <path d="M800,${bottom} C794,962 686,842 562,806 L450,992 L450,${bottom} Z" fill="url(#velvetG)"/>
  ${sprigs}
  <path d="M338,806 L450,992 L562,806" fill="none" stroke="url(#goldG)" stroke-width="16" stroke-linejoin="round"/>
  <path d="M338,806 L450,992 L562,806" fill="none" stroke="${C.goldD}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
  <!-- kalung susun -->
  ${necklace.map(([x1, y1, cy, x2, w]) => `<path d="M${x1},${y1} Q450,${cy} ${x2},${y1}" fill="none" stroke="url(#goldG)" stroke-width="${w}" stroke-linecap="round"/>`).join('')}
  ${dots}
  <path d="M450,872 C462,884 466,898 450,916 C434,898 438,884 450,872 Z" fill="url(#goldG)" stroke="${C.goldD}" stroke-width="1.5"/>
  <circle cx="450" cy="896" r="5" fill="#8b2a22"/>
  </g>
  <!-- ears + suweng -->
  <ellipse cx="347" cy="556" rx="17" ry="31" fill="${C.skin}"/><ellipse cx="553" cy="556" rx="17" ry="31" fill="${C.skin}"/>
  <circle cx="347" cy="594" r="11" fill="url(#goldG)"/><circle cx="347" cy="594" r="4.5" fill="#fff"/>
  <circle cx="553" cy="594" r="11" fill="url(#goldG)"/><circle cx="553" cy="594" r="4.5" fill="#fff"/>
  <!-- face -->
  <path d="M350,530 C350,446 395,410 450,410 C505,410 550,446 550,530 C550,610 505,672 450,674 C395,672 350,610 350,530 Z" fill="url(#skinG)"/>
  <!-- hair dome over the forehead -->
  <path d="M342,524 C336,420 384,350 450,348 C516,350 564,420 558,524 C550,476 522,442 450,440 C378,442 350,476 342,524 Z" fill="${C.hair}"/>
  <path d="M380,392 C405,370 430,362 450,361" fill="none" stroke="#45372f" stroke-width="3" opacity=".7"/>
  ${paes()}
  <!-- alis menjangan ranggah -->
  <path d="M393,535 Q413,522 435,530" fill="none" stroke="#1a120e" stroke-width="4" stroke-linecap="round"/>
  <path d="M398,531 L389,517 M394,526 L383,521" fill="none" stroke="#1a120e" stroke-width="2.4" stroke-linecap="round"/>
  <path d="${mirror('M393,535 Q413,522 435,530')}" fill="none" stroke="#1a120e" stroke-width="4" stroke-linecap="round"/>
  <path d="${mirror('M398,531 L389,517 M394,526 L383,521')}" fill="none" stroke="#1a120e" stroke-width="2.4" stroke-linecap="round"/>
  <!-- serene closed eyes, nose, lips, blush -->
  <path d="M398,566 Q415,553 433,566" fill="none" stroke="#2a1810" stroke-width="3.2" stroke-linecap="round"/>
  <path d="${mirror('M398,566 Q415,553 433,566')}" fill="none" stroke="#2a1810" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M447,566 Q441,596 448,604 Q455,608 462,601" fill="none" stroke="${C.skinS}" stroke-width="3" stroke-linecap="round"/>
  <path d="M431,628 Q441,619 450,624 Q459,619 469,628 Q450,644 431,628 Z" fill="${C.lip}"/>
  <ellipse cx="392" cy="602" rx="22" ry="12" fill="#d9705f" opacity=".22"/><ellipse cx="508" cy="602" rx="22" ry="12" fill="#d9705f" opacity=".22"/>
  <!-- cunduk mentul + pethat gunungan -->
  ${[
      [450, 372, 452, 236],
      [426, 376, 396, 256],
      [474, 376, 504, 256],
      [404, 386, 346, 290],
      [496, 386, 554, 290],
  ]
      .map(
          ([bx, by, hx, hy]) =>
              `<path d="M${bx},${by} Q${f((bx + hx) / 2 + (hx - bx) * 0.15 + 4)},${f((by + hy) / 2)} ${hx},${hy}" fill="none" stroke="${C.goldD}" stroke-width="3"/>` +
              flower(hx, hy, 19, 'url(#goldG)', '#8b2a22'),
      )
      .join('')}
  <path d="M420,384 C427,352 439,333 450,320 C461,333 473,352 480,384 Z" fill="url(#goldG)" stroke="${C.goldD}" stroke-width="2"/>
  <path d="M450,334 V378 M436,360 H464" stroke="${C.goldD}" stroke-width="2"/>
  <!-- ronce melati, front strand (gajah ngoling) -->
  ${ronce([
      [560, 478],
      [606, 600],
      [585, 760],
      [618, 950],
  ])}`;
}

/* ───────────────────────── Groom (blangkon + beskap) ───────────────────────── */

function groomFigure(bottom = 1260) {
    const closure = [
        [455, 840],
        [475, 930],
        [522, 1060],
        [548, 1200],
    ];
    const buttons = along(closure, 62)
        .slice(0, 5)
        .map(([x, y]) => `<circle cx="${f(x - 16)}" cy="${f(y + 14)}" r="8.5" fill="url(#goldG)" stroke="${C.goldD}" stroke-width="1.2"/>`)
        .join('');
    const wiron = [
        'M376,494 C378,450 396,410 424,382',
        'M398,480 C404,440 420,404 444,378',
        'M424,472 C430,436 442,404 458,380',
        'M524,494 C522,450 504,410 476,382',
        'M502,480 C496,440 480,404 456,378',
    ];
    const corsage = [
        [612, 930],
        [632, 918],
        [650, 934],
        [628, 948],
        [608, 952],
        [644, 956],
    ]
        .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="14" fill="${C.melati}" stroke="#d9cfb8" stroke-width="1.4" transform="rotate(${i * 37} ${x} ${y})"/>`)
        .join('');
    return `
  <!-- neck -->
  <path d="M402,640 L402,790 L498,790 L498,640 Z" fill="${C.skin}"/>
  <ellipse cx="450" cy="688" rx="58" ry="13" fill="${C.skinS}" opacity=".4"/>
  <g transform="translate(0 -36)">
  <!-- beskap -->
  <path d="M84,${bottom} C90,952 206,846 350,818 L404,792 L496,792 L550,818 C694,846 810,952 816,${bottom} Z" fill="url(#velvetG)"/>
  <path d="M350,818 C300,880 286,980 300,1200 M550,818 C600,880 614,980 600,1200" fill="none" stroke="#2c2328" stroke-width="3" opacity=".8"/>
  <path d="M${closure[0]} C${closure[1]} ${closure[2]} ${closure[3]}" fill="none" stroke="url(#goldG)" stroke-width="5"/>
  ${buttons}
  <path d="M392,772 Q450,804 508,772 L508,820 Q450,850 392,820 Z" fill="#1e171a" stroke="url(#goldG)" stroke-width="3.5"/>
  <!-- ronce melati corsage -->
  <path d="M600,960 C590,930 600,905 622,905" fill="none" stroke="${C.leafD}" stroke-width="3"/>
  <ellipse cx="598" cy="935" rx="9" ry="17" fill="${C.leaf}" transform="rotate(-30 598 935)"/>
  <ellipse cx="660" cy="940" rx="9" ry="17" fill="${C.leaf}" transform="rotate(35 660 940)"/>
  ${corsage}
  ${ronce(
      [
          [628, 962],
          [622, 1000],
          [636, 1040],
          [630, 1090],
      ],
      { step: 14, rx: 7, ry: 10, budEvery: 5 },
  )}
  </g>
  <!-- ears -->
  <ellipse cx="348" cy="566" rx="18" ry="32" fill="${C.skin}"/><ellipse cx="552" cy="566" rx="18" ry="32" fill="${C.skin}"/>
  <ellipse cx="350" cy="566" rx="8" ry="18" fill="${C.skinS}" opacity=".5"/><ellipse cx="550" cy="566" rx="8" ry="18" fill="${C.skinS}" opacity=".5"/>
  <!-- face -->
  <path d="M352,540 C352,456 395,424 450,424 C505,424 548,456 548,540 C548,616 514,684 450,688 C386,684 352,616 352,540 Z" fill="url(#skinG)"/>
  <path d="M355,500 L368,500 L366,566 L356,560 Z" fill="${C.hair}"/><path d="${mirror('M355,500 L368,500 L366,566 L356,560 Z')}" fill="${C.hair}"/>
  <!-- blangkon -->
  <path d="M336,532 C326,428 368,352 450,346 C532,352 574,428 564,532 C550,506 528,480 450,472 C372,480 350,506 336,532 Z" fill="url(#parang)"/>
  <path d="M336,532 C350,506 372,480 450,472 C528,480 550,506 564,532" fill="none" stroke="url(#goldG)" stroke-width="5"/>
  ${wiron.map((d) => `<path d="${d}" fill="none" stroke="#24140b" stroke-width="3.2" opacity=".8"/>`).join('')}
  <path d="M372,392 C400,362 430,354 450,353" fill="none" stroke="${C.goldL}" stroke-width="3" opacity=".35"/>
  <!-- brows, closed eyes, nose, smile -->
  <path d="M390,532 Q412,518 436,527" fill="none" stroke="#1a120e" stroke-width="6.5" stroke-linecap="round"/>
  <path d="${mirror('M390,532 Q412,518 436,527')}" fill="none" stroke="#1a120e" stroke-width="6.5" stroke-linecap="round"/>
  <path d="M397,569 Q415,556 433,569" fill="none" stroke="#2a1810" stroke-width="3.4" stroke-linecap="round"/>
  <path d="${mirror('M397,569 Q415,556 433,569')}" fill="none" stroke="#2a1810" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M446,568 Q439,602 447,612 Q456,617 465,608" fill="none" stroke="${C.skinS}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M428,640 Q450,654 472,640" fill="none" stroke="#6b3529" stroke-width="4" stroke-linecap="round"/>`;
}

function svg(body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${body}</svg>`;
}

writeFileSync(`${OUT}/bride.svg`, svg(portraitBackground() + `<g transform="translate(450 600) scale(1.22) translate(-450 -560)">${brideFigure()}</g>`));
writeFileSync(`${OUT}/groom.svg`, svg(portraitBackground() + `<g transform="translate(450 600) scale(1.22) translate(-450 -560)">${groomFigure()}</g>`));

export { C, W, H, defs, svg, along, ronce, flower, mirror, brideFigure, groomFigure, portraitBackground, OUT, f };
