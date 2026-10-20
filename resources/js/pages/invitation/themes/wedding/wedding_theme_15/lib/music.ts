import { MusicBox } from './musicBox';
import { setApp, showToast } from './store';

interface Player {
    play(): Promise<void>;
    pause(): void;
    dispose(): void;
}

class FilePlayer implements Player {
    private el: HTMLAudioElement;
    constructor(src: string, loop: boolean) {
        this.el = new Audio(src);
        this.el.loop = loop;
        this.el.preload = 'none';
        this.el.volume = 0.6;
        this.el.addEventListener('ended', () => setApp({ musicOn: false }));
    }
    play() {
        return this.el.play();
    }
    pause() {
        this.el.pause();
    }
    dispose() {
        this.el.pause();
        this.el.removeAttribute('src');
        this.el.load();
    }
}

/**
 * Background music: the invitation's uploaded track, or the theme's generative music box.
 * Pauses while the tab is hidden and resumes when it is shown again.
 */
export class MusicPlayer {
    private player: Player | null = null;
    private on = false;
    private resumeOnShow = false;

    constructor(
        private readonly src: string,
        private readonly loop: boolean,
    ) {
        document.addEventListener('visibilitychange', this.onVisibility);
    }

    private get p(): Player {
        return (this.player ??= this.src ? new FilePlayer(this.src, this.loop) : new MusicBox());
    }

    /** Must be called from a user gesture (click/tap) the first time. */
    async set(on: boolean) {
        try {
            if (on) await this.p.play();
            else this.player?.pause();
            this.on = on;
            setApp({ musicOn: on });
        } catch {
            this.on = false;
            setApp({ musicOn: false });
            showToast('Musik tidak dapat diputar di perangkat ini.');
        }
    }

    private onVisibility = () => {
        if (document.hidden && this.on) {
            this.resumeOnShow = true;
            void this.set(false);
        } else if (!document.hidden && this.resumeOnShow) {
            this.resumeOnShow = false;
            void this.set(true);
        }
    };

    dispose() {
        document.removeEventListener('visibilitychange', this.onVisibility);
        this.player?.dispose();
        this.player = null;
    }
}
