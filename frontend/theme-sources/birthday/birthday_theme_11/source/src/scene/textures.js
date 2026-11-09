import * as THREE from 'three';

// Canvas-drawn textures: labels, gradients, stripes. Everything here is generated at
// runtime, so the project needs no bitmap texture files.

export const DISPLAY_FONT = '"Fredoka", "Nunito", system-ui, sans-serif';
export const BODY_FONT = '"Nunito", system-ui, sans-serif';

export function canvasTexture(width, height, draw, { repeat = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Shrinks the font until `text` fits `maxWidth`. Returns the chosen size. */
export function fitText(ctx, text, maxWidth, startSize, weight = 700, family = DISPLAY_FONT) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > 10);
  return size;
}

export function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

let softDot;
/** White radial falloff — used for glows, sparkles and soft blob shadows (tinted by material color). */
export function softDotTexture() {
  if (!softDot) {
    softDot = canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.65)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }
  return softDot;
}

let blob;
export function blobShadowTexture() {
  if (!blob) {
    blob = canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(32,67,93,0.55)');
      g.addColorStop(0.6, 'rgba(32,67,93,0.2)');
      g.addColorStop(1, 'rgba(32,67,93,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }
  return blob;
}

/** Diagonal candy stripes, e.g. for candles and poles. */
export function stripeTexture(colors = ['#ffffff', '#ff8fb7'], stripes = 6) {
  return canvasTexture(
    128,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = colors[1];
      const step = w / stripes;
      for (let i = -stripes; i < stripes * 2; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * step, h);
        ctx.lineTo((i + 1) * step, h);
        ctx.lineTo((i + 1) * step + h, 0);
        ctx.lineTo(i * step + h, 0);
        ctx.closePath();
        ctx.fill();
      }
    },
    { repeat: true },
  );
}

/** Lollipop swirl for disc faces. */
export function swirlTexture(a = '#ffffff', b = '#ff8fb7') {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = b;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 7; t += 0.05) {
      const r = (t / (Math.PI * 7)) * (w / 2 - 12);
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image ${url}`));
    img.src = url;
  });
}

/** Draws an image "contain"-fitted into a box. */
export function drawContained(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || w;
  const ih = img.naturalHeight || img.height || h;
  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Draws an image "cover"-fitted into a box. */
export function drawCovered(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || w;
  const ih = img.naturalHeight || img.height || h;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}
