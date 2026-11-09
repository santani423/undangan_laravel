import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { SECTIONS } from './config/journey';
import { setExperience, useExperience } from './store/experience';
import { journey } from './store/journey';
import { celebrate } from './store/celebrations';
import { music } from './audio/audioEngine';
import { useReducedMotion } from './hooks/useReducedMotion';
import { ScrollTrigger, useScrollCamera } from './hooks/useScrollCamera';
import { useMusic } from './hooks/useMusic';
import { useTypingState } from './hooks/useTypingState';
import { detectQuality, isWebGLAllowed } from './utils/device';
import { lockScroll } from './utils/scrollLock';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider, useToast } from './components/ui/Toast';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { StaticWorldFallback } from './components/layout/StaticWorldFallback';
import { TopBar } from './components/layout/TopBar';
import { TravelSpacer } from './components/layout/TravelSpacer';
import { InvitationCover } from './components/invitation/InvitationCover';
import { BirthdayProfile } from './components/invitation/BirthdayProfile';
import { EventDetails } from './components/invitation/EventDetails';
import { MemoryGallery } from './components/invitation/MemoryGallery';
import { RSVPSection } from './components/invitation/RSVPSection';
import { DigitalGift } from './components/invitation/DigitalGift';
import { ThankYou } from './components/invitation/ThankYou';
import { Lightbox } from './components/invitation/Lightbox';

// The 3D world (three.js, R3F, drei) is split into its own chunk and loaded in parallel.
const ToyWorldCanvas = lazy(() => import('./components/scene/ToyWorldCanvas'));

/** Scenes 2–5. Memoised so opening the cover only toggles `inert` on the wrapper. */
const InvitationSections = memo(function InvitationSections({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <TravelSpacer label={SECTIONS[1].travelLabel} />
      <BirthdayProfile />
      <TravelSpacer label={SECTIONS[2].travelLabel} />
      <EventDetails />
      <TravelSpacer label={SECTIONS[3].travelLabel} />
      <MemoryGallery />
      <TravelSpacer label={SECTIONS[4].travelLabel} />
      <RSVPSection />
      <DigitalGift />
      <ThankYou reducedMotion={reducedMotion} />
    </>
  );
});

function Invitation() {
  const reducedMotion = useReducedMotion();
  const opened = useExperience((s) => s.opened);
  const webglUnavailable = useExperience((s) => s.webglUnavailable);
  const [webglAllowed] = useState(isWebGLAllowed);
  const quality = useMemo(detectQuality, []);
  const toast = useToast();
  const show3D = webglAllowed && !webglUnavailable;

  useEffect(() => {
    if (!webglAllowed) setExperience({ webglUnavailable: true });
  }, [webglAllowed]);

  useScrollCamera({ enabled: opened, reducedMotion });
  useMusic(() => toast('Musik tidak dapat diputar di perangkat ini', 'error'));
  useTypingState();

  // The page stays locked on the cover until the invitation is opened.
  useEffect(() => {
    if (opened) {
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(frame);
    }
    return lockScroll();
  }, [opened]);

  const handleOpen = useCallback(() => {
    setExperience({ opened: true, soundOn: music.hasSource });
    celebrate('gate', 1);
    if (reducedMotion) journey.intro = 1;
    else gsap.to(journey, { intro: 1, duration: 2.6, ease: 'power2.inOut', overwrite: true });
  }, [reducedMotion]);

  return (
    <>
      {opened && (
        <a
          href="#profil"
          className="toy-btn toy-btn-white toy-btn-sm sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
        >
          Lewati ke isi undangan
        </a>
      )}

      {show3D ? (
        <ErrorBoundary fallback={null} onError={() => setExperience({ webglUnavailable: true })}>
          <Suspense fallback={null}>
            <ToyWorldCanvas quality={quality} reducedMotion={reducedMotion} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <StaticWorldFallback />
      )}
      <LoadingScreen active={show3D} />

      {opened && <TopBar reducedMotion={reducedMotion} />}

      {/* Click-through layer: only panels opt back in (pointer-events-auto), so taps on
          empty space reach the 3D objects and wheel/touch scrolling still moves the page. */}
      <main id="journey" className="pointer-events-none relative z-10">
        <InvitationCover onOpen={handleOpen} reducedMotion={reducedMotion} />
        <div inert={!opened}>
          <InvitationSections reducedMotion={reducedMotion} />
        </div>
      </main>

      <Lightbox />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Invitation />
    </ToastProvider>
  );
}
