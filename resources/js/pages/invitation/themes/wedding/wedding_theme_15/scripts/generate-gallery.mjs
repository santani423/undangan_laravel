#!/usr/bin/env node
/**
 * Generates the demo gallery illustrations (clearly labelled as illustrations in the UI)
 * and the social preview image. Fully reproducible: `npm run assets:gallery`.
 *
 * Output:
 *   public/images/gallery/NN-name.webp          1200×1500
 *   public/images/gallery/thumbs/NN-name.webp    480×600
 *   public/images/og-cover.jpg                  1200×630
 *
 * Replace the gallery files with the couple's real photos for production.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'public/images/gallery')
const thumbDir = path.join(outDir, 'thumbs')

const W = 1200
const H = 1500
const C = {
  navy: '#171A35', midnight: '#24294B', lavender: '#8580B7', moon: '#B9D5F2', blush: '#F2C5D2',
  sage: '#A6C5A4', gold: '#F5D58B', cream: '#FFF8EE', deep: '#0f1130', teal: '#1f3b4d', tealB: '#2c4f5e',
}

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (n) => n.toFixed(1)

function defs() {
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.deep}"/><stop offset=".45" stop-color="${C.midnight}"/><stop offset=".8" stop-color="#4b4680"/><stop offset="1" stop-color="${C.lavender}"/>
    </linearGradient>
    <linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.deep}"/><stop offset=".5" stop-color="#2d2a58"/><stop offset=".85" stop-color="#6f5d94"/><stop offset="1" stop-color="#d9a6b9"/>
    </linearGradient>
    <radialGradient id="glowGold"><stop offset="0" stop-color="#FFF7C8" stop-opacity=".95"/><stop offset=".35" stop-color="${C.gold}" stop-opacity=".5"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowMoon"><stop offset="0" stop-color="#fff6dc" stop-opacity=".55"/><stop offset=".5" stop-color="${C.moon}" stop-opacity=".18"/><stop offset="1" stop-color="${C.moon}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowPink"><stop offset="0" stop-color="#ffe3ec" stop-opacity=".9"/><stop offset=".4" stop-color="${C.blush}" stop-opacity=".4"/><stop offset="1" stop-color="${C.blush}" stop-opacity="0"/></radialGradient>
    <radialGradient id="moonFace" cx=".38" cy=".36" r=".7"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#f6ecd6"/><stop offset="1" stop-color="#cfd9ee"/></radialGradient>
    <linearGradient id="paper" x1="0" x2="1"><stop stop-color="${C.blush}"/><stop offset=".5" stop-color="#FFF0C8"/><stop offset="1" stop-color="#E6A9B8"/></linearGradient>
    <linearGradient id="stream" x1="0" x2="1"><stop stop-color="#2a4c8a" stop-opacity="0"/><stop offset=".2" stop-color="#6fa3e6"/><stop offset=".8" stop-color="#6fa3e6"/><stop offset="1" stop-color="#2a4c8a" stop-opacity="0"/></linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0"/></filter>
  </defs>`
}

const sky = (id = 'sky') => `<rect width="${W}" height="${H}" fill="url(#${id})"/>`

function stars(r, n, yMax = H * 0.6) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = r() * W
    const y = Math.pow(r(), 1.4) * yMax
    const rad = 0.8 + Math.pow(r(), 4) * 3.2
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="${r() < 0.8 ? C.cream : C.moon}" opacity="${f(0.35 + r() * 0.6)}"/>`
  }
  return s
}

function moon(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r * 3.2}" fill="url(#glowMoon)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moonFace)"/>
  <g fill="#b9b4d7" opacity=".28"><circle cx="${cx - r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.14}"/><circle cx="${cx + r * 0.25}" cy="${cy + r * 0.25}" r="${r * 0.2}"/><circle cx="${cx + r * 0.1}" cy="${cy - r * 0.42}" r="${r * 0.08}"/></g>`
}

function ridge(r, y, amp, color, step = 40) {
  let d = `M0 ${H} L0 ${y}`
  const ph = r() * 10
  for (let x = 0; x <= W + step; x += step) {
    const yy = y - Math.sin(x * 0.004 + ph) * amp - Math.sin(x * 0.011 + ph * 2) * amp * 0.35
    d += ` L${x} ${f(yy)}`
  }
  return `<path d="${d} L${W} ${H} Z" fill="${color}"/>`
}

function roundTree(x, y, s, color, trunk = '#3a2f45') {
  return `<g>
    <rect x="${f(x - 7 * s)}" y="${f(y - 60 * s)}" width="${f(14 * s)}" height="${f(62 * s)}" rx="${f(6 * s)}" fill="${trunk}"/>
    <circle cx="${f(x)}" cy="${f(y - 95 * s)}" r="${f(58 * s)}" fill="${color}"/>
    <circle cx="${f(x - 42 * s)}" cy="${f(y - 70 * s)}" r="${f(36 * s)}" fill="${color}"/>
    <circle cx="${f(x + 44 * s)}" cy="${f(y - 74 * s)}" r="${f(38 * s)}" fill="${color}"/>
    <circle cx="${f(x - 15 * s)}" cy="${f(y - 130 * s)}" r="${f(32 * s)}" fill="${color}"/>
  </g>`
}

function pine(x, y, s, color) {
  let out = `<rect x="${f(x - 6 * s)}" y="${f(y - 30 * s)}" width="${f(12 * s)}" height="${f(32 * s)}" rx="4" fill="#33293d"/>`
  for (let k = 0; k < 3; k++) {
    const w = (70 - k * 16) * s
    const top = y - (60 + k * 52) * s - 50 * s
    const base = y - (20 + k * 52) * s
    out += `<path d="M${f(x - w)} ${f(base)} Q${f(x)} ${f(base + 14 * s)} ${f(x + w)} ${f(base)} L${f(x)} ${f(top)} Z" fill="${color}" stroke="${color}" stroke-width="${f(10 * s)}" stroke-linejoin="round"/>`
  }
  return out
}

function treeLine(r, y, n, scale, colors) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * W + (r() - 0.5) * 80
    const sc = scale * (0.8 + r() * 0.5)
    const col = colors[Math.floor(r() * colors.length)]
    s += r() < 0.5 ? roundTree(x, y + r() * 30, sc, col) : pine(x, y + r() * 30, sc, col)
  }
  return s
}

function glow(x, y, r, id = 'glowGold', op = 1) {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})" opacity="${op}"/>`
}

function fireflies(r, n, x0, y0, x1, y1) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0)
    const y = y0 + r() * (y1 - y0)
    const rad = 10 + r() * 22
    s += glow(x, y, rad, 'glowGold', 0.8) + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.5 + r() * 2)}" fill="#FFF8C6"/>`
  }
  return s
}

function lantern(x, y, s, string = 120) {
  return `<g>
    <line x1="${x}" y1="${f(y - string * s)}" x2="${x}" y2="${f(y - 44 * s)}" stroke="#d7c9a7" stroke-width="${f(2.5 * s)}" opacity=".7"/>
    ${glow(x, y, 120 * s)}
    <path d="M${f(x - 42 * s)} ${f(y - 40 * s)} Q${x} ${f(y - 56 * s)} ${f(x + 42 * s)} ${f(y - 40 * s)} L${f(x + 34 * s)} ${f(y + 44 * s)} Q${x} ${f(y + 58 * s)} ${f(x - 34 * s)} ${f(y + 44 * s)} Z" fill="url(#paper)" stroke="#FFF0C8" stroke-width="${f(3 * s)}"/>
    <path d="M${f(x - 20 * s)} ${f(y - 44 * s)} L${f(x - 16 * s)} ${f(y + 48 * s)} M${x} ${f(y - 48 * s)} V${f(y + 52 * s)} M${f(x + 20 * s)} ${f(y - 44 * s)} L${f(x + 16 * s)} ${f(y + 48 * s)}" stroke="#FFF8EE" stroke-opacity=".5" stroke-width="${f(2 * s)}" fill="none"/>
    <rect x="${f(x - 16 * s)}" y="${f(y - 52 * s)}" width="${f(32 * s)}" height="${f(10 * s)}" rx="4" fill="#8a6a6e"/>
    <rect x="${f(x - 14 * s)}" y="${f(y + 50 * s)}" width="${f(28 * s)}" height="${f(9 * s)}" rx="4" fill="#8a6a6e"/>
  </g>`
}

function mushroom(x, y, s, cap) {
  return `<g>
    ${glow(x, y - 50 * s, 90 * s, 'glowPink', 0.55)}
    <path d="M${f(x - 18 * s)} ${f(y - 50 * s)} Q${f(x - 20 * s)} ${f(y - 10 * s)} ${f(x - 14 * s)} ${y} H${f(x + 14 * s)} Q${f(x + 20 * s)} ${f(y - 10 * s)} ${f(x + 18 * s)} ${f(y - 50 * s)} Z" fill="#f8e6d2"/>
    <path d="M${f(x - 70 * s)} ${f(y - 48 * s)} Q${f(x - 66 * s)} ${f(y - 118 * s)} ${x} ${f(y - 120 * s)} Q${f(x + 66 * s)} ${f(y - 118 * s)} ${f(x + 70 * s)} ${f(y - 48 * s)} Q${x} ${f(y - 30 * s)} ${f(x - 70 * s)} ${f(y - 48 * s)} Z" fill="${cap}"/>
    <g fill="#FFF8EE" opacity=".9"><circle cx="${f(x - 26 * s)}" cy="${f(y - 84 * s)}" r="${f(9 * s)}"/><circle cx="${f(x + 18 * s)}" cy="${f(y - 98 * s)}" r="${f(7 * s)}"/><circle cx="${f(x + 40 * s)}" cy="${f(y - 66 * s)}" r="${f(6 * s)}"/></g>
  </g>`
}

function flower(x, y, s, color, stem = 90) {
  let petals = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    petals += `<ellipse cx="${f(x + Math.cos(a) * 12 * s)}" cy="${f(y - stem * s + Math.sin(a) * 12 * s)}" rx="${f(11 * s)}" ry="${f(8 * s)}" transform="rotate(${f((a * 180) / Math.PI)} ${f(x + Math.cos(a) * 12 * s)} ${f(y - stem * s + Math.sin(a) * 12 * s)})" fill="${color}"/>`
  }
  return `<path d="M${x} ${y} Q${f(x - 8 * s)} ${f(y - stem * 0.5 * s)} ${x} ${f(y - stem * s)}" stroke="#7fae8c" stroke-width="${f(4 * s)}" fill="none"/>${petals}<circle cx="${x}" cy="${f(y - stem * s)}" r="${f(6 * s)}" fill="${C.gold}"/>`
}

function meadow(r, y, n) {
  let s = ''
  const cols = [C.blush, C.moon, C.cream, '#c9b8f0', C.gold]
  for (let i = 0; i < n; i++) s += flower(r() * W, y + r() * (H - y), 0.6 + r() * 0.9, cols[Math.floor(r() * cols.length)], 50 + r() * 70)
  return s
}

function couple(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="-48" cy="-250" r="44" fill="#2a2239"/>
    <path d="M-120 -40 Q-112 -185 -48 -190 Q16 -185 24 -40 L10 0 H-106 Z" fill="#323a6e"/>
    <circle cx="48" cy="-244" r="41" fill="#3a2a40"/>
    <path d="M-20 0 Q-10 -160 48 -168 Q106 -160 122 0 Z" fill="#fbeff2"/>
    <path d="M60 -280 Q120 -200 130 -40" stroke="#fff8ee" stroke-opacity=".45" stroke-width="20" fill="none"/>
    <circle cx="20" cy="-110" r="22" fill="${C.blush}"/><circle cx="2" cy="-100" r="14" fill="${C.cream}"/>
  </g>`
}

function floralArch(cx, base, w, h) {
  const r = rng(9)
  const x0 = cx - w / 2
  const x1 = cx + w / 2
  let blooms = ''
  for (let i = 0; i < 70; i++) {
    const t = r()
    let x, y
    if (t < 0.3) { x = x0 + (r() - 0.5) * 30; y = base - t / 0.3 * (h * 0.55) }
    else if (t < 0.7) { const a = Math.PI * (1 - (t - 0.3) / 0.4); x = cx + Math.cos(a) * w / 2; y = base - h * 0.55 - Math.sin(a) * h * 0.45 }
    else { x = x1 + (r() - 0.5) * 30; y = base - (t - 0.7) / 0.3 * (h * 0.55) }
    const col = [C.blush, C.cream, '#c9b8f0', '#efb3c6'][Math.floor(r() * 4)]
    blooms += `<circle cx="${f(x + (r() - 0.5) * 26)}" cy="${f(y + (r() - 0.5) * 26)}" r="${f(10 + r() * 14)}" fill="${col}" stroke="#fff0f5" stroke-width="2"/>`
    if (r() < 0.5) blooms += `<ellipse cx="${f(x + (r() - 0.5) * 40)}" cy="${f(y + (r() - 0.5) * 40)}" rx="16" ry="7" fill="#7fae8c" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`
  }
  return `<path d="M${x0} ${base} V${base - h * 0.55} A${w / 2} ${h * 0.45} 0 0 1 ${x1} ${base - h * 0.55} V${base}" fill="none" stroke="#6f9a7e" stroke-width="22" stroke-linecap="round"/>${blooms}`
}

function petals(r, n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = r() * W
    const y = r() * H
    const sc = 0.6 + r() * 1.2
    s += `<path d="M${f(x)} ${f(y)} q${f(14 * sc)} ${f(-10 * sc)} ${f(28 * sc)} 0 q${f(-14 * sc)} ${f(12 * sc)} ${f(-28 * sc)} 0Z" fill="${[C.blush, '#f7d7e1', C.cream, '#efb3c6'][i % 4]}" opacity="${f(0.55 + r() * 0.45)}" transform="rotate(${f(r() * 360)} ${f(x)} ${f(y)})"/>`
  }
  return s
}

function frame(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${content}
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="30" fill="none" stroke="${C.cream}" stroke-opacity=".18" stroke-width="3"/>
  </svg>`
}

const scenes = {
  '01-moonlit-hills': () => {
    const r = rng(1)
    return frame(`${sky()}${stars(r, 160)}${moon(820, 380, 120)}
      ${ridge(r, 860, 90, '#3a3c68')}${treeLine(r, 930, 9, 1.0, ['#2d3a5f', '#334465'])}
      ${ridge(r, 1050, 70, '#263e4d')}${treeLine(r, 1120, 7, 1.5, ['#1f3b4d', '#25465a'])}
      ${ridge(r, 1260, 50, '#1a2f3d')}${fireflies(r, 18, 80, 900, 1120, 1350)}${meadow(r, 1300, 26)}`)
  },
  '02-twilight-lanterns': () => {
    const r = rng(2)
    let ls = ''
    ;[[250, 520, 1.3, 380], [520, 700, 1.7, 560], [830, 560, 1.4, 420], [1010, 820, 1.1, 650], [400, 1000, 1.0, 820]].forEach(([x, y, s, str]) => (ls += lantern(x, y, s, str)))
    return frame(`${sky('skyWarm')}${stars(r, 120, 700)}
      <path d="M-40 140 Q600 260 1240 120" stroke="#3b2f45" stroke-width="34" fill="none" stroke-linecap="round"/>
      <path d="M-40 120 Q600 240 1240 100" stroke="#5b4660" stroke-width="10" fill="none" opacity=".6"/>
      ${glow(600, 760, 520, 'glowGold', 0.25)}${ls}${fireflies(r, 26, 60, 200, 1140, 1400)}`)
  },
  '03-mushroom-garden': () => {
    const r = rng(3)
    return frame(`${sky()}${stars(r, 120, 600)}${moon(260, 300, 70)}
      ${ridge(r, 900, 60, '#2c3a5a')}${treeLine(r, 960, 8, 1.2, ['#24394f', '#2a4560'])}
      ${ridge(r, 1120, 40, '#22384a')}
      ${mushroom(380, 1270, 2.4, '#ef9fbd')}${mushroom(700, 1330, 1.6, '#9cc6f2')}${mushroom(900, 1240, 2.0, '#b9a6f2')}${mushroom(200, 1360, 1.1, '#a8dcb6')}
      ${meadow(r, 1300, 30)}${fireflies(r, 20, 80, 800, 1120, 1300)}`)
  },
  '04-floral-arch': () => {
    const r = rng(4)
    return frame(`${sky('skyWarm')}${stars(r, 120, 640)}${moon(900, 300, 90)}
      ${ridge(r, 1040, 50, '#33305e')}${treeLine(r, 1100, 8, 1.2, ['#2b3460', '#33406a'])}
      <ellipse cx="600" cy="1290" rx="520" ry="80" fill="#2a3a4a"/>
      ${glow(600, 900, 420, 'glowPink', 0.35)}${floralArch(600, 1290, 560, 820)}${couple(600, 1290, 1.25)}
      ${petals(r, 40)}${meadow(r, 1330, 20)}`)
  },
  '05-little-bridge': () => {
    const r = rng(5)
    return frame(`${sky()}${stars(r, 140, 600)}${moon(300, 320, 80)}
      ${ridge(r, 860, 60, '#323a62')}${treeLine(r, 940, 9, 1.1, ['#24394f', '#2f4766'])}
      ${ridge(r, 1050, 30, '#203545')}
      <path d="M-20 1180 Q600 1080 1220 1200 L1220 1290 Q600 1170 -20 1270 Z" fill="url(#stream)" opacity=".9"/>
      ${glow(600, 1180, 300, 'glowMoon', 0.8)}
      <path d="M260 1240 Q600 1010 940 1240" stroke="#8a6a6e" stroke-width="40" fill="none" stroke-linecap="round"/>
      <path d="M270 1160 Q600 940 930 1160" stroke="#a7868a" stroke-width="10" fill="none"/>
      ${[0.15, 0.32, 0.5, 0.68, 0.85].map((t) => { const x = 270 + t * 660; const y = 1160 - Math.sin(t * Math.PI) * 220 * 0.9; return `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y + 70)}" stroke="#a7868a" stroke-width="8"/>` }).join('')}
      ${ridge(r, 1320, 20, '#1a2f3d')}${meadow(r, 1340, 18)}${fireflies(r, 22, 60, 900, 1140, 1350)}`)
  },
  '06-petal-sky': () => {
    const r = rng(6)
    return frame(`${sky('skyWarm')}${stars(r, 200, 1100)}${moon(600, 520, 150)}
      ${petals(r, 90)}${ridge(r, 1300, 50, '#2b3460')}${treeLine(r, 1360, 10, 0.9, ['#1f2a4d', '#283560'])}`)
  },
  '07-wishing-tree': () => {
    const r = rng(7)
    let tags = ''
    for (let i = 0; i < 26; i++) {
      const x = 330 + r() * 540
      const y = 700 + r() * 220
      tags += `<line x1="${f(x)}" y1="${f(y - 60)}" x2="${f(x)}" y2="${f(y)}" stroke="#e9dcc0" stroke-width="2" opacity=".6"/>${glow(x, y + 22, 40, 'glowGold', 0.6)}<rect x="${f(x - 12)}" y="${f(y)}" width="24" height="38" rx="5" fill="${C.cream}"/>`
    }
    return frame(`${sky()}${stars(r, 150, 600)}${moon(980, 260, 70)}
      ${ridge(r, 1100, 40, '#2c3460')}
      <path d="M560 1300 Q570 1050 540 880 Q600 860 660 880 Q630 1050 640 1300 Z" fill="#4a3a52"/>
      <path d="M600 900 Q470 820 380 760 M600 900 Q740 820 830 750 M600 900 Q610 780 600 700" stroke="#4a3a52" stroke-width="26" fill="none" stroke-linecap="round"/>
      ${[[600, 560, 230], [400, 640, 170], [800, 640, 170], [480, 470, 150], [720, 470, 150], [600, 400, 140]].map(([x, y, rr], i) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${['#c79bc6', '#d7a6cf', '#b9a3e0', '#e8b8d2', '#c79bc6', '#f0c4d8'][i]}"/>`).join('')}
      ${tags}${ridge(r, 1310, 20, '#1d2f3f')}${meadow(r, 1320, 22)}${fireflies(r, 18, 100, 400, 1100, 1300)}`)
  },
  '08-forest-path': () => {
    const r = rng(8)
    let ls = ''
    for (let i = 0; i < 5; i++) {
      const t = i / 4
      const y = 1350 - t * 520
      const sc = 1.2 - t * 0.85
      const dx = 330 - t * 220
      ls += lantern(600 - dx + Math.sin(t * 4) * 40, y - 200 * sc, sc, 140) + lantern(600 + dx + Math.sin(t * 4) * 40, y - 220 * sc, sc, 140)
    }
    return frame(`${sky()}${stars(r, 140, 650)}${moon(600, 400, 90)}
      ${ridge(r, 860, 40, '#33395f')}${treeLine(r, 900, 12, 0.8, ['#2b3460', '#2f4766'])}
      <path d="M440 ${H} Q520 1180 590 860 L610 860 Q680 1180 760 ${H} Z" fill="#7d7096" opacity=".85"/>
      ${treeLine(r, 1250, 4, 2.1, ['#1f3b4d', '#22425a'])}${ls}${meadow(r, 1250, 24)}${fireflies(r, 24, 60, 600, 1140, 1350)}`)
  },
}

function ogCover() {
  const r = rng(11)
  const w = 1200
  const h = 630
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    ${stars(r, 120, 380)}${moon(860, 170, 70)}
    <g transform="translate(0 -880)">${ridge(r, 1320, 50, '#3a3c68')}${treeLine(r, 1380, 10, 0.9, ['#2d3a5f', '#334465'])}${ridge(r, 1430, 40, '#263e4d')}</g>
    ${lantern(240, 300, 0.9, 260)}${lantern(980, 360, 0.7, 340)}${fireflies(r, 16, 40, 260, 1160, 600)}
    ${floralArch(600, 600, 300, 430)}
  </svg>`
}

await mkdir(thumbDir, { recursive: true })
for (const [name, build] of Object.entries(scenes)) {
  const svg = Buffer.from(build())
  const img = sharp(svg, { density: 72 })
  await img.clone().webp({ quality: 82 }).toFile(path.join(outDir, `${name}.webp`))
  await img.clone().resize(480, 600).webp({ quality: 78 }).toFile(path.join(thumbDir, `${name}.webp`))
  console.log('✓', name)
}
await sharp(Buffer.from(ogCover())).jpeg({ quality: 84 }).toFile(path.join(root, 'public/images/og-cover.jpg'))
console.log('✓ og-cover.jpg')
