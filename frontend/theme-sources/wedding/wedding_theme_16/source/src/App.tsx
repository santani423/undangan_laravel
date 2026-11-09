import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { ClosingSection } from './components/invitation/ClosingSection';
import { CoupleSection } from './components/invitation/CoupleSection';
import { DigitalGiftSection } from './components/invitation/DigitalGiftSection';
import { DressCodeSection } from './components/invitation/DressCodeSection';
import { EventSection } from './components/invitation/EventSection';
import { GallerySection } from './components/invitation/GallerySection';
import { GuestbookSection } from './components/invitation/GuestbookSection';
import { HeroSection } from './components/invitation/HeroSection';
import { InvitationCover } from './components/invitation/InvitationCover';
import { LocationSection } from './components/invitation/LocationSection';
import { LoveStorySection } from './components/invitation/LoveStorySection';
import { RSVPSection } from './components/invitation/RSVPSection';
import { SceneLayer } from './components/SceneLayer';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { MusicController } from './components/ui/MusicController';
import { SampleBadge } from './components/ui/SampleBadge';
import { SectionNavigation } from './components/ui/SectionNavigation';
import { ExperienceContext, type ExperiencePhase } from './context/contexts';
import { InvitationProvider } from './context/InvitationProvider';
import { MusicProvider } from './context/MusicProvider';
import { ToastProvider } from './context/ToastProvider';
import { CAMERA_WAYPOINTS } from './data/cameraWaypoints';
import { invitation } from './data/invitation';
import { useMusic, useToast } from './hooks/useAppContext';
import { useInvitationData } from './hooks/useInvitationData';
import { useReducedMotion } from './hooks/useMediaQuery';
import { useScrollCamera } from './hooks/useScrollCamera';
import { detectQualityTier } from './lib/quality';
import { isWebGLForcedOff } from './lib/urlFlags';
import { detectWebGL } from './lib/webgl';
import { journey } from './scene/journeyState';

function Experience() {
  const { config, first, second } = useInvitationData();
  const music = useMusic();
  const { notify } = useToast();
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState(() => !isWebGLForcedOff() && detectWebGL());
  const [tier] = useState(detectQualityTier);
  const [phase, setPhase] = useState<ExperiencePhase>('cover');
  const [coverVisible, setCoverVisible] = useState(true);
  const [cameraArrived, setCameraArrived] = useState(false);

  useEffect(() => {
    document.title = `Undangan Pernikahan ${first.nickname} & ${second.nickname}`;
  }, [first.nickname, second.nickname]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // The cover is modal: page scrolling stays locked until it has gone.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('is-locked', coverVisible);
  }, [coverVisible]);

  const handleOpen = () => {
    // Music may only start from this explicit user gesture.
    if (config.music.playOnOpen) music.play();
    setPhase('opening');
    gsap.to(journey, {
      u: 1,
      dusk: CAMERA_WAYPOINTS[1].dusk,
      duration: reducedMotion ? 0 : 2.6,
      ease: 'power2.inOut',
      onComplete: () => setCameraArrived(true),
    });
  };

  const handleCoverExited = useCallback(() => {
    setCoverVisible(false);
    setPhase('open');
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.getElementById('beranda-title')?.focus({ preventScroll: true }));
  }, []);

  const handleSceneFailure = useCallback(
    (reason: string) => {
      console.warn('[undesia] Beralih ke tampilan statis:', reason);
      setWebgl(false);
      notify('Taman 3D tidak tersedia di perangkat ini — undangan tetap lengkap.', 'info');
    },
    [notify],
  );

  useScrollCamera(phase === 'open' && cameraArrived, reducedMotion);

  const experience = useMemo(() => ({ phase, reducedMotion }), [phase, reducedMotion]);

  return (
    <ExperienceContext.Provider value={experience}>
      {!coverVisible && (
        <a href="#beranda" className="skip-link">
          Lewati ke isi undangan
        </a>
      )}
      <SceneLayer enabled={webgl} tier={tier} reducedMotion={reducedMotion} onFailure={handleSceneFailure} />
      <LoadingScreen active={webgl} />
      {coverVisible && (
        <InvitationCover opening={phase !== 'cover'} reducedMotion={reducedMotion} onOpen={handleOpen} onExited={handleCoverExited} />
      )}

      <main
        id="isi-undangan"
        className={`relative z-10 transition-opacity duration-700 ${phase === 'cover' ? 'opacity-0' : 'opacity-100'}`}
        inert={coverVisible}
      >
        <HeroSection />
        <CoupleSection />
        <EventSection />
        <LocationSection />
        <LoveStorySection />
        <GallerySection />
        <RSVPSection />
        <GuestbookSection />
        <DressCodeSection />
        <DigitalGiftSection />
        <ClosingSection />
      </main>

      {!coverVisible && (
        <>
          <SectionNavigation reducedMotion={reducedMotion} />
          <MusicController />
        </>
      )}
      {config.meta.isSample && <SampleBadge />}
    </ExperienceContext.Provider>
  );
}

export default function App() {
  return (
    <InvitationProvider config={invitation}>
      <ToastProvider>
        <MusicProvider config={invitation.music}>
          <Experience />
        </MusicProvider>
      </ToastProvider>
    </InvitationProvider>
  );
}
