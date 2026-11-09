import { CalendarDays, Heart, House, Layers, LayoutGrid, MailOpen, Menu, X, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTheme } from '../lib/context';
import { useUi } from '../lib/journey';
import { SCENES } from '../lib/scenes';
import type { SceneConfig, SceneId } from '../lib/types';

/** `onJump` receives the index into SCENES (the full journey), not into the filtered list. */
type NavProps = { onJump: (index: number) => void; onLite?: () => void; liteLabel?: string };

/** Scenes that get their own tab on phones; the rest live under "Lainnya". */
const PRIMARY_TABS: { id: SceneId; label: string; icon: LucideIcon }[] = [
    { id: 'gate', label: 'Sampul', icon: House },
    { id: 'pendopo', label: 'Mempelai', icon: Heart },
    { id: 'ceremony', label: 'Acara', icon: CalendarDays },
    { id: 'rsvp', label: 'RSVP', icon: MailOpen },
];

const indexOf = (id: SceneId) => SCENES.findIndex((s) => s.id === id);

/** Closes a popover on Escape (returning focus to its trigger) or on a pointer-down outside it. */
function useDismiss(open: boolean, setOpen: (open: boolean) => void, panel: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
            }
        };
        const onDown = (e: PointerEvent) => {
            if (!panel.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('pointerdown', onDown);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('pointerdown', onDown);
        };
    }, [open, setOpen, panel, trigger]);
}

function SceneList({
    scenes,
    current,
    onPick,
    onLite,
    liteLabel,
}: {
    scenes: SceneConfig[];
    current: number;
    onPick: (index: number) => void;
    onLite?: () => void;
    liteLabel: string;
}) {
    return (
        <>
            <nav aria-label="Bagian undangan">
                <ol className="wt14-scene-list">
                    {scenes.map((s, n) => {
                        const i = indexOf(s.id);
                        const on = i === current;
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onClick={() => onPick(i)}
                                    aria-current={on ? 'step' : undefined}
                                    className={on ? 'wt14-scene-on' : ''}
                                >
                                    <span className="wt14-scene-num">{n + 1}</span>
                                    <span className="wt14-scene-text">
                                        <span className="wt14-scene-label">{s.label}</span>
                                        <span className="wt14-scene-jv">{s.javanese}</span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
            {onLite && (
                <button type="button" onClick={onLite} className="wt14-scene-lite">
                    <Layers size={15} aria-hidden="true" /> {liteLabel}
                </button>
            )}
        </>
    );
}

/** Scene navigation: a top-left menu on desktop, an app-style bottom tab bar on phones. */
export function SceneNav(props: NavProps) {
    return (
        <>
            <DesktopMenu {...props} />
            <MobileTabBar {...props} />
        </>
    );
}

function DesktopMenu({ onJump, onLite, liteLabel = 'Tampilan ringan (tanpa 3D)' }: NavProps) {
    const { scenes } = useTheme();
    const current = useUi((s) => s.sceneIndex);
    const [open, setOpen] = useState(false);
    const panel = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    useDismiss(open, setOpen, panel, button);

    return (
        <div className="wt14-menu">
            <button
                ref={button}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="wt14-scene-menu"
                aria-label="Navigasi undangan"
                className="wt14-round"
            >
                {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
            {open && (
                <div ref={panel} id="wt14-scene-menu" className="wt14-panel wt14-menu-panel">
                    <SceneList
                        scenes={scenes}
                        current={current}
                        onPick={(i) => {
                            setOpen(false);
                            onJump(i);
                        }}
                        onLite={onLite}
                        liteLabel={liteLabel}
                    />
                </div>
            )}
        </div>
    );
}

function MobileTabBar({ onJump, onLite, liteLabel = 'Tampilan ringan (tanpa 3D)' }: NavProps) {
    const { scenes } = useTheme();
    const current = useUi((s) => s.sceneIndex);
    const [open, setOpen] = useState(false);
    const sheet = useRef<HTMLDivElement>(null);
    const more = useRef<HTMLButtonElement>(null);
    useDismiss(open, setOpen, sheet, more);

    const tabs = PRIMARY_TABS.filter((t) => scenes.some((s) => s.id === t.id));
    const currentId = SCENES[current]?.id;
    const inPrimary = tabs.some((t) => t.id === currentId);
    const indicator = <span className="wt14-tab-indicator" aria-hidden="true" />;

    return (
        <div className="wt14-mobile-nav">
            {open && <div className="wt14-sheet-backdrop" aria-hidden="true" />}
            {open && (
                <div ref={sheet} id="wt14-scene-sheet" className="wt14-panel wt14-sheet">
                    <SceneList
                        scenes={scenes}
                        current={current}
                        onPick={(i) => {
                            setOpen(false);
                            onJump(i);
                        }}
                        onLite={onLite}
                        liteLabel={liteLabel}
                    />
                </div>
            )}
            <nav aria-label="Navigasi undangan" className="wt14-tabbar">
                {tabs.map(({ id, label, icon: Icon }) => {
                    const active = !open && currentId === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onJump(indexOf(id));
                            }}
                            aria-current={active ? 'step' : undefined}
                            className={`wt14-tabbar-btn ${active ? 'wt14-tabbar-on' : ''}`}
                        >
                            {active && indicator}
                            <Icon size={20} strokeWidth={active ? 2.1 : 1.7} aria-hidden="true" />
                            {label}
                        </button>
                    );
                })}
                <button
                    ref={more}
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="wt14-scene-sheet"
                    className={`wt14-tabbar-btn ${open || !inPrimary ? 'wt14-tabbar-on' : ''}`}
                >
                    {(open || !inPrimary) && indicator}
                    {open ? (
                        <X size={20} strokeWidth={2.1} aria-hidden="true" />
                    ) : (
                        <LayoutGrid size={20} strokeWidth={inPrimary ? 1.7 : 2.1} aria-hidden="true" />
                    )}
                    {open ? 'Tutup' : 'Lainnya'}
                </button>
            </nav>
        </div>
    );
}

/** Thin vertical rail on the right: scene ticks + live progress fill (desktop only). */
export function ProgressRail({ fillRef, onJump }: { fillRef: RefObject<HTMLDivElement | null>; onJump: (index: number) => void }) {
    const { scenes } = useTheme();
    const current = useUi((s) => s.sceneIndex);
    return (
        <div className="wt14-rail" aria-hidden="true">
            <div className="wt14-rail-track">
                <div ref={fillRef} className="wt14-rail-fill" />
                {scenes.map((s) => {
                    const i = indexOf(s.id);
                    return (
                        <button
                            key={s.id}
                            type="button"
                            tabIndex={-1}
                            onClick={() => onJump(i)}
                            className="wt14-rail-tick"
                            style={{ top: `${s.navAt * 100}%` }}
                        >
                            <span className={`wt14-rail-dot ${i === current ? 'wt14-rail-on' : ''}`} />
                            <span className="wt14-rail-label">{s.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
