import { CalendarDays, Heart, House, Layers, LayoutGrid, MailOpen, Menu, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { SCENES } from '../../config/scenes'
import type { SceneId } from '../../config/types'
import { useUi } from '../../state/journey'

type NavProps = { onJump: (index: number) => void; onLite?: () => void; liteLabel?: string }

/** Scenes that get their own tab on phones; the rest live under "Lainnya". */
const PRIMARY_TABS: { id: SceneId; label: string; icon: LucideIcon }[] = [
  { id: 'gate', label: 'Sampul', icon: House },
  { id: 'pendopo', label: 'Mempelai', icon: Heart },
  { id: 'ceremony', label: 'Acara', icon: CalendarDays },
  { id: 'rsvp', label: 'RSVP', icon: MailOpen },
]

/** Closes a popover on Escape (returning focus to its trigger) or on a pointer-down outside it. */
function useDismiss(open: boolean, setOpen: (open: boolean) => void, panel: RefObject<HTMLElement | null>, trigger: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open, setOpen, panel, trigger])
}

function SceneList({ current, onPick, onLite, liteLabel }: { current: number; onPick: (index: number) => void; onLite?: () => void; liteLabel: string }) {
  return (
    <>
      <nav aria-label="Bagian undangan">
        <ol>
          {SCENES.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-current={i === current ? 'step' : undefined}
                className={`flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left transition-colors ${i === current ? 'bg-teak text-ivory' : 'text-deep hover:bg-champagne/15'}`}
              >
                <span className="w-4 text-[0.7rem] tabular-nums opacity-60">{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-[0.92rem] leading-tight">{s.label}</span>
                  <span className={`block text-[0.66rem] uppercase tracking-[0.2em] ${i === current ? 'text-champagne-light' : 'text-champagne'}`}>{s.javanese}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {onLite && (
        <button type="button" onClick={onLite} className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-champagne/30 px-3 py-2.5 text-left text-[0.8rem] text-teak hover:bg-champagne/15">
          <Layers size={15} aria-hidden="true" /> {liteLabel}
        </button>
      )}
    </>
  )
}

/** Scene navigation: a top-left menu on desktop, an app-style bottom tab bar on phones. */
export function SceneNav(props: NavProps) {
  return (
    <>
      <DesktopMenu {...props} />
      <MobileTabBar {...props} />
    </>
  )
}

function DesktopMenu({ onJump, onLite, liteLabel = 'Tampilan ringan (tanpa 3D)' }: NavProps) {
  const current = useUi((s) => s.sceneIndex)
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  useDismiss(open, setOpen, panel, button)

  return (
    <div className="fixed top-[max(env(safe-area-inset-top),14px)] left-5 z-[60] hidden md:block">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="scene-menu"
        aria-label="Navigasi undangan"
        className="grid h-11 w-11 place-items-center rounded-full border border-champagne/70 bg-deep/70 text-ivory shadow-lg backdrop-blur-md hover:bg-deep"
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>
      {open && (
        <div ref={panel} id="scene-menu" className="jawa-panel relative mt-2 w-64 rounded-2xl p-2">
          <SceneList
            current={current}
            onPick={(i) => {
              setOpen(false)
              onJump(i)
            }}
            onLite={onLite}
            liteLabel={liteLabel}
          />
        </div>
      )}
    </div>
  )
}

function MobileTabBar({ onJump, onLite, liteLabel = 'Tampilan ringan (tanpa 3D)' }: NavProps) {
  const current = useUi((s) => s.sceneIndex)
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const more = useRef<HTMLButtonElement>(null)
  useDismiss(open, setOpen, sheet, more)

  const currentId = SCENES[current]?.id
  const inPrimary = PRIMARY_TABS.some((t) => t.id === currentId)
  const tabClass = (active: boolean) =>
    `relative flex flex-1 flex-col items-center justify-center gap-1 text-[0.64rem] tracking-[0.06em] transition-colors ${active ? 'text-champagne-light' : 'text-ivory/65 active:text-ivory'}`
  const indicator = <span className="absolute top-0 h-[7px] w-[7px] -translate-y-1/2 rotate-45 bg-champagne-light" aria-hidden="true" />

  return (
    <div className="md:hidden">
      {open && <div className="fixed inset-0 z-[58] bg-ink/45 backdrop-blur-[2px]" aria-hidden="true" />}
      {open && (
        <div
          ref={sheet}
          id="scene-sheet"
          className="jawa-panel fixed inset-x-3 bottom-[calc(var(--mobile-nav-h)+8px)] z-[59] max-h-[min(64lvh,560px)] overflow-y-auto rounded-2xl p-2"
        >
          <SceneList
            current={current}
            onPick={(i) => {
              setOpen(false)
              onJump(i)
            }}
            onLite={onLite}
            liteLabel={liteLabel}
          />
        </div>
      )}
      <nav
        aria-label="Navigasi undangan"
        className="fixed inset-x-0 bottom-0 z-[60] flex h-[var(--mobile-nav-h)] border-t border-champagne/50 bg-deep/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(20,12,8,0.35)] backdrop-blur-md"
      >
        {PRIMARY_TABS.map(({ id, label, icon: Icon }) => {
          const index = SCENES.findIndex((s) => s.id === id)
          const active = !open && currentId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOpen(false)
                onJump(index)
              }}
              aria-current={active ? 'step' : undefined}
              className={tabClass(active)}
            >
              {active && indicator}
              <Icon size={20} strokeWidth={active ? 2.1 : 1.7} aria-hidden="true" />
              {label}
            </button>
          )
        })}
        <button
          ref={more}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="scene-sheet"
          className={tabClass(open || !inPrimary)}
        >
          {(open || !inPrimary) && indicator}
          {open ? <X size={20} strokeWidth={2.1} aria-hidden="true" /> : <LayoutGrid size={20} strokeWidth={inPrimary ? 1.7 : 2.1} aria-hidden="true" />}
          {open ? 'Tutup' : 'Lainnya'}
        </button>
      </nav>
    </div>
  )
}

/** Thin vertical rail on the right: scene ticks + live progress fill (desktop only). */
export function ProgressRail({ fillRef, onJump }: { fillRef: RefObject<HTMLDivElement | null>; onJump: (index: number) => void }) {
  const current = useUi((s) => s.sceneIndex)
  return (
    <div className="pointer-events-none fixed top-1/2 right-4 z-[55] hidden h-[56vh] -translate-y-1/2 md:block" aria-hidden="true">
      <div className="relative h-full w-px bg-ivory/25">
        <div ref={fillRef} className="absolute top-0 left-0 w-px origin-top bg-champagne-light" style={{ height: '100%', transform: 'scaleY(0)' }} />
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            tabIndex={-1}
            onClick={() => onJump(i)}
            className="group pointer-events-auto absolute -left-[5px] -translate-y-1/2"
            style={{ top: `${s.navAt * 100}%` }}
          >
            <span className={`block h-[11px] w-[11px] rotate-45 border transition-colors ${i === current ? 'border-champagne-light bg-champagne-light' : 'border-ivory/60 bg-deep/60'}`} />
            <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 whitespace-nowrap rounded-full bg-deep/80 px-2.5 py-1 text-[0.7rem] text-ivory opacity-0 transition-opacity group-hover:opacity-100">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
