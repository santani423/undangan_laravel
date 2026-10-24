// Self-hosted fonts (OFL-1.1). Latin + Latin Extended cover English, Indonesian and most European names.
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-ext-400.css';
import '@fontsource/nunito/latin-ext-800.css';
import './styles/theme.css';
import './styles/main.css';
import './styles/responsive.css';
import './styles/animations.css';

import rawConfig from './config/invitation.js';
import scenePlan from './config/scene-plan.json';
import { $, $$, buildMapsUrl, nextFrame, paragraphsHtml, prefersReducedMotion, resolveConfig, wait } from './utils/helpers.js';
import { formatEventDay, formatPlainDate, formatTimeRange, getEventRange } from './utils/date.js';
import { Countdown } from './components/Countdown.js';
import { buildGoogleCalendarUrl, downloadIcs } from './components/CalendarDownload.js';
import { RSVPForm } from './components/RSVPForm.js';
import { MusicController } from './components/MusicController.js';
import { Navigation } from './components/Navigation.js';
import { Loader } from './components/Loader.js';
import { Activities } from './components/Activities.js';
import { Gallery } from './components/Gallery.js';
import { CakeInteraction } from './components/CakeInteraction.js';
import { Toast, domConfetti } from './components/Toast.js';
import { ScrollExperience, ScrollTrigger, gsap } from './animations/ScrollExperience.js';
import { detectQuality, isWebGLAvailable } from './scene/quality.js';

const NAV_LABELS = {
  hero: 'Welcome',
  invitation: 'Invitation',
  details: 'When & where',
  activities: 'Activities',
  gallery: 'Gallery',
  cake: 'Cake',
  rsvp: 'RSVP',
  finale: 'Thank you',
};

const config = resolveConfig(rawConfig);
const reducedMotion = prefersReducedMotion();
const root = document.documentElement;
const isSideLayout = () => window.matchMedia('(min-width: 900px), (orientation: landscape) and (min-width: 640px)').matches;

// ?now=2026-12-05T16:00:00+07:00 previews the countdown at another moment (handy for testing).
const previewNow = Date.parse(new URLSearchParams(location.search).get('now') ?? '');
const clockOffset = Number.isFinite(previewNow) ? previewNow - Date.now() : 0;
const clock = () => Date.now() + clockOffset;

root.classList.add('js');
if (!reducedMotion) root.classList.add('js-intro');

const state = {
  experience: null,
  scroll: null,
  activeIndex: 0,
};

/* ------------------------------------------------------------ content binding */

function getPath(object, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object);
}

function bindContent() {
  let range = null;
  try {
    range = getEventRange(config.event);
  } catch (err) {
    console.error(`[config] ${err.message}`);
  }
  $$('[data-bind]').forEach((el) => {
    const value = getPath(config, el.dataset.bind);
    if (value !== undefined && value !== null) el.textContent = String(value);
  });
  $$('[data-bind-html]').forEach((el) => {
    el.innerHTML = paragraphsHtml(getPath(config, el.dataset.bindHtml) ?? '');
  });
  $$('[data-show-if]').forEach((el) => {
    el.hidden = !getPath(config, el.dataset.showIf);
  });
  const dateText = { day: '', time: '' };
  try {
    dateText.day = formatEventDay(config.event);
    dateText.time = formatTimeRange(config.event);
  } catch (err) {
    console.error(`[config] ${err.message}`);
  }
  $$('[data-bind-date]').forEach((el) => (el.textContent = dateText[el.dataset.bindDate]));

  const titles = Object.fromEntries(scenePlan.sections.map((s) => [s.id, s.title]));
  $$('[data-section-title]').forEach((el) => {
    if (titles[el.dataset.sectionTitle]) el.textContent = titles[el.dataset.sectionTitle];
  });

  document.title = `${config.child.name}'s birthday · ${config.copy.siteTitle}`;
  $('[data-maps-link]').href = buildMapsUrl(config.venue);
  try {
    $('[data-google-calendar]').href = buildGoogleCalendarUrl(config, { pageUrl: location.href.split('#')[0] });
  } catch {
    $('[data-google-calendar]').closest('p').hidden = true;
  }

  const deadline = formatPlainDate(config.rsvp.deadline, config.event.locale);
  const deadlineEl = $('[data-rsvp-deadline]');
  if (deadline) {
    deadlineEl.querySelector('strong').textContent = deadline;
    deadlineEl.hidden = false;
  }

  const credit = config.audio.files?.music
    ? 'Background music is provided by the host.'
    : 'Music: “Happy Birthday to You” (public domain), played live by your browser.';
  $('.site-footer p').append(` ${credit}`);

  // Theme colours from the config feed the CSS tokens too.
  const t = config.theme;
  Object.entries({ sky: t.sky, pink: t.pink, mint: t.mint, yellow: t.yellow, cream: t.cream, ink: t.ink, blue: t.blue, lavender: t.lavender }).forEach(
    ([key, value]) => value && root.style.setProperty(`--smile-${key}`, value),
  );
  return range;
}

/* ------------------------------------------------------------------- setup */

const loader = new Loader($('#loader'));
const toast = new Toast($('[data-toast]'));
const audio = new MusicController(config);
const sections = scenePlan.sections.map((s) => document.getElementById(s.id)).filter(Boolean);
const range = bindContent();

const navigation = new Navigation({
  trail: $('[data-trail]'),
  menuButton: $('[data-menu-button]'),
  menu: $('#menu'),
  progress: $('[data-progress]'),
  sections: scenePlan.sections.map((s) => ({ id: s.id, label: NAV_LABELS[s.id] ?? s.title })),
  onNavigate: () => audio.play('pop', { volume: 0.6 }),
});
navigation.setActive(0);

if (range) {
  const countdown = new Countdown(range, { roots: $$('[data-countdown]'), clock });
  countdown.start();
}

// Sound toggles
const musicButton = $('[data-music-toggle]');
const sfxButton = $('[data-sfx-toggle]');
if (!audio.supported) {
  musicButton.hidden = sfxButton.hidden = true;
}
audio.onChange(({ music, sfx }) => {
  musicButton.setAttribute('aria-pressed', String(music));
  musicButton.title = music ? 'Pause music' : 'Play music';
  sfxButton.setAttribute('aria-pressed', String(sfx));
  sfxButton.title = sfx ? 'Turn sound effects off' : 'Turn sound effects on';
});
musicButton.addEventListener('click', async () => {
  const playing = await audio.toggleMusic();
  if (playing === false && !audio.state.music && audio.ctx?.state !== 'running') {
    toast.show('Your browser blocked the music. Tap the music button again to start it.');
  }
});
sfxButton.addEventListener('click', () => audio.toggleSfx());

// Activities, gallery, cake, RSVP
const activities = new Activities({
  list: $('[data-activity-list]'),
  dialogElement: $('#activity-dialog'),
  activities: config.activities,
  locale: config.event.locale,
  onOpen: (id) => {
    audio.play('pop');
    state.experience?.world.highlightActivity(id);
  },
});

const gallery = new Gallery({
  grid: $('[data-gallery-grid]'),
  dialogElement: $('#lightbox'),
  photos: config.gallery,
  onOpen: () => audio.play('pop', { volume: 0.5 }),
});

// The 3D world is attached later (boot), if WebGL starts.
const cake = new CakeInteraction({ root: $('[data-cake]'), world: null, audio, toast, config });

const rsvp = new RSVPForm($('[data-rsvp-form]'), config, {
  onSubmitted: () => {
    audio.play('celebration');
    if (state.experience) state.experience.world.raiseMailboxFlag(true);
    else domConfetti($('[data-rsvp-success]'), { amount: 60 });
  },
  onReset: () => state.experience?.world.raiseMailboxFlag(false),
});

$('[data-calendar-download]').addEventListener('click', () => {
  try {
    const name = downloadIcs(config);
    audio.play('chime');
    toast.show(`Calendar file downloaded: ${name}`);
  } catch (err) {
    console.error(err);
    toast.show('The calendar file could not be created. Please add the date manually.');
  }
});

$('[data-start]').addEventListener('click', () => {
  audio.play('pop');
  if (config.audio.startMusicOnAdventureStart && audio.musicAllowedByPreference) audio.playMusic();
  navigation.goTo('invitation');
});

$('[data-back-to-start]').addEventListener('click', () => navigation.goTo('hero'));
$('[data-replay]').addEventListener('click', () => replay());

/* ------------------------------------------------------------------- intro */

function playIntro({ onComplete } = {}) {
  const exp = state.experience;
  if (exp && !reducedMotion) {
    exp.cameraController.intro.amount = 1;
    gsap.to(exp.cameraController.intro, { amount: 0, duration: 3.4, ease: 'power3.inOut' });
  }
  exp?.world.playIntro();
  const items = $$('[data-hero-item]');
  if (reducedMotion) {
    gsap.set(items, { autoAlpha: 1 });
    onComplete?.();
  } else {
    gsap.fromTo(items, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'back.out(1.6)', delay: exp ? 1.2 : 0.2, onComplete });
  }
}

async function replay() {
  const wipe = $('[data-wipe]');
  wipe.classList.add('is-active');
  audio.play('whoosh');
  await wait(reducedMotion ? 0 : 480);
  cake.reset();
  state.experience?.world.resetForReplay();
  window.scrollTo({ top: 0, behavior: 'auto' });
  ScrollTrigger.update();
  state.experience?.cameraController.snap();
  await nextFrame();
  await nextFrame();
  wipe.classList.remove('is-active');
  // Focus the start button once it's visible again (hidden elements can't take focus).
  playIntro({ onComplete: () => $('[data-start]').focus({ preventScroll: true }) });
}

/* --------------------------------------------------------------------- 3D */

async function waitForFonts() {
  if (!document.fonts?.load) return;
  const fonts = ['700 64px Fredoka', '600 64px Fredoka', '800 32px Nunito', '700 32px Nunito'];
  await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), wait(2500)]).catch(() => {});
}

function useFallback(reason) {
  root.classList.add('no-webgl');
  root.classList.remove('has-3d-title');
  if (reason) console.info(`[3d] Showing the illustrated (non-3D) version: ${reason}`);
}

async function start3D() {
  if (!isWebGLAvailable()) {
    useFallback('WebGL is not available in this browser.');
    return null;
  }
  try {
    loader.set(0.2, 'Loading the 3D world');
    const { createExperience, applyOptionalModels } = await import('./scene/index.js');
    const experience = await createExperience({
      canvas: $('[data-world]'),
      config,
      quality: detectQuality(),
      reducedMotion,
      onProgress: (p, message) => loader.set(0.25 + p * 0.72, message),
      onContextLost: () => {
        useFallback('the WebGL context was lost.');
        toast.show('The 3D view stopped, but the whole invitation still works.');
      },
      handlers: {
        sound: (name, opts) => audio.play(name, opts),
        onSection: (id) => navigation.goTo(id),
        onActivity: (id) => activities.open(id),
        onPhoto: (index) => gallery.open(index),
        onCake: () => (cake.blown ? cake.relight() : cake.wish()),
        onMailbox: () => {
          navigation.goTo('rsvp');
          setTimeout(() => $('#rsvp-name')?.focus({ preventScroll: true }), 600);
        },
      },
    });
    experience.applyOptionalModels = applyOptionalModels;
    if (experience.world.title) root.classList.add('has-3d-title');
    return experience;
  } catch (err) {
    console.error('[3d] Could not start the 3D world:', err);
    useFallback('the 3D world failed to start.');
    return null;
  }
}

async function boot() {
  loader.set(0.05, 'Brushing up the invitation…');
  await waitForFonts();
  loader.set(0.18, 'Fonts are ready');

  state.experience = await start3D();
  const exp = state.experience;
  if (exp) cake.world = exp.world;

  state.scroll = new ScrollExperience({
    sections,
    world: exp?.world ?? null,
    cameraController: exp?.cameraController ?? null,
    reducedMotion,
    isNarrow: () => !isSideLayout(),
    onProgress: (p) => navigation.setProgress(p),
    onSectionChange: (index, previous) => {
      state.activeIndex = index;
      navigation.setActive(index);
      if (previous >= 0) audio.play('chime', { volume: 0.35 });
    },
  });
  state.scroll.init();

  // Honour a deep link like #rsvp once layout is ready.
  const hash = location.hash.slice(1);
  if (hash && document.getElementById(hash) && hash !== 'hero') {
    document.getElementById(hash).scrollIntoView({ behavior: 'auto' });
    ScrollTrigger.update();
  }
  if (exp) {
    exp.cameraController.snap();
    exp.sceneManager.start();
  }

  await loader.finish();
  if (!hash || hash === 'hero') playIntro();
  else gsap.set($$('[data-hero-item]'), { autoAlpha: 1 });

  // Refresh measurements once images/fonts have settled.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  if (exp && Object.values(config.models ?? {}).some(Boolean)) {
    exp.applyOptionalModels(exp.world, config.models).catch((err) => console.warn('[3d] Optional models skipped:', err));
  }

  // Expose a tiny debug handle for testing in the console.
  window.__smile = { config, state, audio, cake, rsvp, gallery, activities, navigation };
}

boot().catch((err) => {
  console.error(err);
  useFallback('startup error');
  loader.finish();
  gsap.set($$('[data-hero-item]'), { autoAlpha: 1 });
});
