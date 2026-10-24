import { calendarParts, formatEventDay, formatTimeRange } from '../lib/date';
import type { PartyEvent, SmileConfig } from '../lib/types';
import { BODY_FONT, canvasTexture, DISPLAY_FONT, drawContained, drawCovered, fitText, roundedRect, wrapLines } from './textures';

/*
 * Canvas artwork for in-world surfaces. Text always comes from the invitation, and the
 * supplied SVG illustrations are composited in where they fit.
 */

export type ImageMap = Map<string, HTMLImageElement | null>;

const INK = '#20435d';

export function invitationCardTexture(config: SmileConfig, images: ImageMap) {
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

        const friend = images.get('toothFriend');
        const balloons = images.get('balloons');
        if (friend) drawContained(ctx, friend, 60, h - 270, 210, 210);
        if (balloons) drawContained(ctx, balloons, w - 250, 60, 190, 214);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#9b83e7';
        fitText(ctx, config.copy.invitationHeading, 560, 64, 600);
        ctx.fillText(config.copy.invitationHeading, w / 2, 168);

        ctx.fillStyle = '#e46d99';
        fitText(ctx, config.child.name, 600, 170, 700);
        ctx.fillText(config.child.name, w / 2, 340);

        ctx.fillStyle = INK;
        const turning = config.child.age ? `genap ${config.child.age} tahun!` : 'berulang tahun!';
        fitText(ctx, turning, 560, 50, 800, BODY_FONT);
        ctx.fillText(turning, w / 2, 420);

        ctx.fillStyle = '#2d94c6';
        const day = formatEventDay(config.event);
        const time = formatTimeRange(config.event);
        if (day) {
            fitText(ctx, day, 640, 34, 700, BODY_FONT);
            ctx.fillText(day, w / 2, 502);
        }
        if (time) {
            fitText(ctx, time, 640, 34, 700, BODY_FONT);
            ctx.fillText(time, w / 2, 548);
        }
    });
}

/** Calendar face modelled on calendar.svg: pink header, big blue day number. */
export function calendarTexture(event: PartyEvent) {
    const parts = calendarParts(event);
    return canvasTexture(512, 564, (ctx, w) => {
        ctx.fillStyle = '#fff8ef';
        roundedRect(ctx, 0, 0, w, 564, 54);
        ctx.fill();
        ctx.fillStyle = '#ff9fc2';
        roundedRect(ctx, 0, 0, w, 150, 54);
        ctx.fill();
        ctx.fillRect(0, 90, w, 60);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = `700 76px ${DISPLAY_FONT}`;
        ctx.fillText(parts?.month ?? 'Pesta', w / 2, 106);
        ctx.fillStyle = '#5ab9dd';
        ctx.font = `700 250px ${DISPLAY_FONT}`;
        ctx.fillText(parts ? String(parts.day) : '★', w / 2, 410);
        ctx.fillStyle = INK;
        ctx.font = `800 56px ${BODY_FONT}`;
        ctx.fillText(parts?.weekday ?? '', w / 2, 500);
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
        (
            [
                ['12', 0],
                ['3', 3],
                ['6', 6],
                ['9', 9],
            ] as const
        ).forEach(([label, i]) => {
            const a = (i / 12) * Math.PI * 2;
            ctx.fillText(label, Math.sin(a) * 140, -Math.cos(a) * 140 + 4);
        });
    });
}

export function rsvpBoardTexture(images: ImageMap) {
    return canvasTexture(1024, 620, (ctx, w, h) => {
        ctx.fillStyle = '#fff8ef';
        roundedRect(ctx, 0, 0, w, h, 40);
        ctx.fill();
        const mascot = images.get('mascot');
        if (mascot) drawContained(ctx, mascot, 30, 60, 420, 520);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e46d99';
        ctx.font = `700 190px ${DISPLAY_FONT}`;
        ctx.fillText('RSVP', 470, 250);
        ctx.fillStyle = INK;
        ctx.font = `800 46px ${BODY_FONT}`;
        const lines = wrapLines(ctx, 'Kamu bisa datang ke pesta?', 500);
        lines.forEach((line, i) => ctx.fillText(line, 474, 340 + i * 58));
        ctx.fillStyle = '#2d94c6';
        ctx.font = `700 36px ${BODY_FONT}`;
        ctx.fillText('Balas di kotak surat!', 474, 340 + lines.length * 58 + 40);
    });
}

/** Instant-photo style card. If the photo failed to load, a friendly placeholder is drawn. */
export function polaroidTexture(image: HTMLImageElement | null, caption: string) {
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
            ctx.fillText('Foto segera hadir', w / 2, w / 2);
        }
        ctx.fillStyle = INK;
        ctx.textAlign = 'center';
        fitText(ctx, caption || '', w - 60, 40, 600);
        ctx.fillText(caption || '', w / 2, h - 40);
    });
}

export function bannerTexture(text: string) {
    return canvasTexture(1400, 300, (ctx, w) => {
        // Ribbon with folded ends.
        ctx.fillStyle = '#e46d99';
        (
            [
                [0, 1],
                [w, -1],
            ] as const
        ).forEach(([x, dir]) => {
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
