import { calendarParts, formatEventDay, formatPlainDate, formatTimeRange } from '../utils/date.js';
import { BODY_FONT, DISPLAY_FONT, canvasTexture, drawContained, drawCovered, fitText, roundedRect, wrapLines } from './textures.js';

/*
 * Canvas artwork for in-world surfaces. Text always comes from the invitation config,
 * and the supplied SVG illustrations are composited in where they fit.
 * `images` is a Map of asset key → HTMLImageElement (or null if it failed to load).
 */

const INK = '#20435d';

export function invitationCardTexture(config, images) {
  return canvasTexture(1024, 680, (ctx, w, h) => {
    ctx.fillStyle = '#fff8ef';
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ff9fc2';
    roundedRect(ctx, 22, 22, w - 44, h - 44, 46);
    ctx.stroke();
    ctx.setLineDash([4, 14]);
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#c8b5ff';
    roundedRect(ctx, 48, 48, w - 96, h - 96, 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Confetti dots
    const dots = ['#ffca55', '#78d5f4', '#93dcae', '#ff8fb7'];
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = dots[i % dots.length];
      const x = 80 + ((i * 137) % (w - 160));
      const y = i % 2 ? 80 + ((i * 53) % 60) : h - 90 - ((i * 41) % 50);
      ctx.beginPath();
      ctx.arc(x, y, 6 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (images.get('toothFriend')) drawContained(ctx, images.get('toothFriend'), 60, h - 270, 210, 210);
    if (images.get('balloons')) drawContained(ctx, images.get('balloons'), w - 250, 60, 190, 214);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#9b83e7';
    fitText(ctx, config.copy.invitationHeading, 560, 64, 600);
    ctx.fillText(config.copy.invitationHeading, w / 2, 168);

    ctx.fillStyle = '#e46d99';
    fitText(ctx, config.child.name, 600, 170, 700);
    ctx.fillText(config.child.name, w / 2, 340);

    ctx.fillStyle = INK;
    ctx.font = `800 50px ${BODY_FONT}`;
    ctx.fillText(`is turning ${config.child.age}!`, w / 2, 420);

    ctx.font = `700 34px ${BODY_FONT}`;
    ctx.fillStyle = '#2d94c6';
    ctx.fillText(formatEventDay(config.event), w / 2, 502);
    ctx.fillText(formatTimeRange(config.event), w / 2, 548);
  });
}

/** Calendar face modelled on images/calendar.svg: pink header, big blue day number. */
export function calendarTexture(event) {
  const parts = calendarParts(event);
  return canvasTexture(512, 564, (ctx, w, h) => {
    ctx.fillStyle = '#fff8ef';
    roundedRect(ctx, 0, 0, w, h, 54);
    ctx.fill();
    ctx.fillStyle = '#ff9fc2';
    roundedRect(ctx, 0, 0, w, 150, 54);
    ctx.fill();
    ctx.fillRect(0, 90, w, 60);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `700 76px ${DISPLAY_FONT}`;
    ctx.fillText(parts.month, w / 2, 106);
    ctx.fillStyle = '#5ab9dd';
    ctx.font = `700 250px ${DISPLAY_FONT}`;
    ctx.fillText(String(parts.day), w / 2, 410);
    ctx.fillStyle = INK;
    ctx.font = `800 56px ${BODY_FONT}`;
    ctx.fillText(parts.weekday, w / 2, 500);
    ctx.fillStyle = '#ffd76f';
    ctx.beginPath();
    ctx.arc(w - 66, 230, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b9e9c8';
    ctx.beginPath();
    ctx.arc(66, 230, 18, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function clockTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#fff8ef';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.fillStyle = i % 3 === 0 ? '#ff8fb7' : '#c8b5ff';
      ctx.beginPath();
      ctx.arc(Math.sin(a) * 205, -Math.cos(a) * 205, i % 3 === 0 ? 16 : 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = INK;
    ctx.font = `700 64px ${DISPLAY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [['12', 0], ['3', 3], ['6', 6], ['9', 9]].forEach(([label, i]) => {
      const a = (i / 12) * Math.PI * 2;
      ctx.fillText(label, Math.sin(a) * 140, -Math.cos(a) * 140 + 4);
    });
  });
}

export function rsvpBoardTexture(config, images) {
  return canvasTexture(1024, 620, (ctx, w, h) => {
    ctx.fillStyle = '#fff8ef';
    roundedRect(ctx, 0, 0, w, h, 40);
    ctx.fill();
    if (images.get('mascot')) drawContained(ctx, images.get('mascot'), 30, 60, 420, 520);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e46d99';
    ctx.font = `700 190px ${DISPLAY_FONT}`;
    ctx.fillText('RSVP', 470, 250);
    ctx.fillStyle = INK;
    ctx.font = `800 46px ${BODY_FONT}`;
    const lines = wrapLines(ctx, 'Will you join the party?', 500);
    lines.forEach((line, i) => ctx.fillText(line, 474, 340 + i * 58));
    const deadline = formatPlainDate(config.rsvp.deadline, config.event.locale);
    if (deadline) {
      ctx.fillStyle = '#2d94c6';
      ctx.font = `700 36px ${BODY_FONT}`;
      ctx.fillText(`Reply by ${deadline}`, 474, 340 + lines.length * 58 + 40);
    }
  });
}

/** Instant-photo style card. If the photo failed to load, a friendly placeholder is drawn. */
export function polaroidTexture(image, caption) {
  return canvasTexture(460, 550, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    if (image) {
      drawCovered(ctx, image, 28, 28, w - 56, w - 56);
    } else {
      ctx.fillStyle = '#e8f6fb';
      ctx.fillRect(28, 28, w - 56, w - 56);
      ctx.fillStyle = '#55b9dc';
      ctx.font = `700 34px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('Photo coming soon', w / 2, w / 2);
    }
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    fitText(ctx, caption || '', w - 60, 40, 600);
    ctx.fillText(caption || '', w / 2, h - 40);
  });
}

export function bannerTexture(text) {
  return canvasTexture(1400, 300, (ctx, w, h) => {
    // Ribbon with folded ends.
    ctx.fillStyle = '#e46d99';
    [[0, 1], [w, -1]].forEach(([x, dir]) => {
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x + dir * 150, 70);
      ctx.lineTo(x + dir * 150, 260);
      ctx.lineTo(x, 260);
      ctx.lineTo(x + dir * 60, 165);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = '#ff8fb7';
    roundedRect(ctx, 110, 30, w - 220, 200, 36);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitText(ctx, text, w - 320, 120, 700);
    ctx.fillText(text, w / 2, 135);
  });
}
