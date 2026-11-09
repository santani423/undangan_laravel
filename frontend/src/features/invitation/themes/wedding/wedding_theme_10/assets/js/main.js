/**
 * main.js
 * -----------------------------------------------------------------------
 * Semua interaksi undangan: render data dari WEDDING_DATA, cover opening,
 * countdown, kalender event, timeline reveal, gallery + lightbox, tab
 * amplop digital, copy-to-clipboard, form RSVP & wishes (disimulasikan
 * dengan localStorage sebagai pengganti database sungguhan).
 * -----------------------------------------------------------------------
 */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const data = WEDDING_DATA;

  /* ---------------------------------------------------------------------
   * Guest name from URL (?to=Nama%20Tamu) — pola umum undangan digital
   * ------------------------------------------------------------------- */
  function getGuestName() {
    const params = new URLSearchParams(window.location.search);
    return params.get('to') || data.meta.defaultGuestName;
  }

  /* ---------------------------------------------------------------------
   * Populate static text content from data.js
   * ------------------------------------------------------------------- */
  function renderStaticContent() {
    document.title = data.meta.siteTitle;

    const guest = getGuestName();
    $('#guestName').textContent = guest;

    $('#coverGroomName').textContent = data.groom.nickname;
    $('#coverBrideName').textContent = data.bride.nickname;
    $('#heroGroomName').textContent = data.groom.nickname;
    $('#heroBrideName').textContent = data.bride.nickname;

    const mainEventDate = new Date(data.events[data.events.length - 1].date + 'T00:00:00');
    $('#heroDate').textContent = formatDateLong(mainEventDate);

    $('#arabicGreeting').textContent = data.coupleIntro.arabicGreeting;
    $('#openingText').textContent = data.coupleIntro.openingText;

    // Couple section
    $('#groomOrder').textContent = data.groom.order;
    $('#groomFullName').textContent = data.groom.fullName;
    $('#groomParents').textContent = `Putra dari ${data.groom.fatherName} & ${data.groom.motherName}`;
    $('#groomDesc').textContent = data.groom.description;
    $('#groomIg').textContent = '@' + data.groom.instagram.split('/').pop();
    $('#groomIg').href = data.groom.instagram;

    $('#brideOrder').textContent = data.bride.order;
    $('#brideFullName').textContent = data.bride.fullName;
    $('#brideParents').textContent = `Putri dari ${data.bride.fatherName} & ${data.bride.motherName}`;
    $('#brideDesc').textContent = data.bride.description;
    $('#brideIg').textContent = '@' + data.bride.instagram.split('/').pop();
    $('#brideIg').href = data.bride.instagram;

    $('#quoteText').textContent = `"${data.quote.text}"`;
    $('#quoteSource').textContent = data.quote.source;

    // Venue
    $('#venueName').textContent = data.venue.name;
    $('#venueAddress').textContent = data.venue.fullAddress;
    $('#venueNotes').textContent = data.venue.notes;
    $('#venueDirectionBtn').href = data.venue.mapsDirectionUrl;
    $('#venueMapEmbed').src = data.venue.mapsEmbedSrc;

    // Dress code
    $('#dresscodeDesc').textContent = data.dressCode.description;
    $('#dresscodeNote').textContent = data.dressCode.notes;

    // Closing
    $('#closingText').textContent = data.closing.thankYouText;
    $('#closingHashtag').textContent = data.closing.hashtag;
    $('#footerYear').textContent = new Date().getFullYear();
  }

  function formatDateLong(date) {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  /* ---------------------------------------------------------------------
   * Event cards
   * ------------------------------------------------------------------- */
  function renderEventCards() {
    const wrap = $('#eventCards');
    wrap.innerHTML = data.events.map(ev => {
      const d = new Date(ev.date + 'T00:00:00');
      return `
        <div class="event-card reveal">
          <h3 class="event-card__label">${ev.label}</h3>
          <p class="event-card__row"><span class="event-card__icon">&#128197;</span><strong>${formatDateLong(d)}</strong></p>
          <p class="event-card__row"><span class="event-card__icon">&#128337;</span>Pukul ${ev.timeStart} &ndash; ${ev.timeEnd} ${ev.timezone}</p>
          <p class="event-card__row"><span class="event-card__icon">&#128205;</span>${ev.venueName}</p>
          <a class="event-card__map-link" href="${ev.mapsUrl}" target="_blank" rel="noopener">Lihat di Google Maps &rarr;</a>
        </div>`;
    }).join('');
    observeReveal();
  }

  /* ---------------------------------------------------------------------
   * Calendar grid (highlights the wedding day)
   * ------------------------------------------------------------------- */
  function renderCalendar() {
    const mainDate = new Date(data.events[data.events.length - 1].date + 'T00:00:00');
    const year = mainDate.getFullYear();
    const month = mainDate.getMonth();
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    $('#calMonthYear').textContent = `${monthNames[month]} ${year}`;

    const dowLabels = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = dowLabels.map(d => `<div class="cal-dow">${d}</div>`).join('');

    for (let i = firstDay; i > 0; i--) {
      html += `<div class="cal-day is-muted">${daysInPrevMonth - i + 1}</div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isHighlight = day === mainDate.getDate();
      html += `<div class="cal-day ${isHighlight ? 'is-highlight' : ''}">${day}</div>`;
    }
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day is-muted">${i}</div>`;
    }

    $('#calendarGrid').innerHTML = html;
  }

  /* ---------------------------------------------------------------------
   * Countdown timer
   * ------------------------------------------------------------------- */
  function startCountdown() {
    const target = new Date(`${data.events[data.events.length - 1].date}T${data.events[data.events.length - 1].timeStart}:00+07:00`);
    let prev = { days: null, hours: null, mins: null, secs: null };

    function setDigit(id, value, key) {
      const el = $(id);
      const strVal = String(value).padStart(2, '0');
      if (prev[key] !== null && prev[key] !== strVal) {
        el.classList.remove('is-flipping');
        // eslint-disable-next-line no-unused-expressions
        void el.offsetWidth; // restart animation
        el.classList.add('is-flipping');
      }
      el.textContent = strVal;
      prev[key] = strVal;
    }

    function tick() {
      const now = new Date();
      let diff = target - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setDigit('#cd-days', days, 'days');
      setDigit('#cd-hours', hours, 'hours');
      setDigit('#cd-mins', mins, 'mins');
      setDigit('#cd-secs', secs, 'secs');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------------
   * Love story timeline
   * ------------------------------------------------------------------- */
  function renderTimeline() {
    const wrap = $('#timelineList');
    wrap.innerHTML = data.loveStory.map(item => `
      <div class="timeline-item">
        <span class="timeline-item__dot" aria-hidden="true"></span>
        <div class="timeline-item__card">
          <div class="timeline-item__photo"><img src="${item.photo}" alt="${item.title}" loading="lazy"></div>
          <p class="timeline-item__date">${item.date}</p>
          <h3 class="timeline-item__title">${item.title}</h3>
          <p class="timeline-item__desc">${item.description}</p>
        </div>
      </div>
    `).join('');
    observeReveal('.timeline-item');
  }

  /* ---------------------------------------------------------------------
   * Gallery + Lightbox
   * ------------------------------------------------------------------- */
  let galleryImages = [];
  let currentLightboxIndex = 0;

  function renderGallery() {
    galleryImages = data.gallery;
    const grid = $('#galleryGrid');
    grid.innerHTML = galleryImages.map((img, i) => `
      <div class="gallery-item reveal" data-index="${i}" style="transition-delay:${(i % 3) * 90}ms">
        <img src="${img.src}" alt="${img.caption}" loading="lazy">
        <span class="gallery-item__cap">${img.caption}</span>
      </div>
    `).join('');

    $$('.gallery-item', grid).forEach(el => {
      el.addEventListener('click', () => openLightbox(Number(el.dataset.index)));
    });
  }

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxImage();
    $('#lightbox').classList.add('is-open');
    $('#lightbox').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    $('#lightbox').classList.remove('is-open');
    $('#lightbox').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function updateLightboxImage() {
    const img = galleryImages[currentLightboxIndex];
    $('#lightboxImg').src = img.src;
    $('#lightboxImg').alt = img.caption;
    $('#lightboxCaption').textContent = img.caption;
  }
  function navLightbox(delta) {
    currentLightboxIndex = (currentLightboxIndex + delta + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  function initLightbox() {
    $('#lightboxClose').addEventListener('click', closeLightbox);
    $('#lightboxPrev').addEventListener('click', () => navLightbox(-1));
    $('#lightboxNext').addEventListener('click', () => navLightbox(1));
    $('#lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!$('#lightbox').classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
  }

  /* ---------------------------------------------------------------------
   * Dress code swatches
   * ------------------------------------------------------------------- */
  function renderDressCode() {
    $('#dresscodeSwatches').innerHTML = data.dressCode.colors.map(c => `
      <div class="dresscode-swatch reveal">
        <span class="dresscode-swatch__circle" style="background:${c.hex}"></span>
        <span class="dresscode-swatch__name">${c.name}</span>
      </div>
    `).join('');
    observeReveal('.dresscode-swatch');
  }

  /* ---------------------------------------------------------------------
   * Digital gift: bank + e-wallet cards, tabs, copy buttons
   * ------------------------------------------------------------------- */
  function renderGiftCards() {
    $('#bankCards').innerHTML = data.gifts.banks.map(b => `
      <div class="gift-card">
        <p class="gift-card__bank">${b.bank}</p>
        <p class="gift-card__number">${b.accountNumber}</p>
        <p class="gift-card__name">a.n. ${b.accountName}</p>
        <button class="gift-card__copy" data-copy="${b.accountNumber}">Salin Nomor Rekening</button>
      </div>
    `).join('');

    $('#ewalletCards').innerHTML = data.gifts.eWallets.map(w => `
      <div class="gift-card">
        <p class="gift-card__bank">${w.provider}</p>
        <p class="gift-card__number">${w.number}</p>
        <p class="gift-card__name">a.n. ${w.accountName}</p>
        <button class="gift-card__copy" data-copy="${w.number}">Salin Nomor</button>
      </div>
    `).join('');

    $$('.gift-card__copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.copy;
        copyToClipboard(value);
        const originalText = btn.textContent;
        btn.textContent = 'Tersalin!';
        btn.classList.add('is-copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('is-copied');
        }, 1800);
      });
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function initGiftTabs() {
    $$('.gift__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.gift__tab').forEach(t => t.classList.remove('is-active'));
        $$('.gift__panel').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        $('#panel-' + tab.dataset.tab).classList.add('is-active');
      });
    });
  }

  /* ---------------------------------------------------------------------
   * RSVP form (dummy submit -> localStorage; ready to swap for fetch())
   * ------------------------------------------------------------------- */
  function populateRsvpOptions() {
    const guestSelect = $('#rsvpGuests');
    guestSelect.innerHTML = data.rsvpConfig.guestCountOptions
      .map(n => `<option value="${n}">${n} orang</option>`).join('');

    const attendanceSelect = $('#rsvpAttendance');
    attendanceSelect.innerHTML = data.rsvpConfig.attendanceOptions
      .map(o => `<option value="${o.value}">${o.label}</option>`).join('');

    const wishAttendance = $('#wishAttendance');
    wishAttendance.innerHTML = data.rsvpConfig.attendanceOptions
      .map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  }

  function initRsvpForm() {
    const form = $('#rsvpForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = $('#rsvpStatus');
      const payload = {
        name: $('#rsvpName').value.trim(),
        phone: $('#rsvpPhone').value.trim(),
        guests: $('#rsvpGuests').value,
        attendance: $('#rsvpAttendance').value,
        message: $('#rsvpMessage').value.trim(),
        createdAt: new Date().toISOString(),
      };

      status.textContent = 'Mengirim konfirmasi...';
      status.classList.remove('is-error');

      // ---- Simulasi pengiriman ke server (ganti dengan fetch ke backend) ----
      // Contoh nyata:
      // fetch('/api/rsvp', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      setTimeout(() => {
        try {
          const existing = JSON.parse(localStorage.getItem('rsvp_submissions') || '[]');
          existing.push(payload);
          localStorage.setItem('rsvp_submissions', JSON.stringify(existing));
          status.textContent = `Terima kasih, ${payload.name}! Konfirmasi kehadiran Anda telah kami terima.`;
          form.reset();
        } catch (err) {
          status.textContent = 'Terjadi kesalahan, silakan coba lagi.';
          status.classList.add('is-error');
        }
      }, 600);
    });
  }

  /* ---------------------------------------------------------------------
   * Wishes / comments (dummy data + localStorage-persisted new entries)
   * ------------------------------------------------------------------- */
  const WISHES_PAGE_SIZE = 4;
  let wishesRenderedCount = 0;
  let allWishes = [];

  function getStoredWishes() {
    try {
      return JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    } catch (e) { return []; }
  }

  function loadAllWishes() {
    const stored = getStoredWishes();
    // Ucapan baru (localStorage) ditampilkan lebih dulu, lalu dummy data awal
    allWishes = [...stored, ...data.wishes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function renderWishesPage(reset) {
    if (reset) wishesRenderedCount = 0;
    const list = $('#wishesList');
    const nextBatch = allWishes.slice(wishesRenderedCount, wishesRenderedCount + WISHES_PAGE_SIZE);

    nextBatch.forEach((w, i) => {
      const el = document.createElement('div');
      el.className = 'wish-card';
      el.style.animationDelay = (i * 0.08) + 's';
      const badgeMap = { hadir: 'Hadir', tidak_hadir: 'Tidak Hadir', ragu: 'Belum Pasti' };
      el.innerHTML = `
        <div class="wish-card__head">
          <span class="wish-card__name">${escapeHtml(w.name)}</span>
          <span class="wish-card__badge wish-card__badge--${w.attendance}">${badgeMap[w.attendance] || ''}</span>
        </div>
        <p class="wish-card__date">${formatRelativeDate(w.createdAt)}</p>
        <p class="wish-card__msg">${escapeHtml(w.message)}</p>
      `;
      list.appendChild(el);
    });

    wishesRenderedCount += nextBatch.length;
    const loadMoreBtn = $('#loadMoreWishes');
    loadMoreBtn.style.display = wishesRenderedCount >= allWishes.length ? 'none' : 'block';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatRelativeDate(iso) {
    const date = new Date(iso);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function initWishForm() {
    const form = $('#wishForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#wishName').value.trim();
      const message = $('#wishMessage').value.trim();
      const attendance = $('#wishAttendance').value;
      if (!name || !message) return;

      const payload = { id: 'w' + Date.now(), name, message, attendance, createdAt: new Date().toISOString() };

      // ---- Simulasi simpan ke server (ganti dengan fetch ke backend) ----
      // fetch('/api/wishes', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const stored = getStoredWishes();
      stored.unshift(payload);
      localStorage.setItem('wedding_wishes', JSON.stringify(stored));

      loadAllWishes();
      $('#wishesList').innerHTML = '';
      renderWishesPage(true);
      form.reset();
    });

    $('#loadMoreWishes').addEventListener('click', () => renderWishesPage(false));
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal (IntersectionObserver)
   * ------------------------------------------------------------------- */
  let revealObserver;
  function observeReveal(selector) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
    }
    const nodes = selector ? $$(selector) : $$('.reveal');
    nodes.forEach(el => {
      if (!selector) el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
   * Dot navigation active state
   * ------------------------------------------------------------------- */
  function initDotNav() {
    const links = $$('#dotNav a');
    const sections = links.map(a => document.querySelector(a.getAttribute('href')));

    window.addEventListener('scroll', () => {
      let currentIndex = 0;
      sections.forEach((sec, i) => {
        if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.5) {
          currentIndex = i;
        }
      });
      links.forEach((a, i) => a.classList.toggle('is-active', i === currentIndex));
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
   * Ambient falling petals (subtle, elegant, respects reduced motion)
   * ------------------------------------------------------------------- */
  const PETAL_SVG_LEAF = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2C7 6 4 11 6 16c1.5 3.5 4.5 5 6 6 1.5-1 4.5-2.5 6-6 2-5-1-10-6-14z" fill="#8B9A78" opacity="0.75"/></svg>`;
  const PETAL_SVG_PETAL = `<svg width="14" height="14" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="7" ry="11" fill="#C9A0A0" opacity="0.7"/></svg>`;
  const PETAL_SVG_GOLD = `<svg width="8" height="8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#D4B36A" opacity="0.8"/></svg>`;

  function initPetals() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 640px)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'petals-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const shapes = [PETAL_SVG_LEAF, PETAL_SVG_PETAL, PETAL_SVG_GOLD];
    const PETAL_COUNT = 10;

    for (let i = 0; i < PETAL_COUNT; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.innerHTML = shapes[i % shapes.length];
      const left = Math.random() * 100;
      const duration = 14 + Math.random() * 12;
      const delay = Math.random() * 20;
      const swayDuration = 3 + Math.random() * 3;
      petal.style.left = left + 'vw';
      petal.style.animationDuration = `${duration}s, ${swayDuration}s`;
      petal.style.animationDelay = `${delay}s, ${delay}s`;
      layer.appendChild(petal);
    }
  }

  /* ---------------------------------------------------------------------
   * Petal burst — a joyful moment when the invitation opens
   * ------------------------------------------------------------------- */
  function burstPetals(originEl) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const shapes = [PETAL_SVG_LEAF, PETAL_SVG_PETAL, PETAL_SVG_GOLD];
    const COUNT = 18;

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'burst-petal';
      el.innerHTML = shapes[i % shapes.length];
      el.style.left = originX + 'px';
      el.style.top = originY + 'px';

      const angle = (Math.PI * 2 * i) / COUNT + (Math.random() * 0.5 - 0.25);
      const distance = 120 + Math.random() * 160;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 80; // bias upward
      el.style.setProperty('--burst-end', `translate(${endX}px, ${endY}px)`);
      el.style.setProperty('--burst-rot', `${Math.random() * 360}deg`);

      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  /* ---------------------------------------------------------------------
   * Subtle parallax on decorative leaf/watercolor elements while scrolling
   * ------------------------------------------------------------------- */
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const decos = $$('.leaf-deco');
    if (!decos.length) return;

    let ticking = false;
    function update() {
      const scrollY = window.scrollY;
      decos.forEach((el, i) => {
        const speed = (i % 3 === 0) ? 0.06 : (i % 3 === 1) ? -0.05 : 0.03;
        const offset = (scrollY * speed) % 60;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
   * Cover open + background music + floating controls
   * ------------------------------------------------------------------- */
  function initCover() {
    const cover = $('#cover');
    const btn = $('#openInvitationBtn');
    const music = $('#bgMusic');
    const musicBtn = $('#musicToggle');
    const dotNav = $('#dotNav');

    document.body.style.overflow = 'hidden';

    btn.addEventListener('click', () => {
      burstPetals(btn);
      cover.classList.add('is-hidden');
      document.body.style.overflow = '';
      $('#mainContent').setAttribute('aria-hidden', 'false');

      musicBtn.classList.add('is-visible');
      dotNav.classList.add('is-visible');

      music.volume = 0.5;
      music.play().then(() => {
        musicBtn.classList.add('is-playing');
      }).catch(() => { /* autoplay blocked, user can tap the button */ });

      try { observeReveal(); } catch (e) { /* noop */ }
      try { initPetals(); } catch (e) { /* noop */ }
      setTimeout(() => { try { observeReveal('.timeline-item'); } catch (e) {} }, 50);
      setTimeout(() => { try { observeReveal('.dresscode-swatch'); } catch (e) {} }, 50);
      setTimeout(() => { try { observeReveal('.gallery-item'); } catch (e) {} }, 50);

      try { startCountdown(); } catch (e) { console.error(e); }
    }, { once: true });

    musicBtn.addEventListener('click', () => {
      if (music.paused) {
        music.play();
        musicBtn.classList.add('is-playing');
      } else {
        music.pause();
        musicBtn.classList.remove('is-playing');
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // initCover runs FIRST and independently — the "Buka Undangan" button
    // must always work even if a content-rendering step below throws.
    initCover();

    const steps = [
      renderStaticContent,
      renderCalendar,
      renderEventCards,
      renderTimeline,
      renderGallery,
      renderDressCode,
      renderGiftCards,
      populateRsvpOptions,
      () => { loadAllWishes(); renderWishesPage(true); },
      initLightbox,
      initGiftTabs,
      initRsvpForm,
      initWishForm,
      initDotNav,
      initParallax,
      () => observeReveal(),
    ];

    steps.forEach(fn => {
      try { fn(); }
      catch (err) { console.error('[wedding-site] init step failed:', fn.name || fn, err); }
    });
  });

})();
