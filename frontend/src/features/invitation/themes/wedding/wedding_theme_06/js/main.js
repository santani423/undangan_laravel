/**
 * main.js
 * ------------------------------------------------------------------
 * Semua render & interaksi undangan. Setiap fungsi render mengambil
 * data dari `WEDDING_DATA` (lihat data.js) sehingga saat backend siap,
 * cukup ganti sumber data (mis. hasil fetch API) tanpa mengubah markup
 * atau CSS.
 * ------------------------------------------------------------------
 */
(function () {
  "use strict";

  const D = WEDDING_DATA;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const params = new URLSearchParams(location.search);
  const guestName = params.get("to") || params.get("guest") || "";

  const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const DAYS_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

  function fmtDateLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  }
  function fmtDateShort(iso) {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  }

  /* ---------------------------------------------------------------
   * BASIC CONTENT BINDINGS
   * ------------------------------------------------------------- */
  function renderBasics() {
    document.title = D.meta.title;

    $$("[data-groom-name]").forEach(el => el.textContent = D.groom.nickName);
    $$("[data-bride-name]").forEach(el => el.textContent = D.bride.nickName);
    $$("[data-couple-names]").forEach(el => el.textContent = `${D.groom.nickName} & ${D.bride.nickName}`);
    $$("[data-couple-photo]").forEach(el => el.src = D.coverPhoto);

    const mainEvent = D.events[0];
    $$("[data-main-date]").forEach(el => el.textContent = fmtDateLong(mainEvent.date));
    $$("[data-main-date-short]").forEach(el => el.textContent = fmtDateShort(mainEvent.date));

    const guestEl = $("#cover-guest-name");
    if (guestEl) {
      guestEl.innerHTML = guestName
        ? `Kepada Bapak/Ibu/Saudara/i<br><strong>${escapeHtml(guestName)}</strong>`
        : `Kepada Bapak/Ibu/Saudara/i`;
    }

    // Quote
    $("#quote-bismillah").textContent = D.quote.arabicNote;
    $("#quote-greeting").textContent = D.quote.greeting;
    $("#quote-text").textContent = `\u201C${D.quote.verse}\u201D`;
    $("#quote-source").textContent = `— ${D.quote.verseSource}`;
    $("#invitation-text").textContent = D.invitationText;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------
   * COUPLE SECTION
   * ------------------------------------------------------------- */
  function renderCouple() {
    const groomCard = $("#groom-card");
    const brideCard = $("#bride-card");
    fillCoupleCard(groomCard, D.groom);
    fillCoupleCard(brideCard, D.bride);
  }
  function fillCoupleCard(card, person) {
    if (!card) return;
    $(".couple-photo img", card).src = person.photo;
    $(".couple-photo img", card).alt = person.fullName;
    $(".couple-name", card).textContent = person.fullName;
    $(".couple-parents", card).textContent = `Putra/Putri dari ${person.father} & ${person.mother}`;
    $(".couple-order", card).textContent = person.childOrder;
    $(".couple-bio", card).textContent = person.bio;
  }

  /* ---------------------------------------------------------------
   * EVENTS SECTION
   * ------------------------------------------------------------- */
  function renderEvents() {
    const wrap = $("#events-grid");
    if (!wrap) return;
    wrap.innerHTML = D.events.map(ev => {
      const d = new Date(ev.date + "T00:00:00");
      return `
        <div class="event-card reveal">
          <div class="badge">${iconCalendar()}</div>
          <h3>${ev.label}</h3>
          <div class="event-day">${DAYS_ID[d.getDay()]}</div>
          <div class="event-date">${fmtDateShort(ev.date)}</div>
          <div class="event-time">Pukul ${ev.timeStart} – ${ev.timeEnd} ${ev.timezone}</div>
          <div class="event-venue">${ev.venueName}</div>
          <div class="event-note">${ev.note}</div>
          <div class="event-actions">
            <button class="btn btn--ghost btn--sm" data-add-calendar='${JSON.stringify(ev)}'>${iconPlus()} Tambah ke Kalender</button>
          </div>
        </div>`;
    }).join("");

    $$("[data-add-calendar]", wrap).forEach(btn => {
      btn.addEventListener("click", () => addToCalendar(JSON.parse(btn.dataset.addCalendar)));
    });
  }

  function addToCalendar(ev) {
    const start = ev.date.replace(/-/g, "") + "T" + ev.timeStart.replace(":", "") + "00";
    const end = ev.date.replace(/-/g, "") + "T" + ev.timeEnd.replace(":", "") + "00";
    const text = encodeURIComponent(`${ev.label} — ${D.groom.nickName} & ${D.bride.nickName}`);
    const loc = encodeURIComponent(ev.venueName);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&location=${loc}`;
    window.open(url, "_blank");
  }

  /* ---------------------------------------------------------------
   * ADDRESS / MAP
   * ------------------------------------------------------------- */
  function renderAddress() {
    $("#address-venue-name").textContent = D.address.venueName;
    $("#address-full").textContent = D.address.fullAddress;
    $("#address-map-iframe").src = D.address.mapsEmbedUrl;
    $("#address-nav-btn").href = D.address.mapsLinkUrl;
  }

  /* ---------------------------------------------------------------
   * LOVE STORY
   * ------------------------------------------------------------- */
  function renderLoveStory() {
    const wrap = $("#timeline");
    if (!wrap) return;
    wrap.innerHTML = D.loveStory.map((item, i) => `
      <div class="timeline-item reveal">
        <div class="timeline-photo reveal"><img src="${item.photo}" alt="${item.title}" loading="lazy"></div>
        <div class="timeline-node"></div>
        <div class="timeline-card">
          <div class="timeline-date">${item.date}</div>
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-desc">${item.description}</div>
        </div>
      </div>
    `).join("");
  }

  /* ---------------------------------------------------------------
   * GALLERY + LIGHTBOX
   * ------------------------------------------------------------- */
  let galleryIndex = 0;
  function renderGallery() {
    const wrap = $("#gallery-grid");
    if (!wrap) return;
    wrap.innerHTML = D.gallery.map((g, i) => `
      <div class="gallery-item reveal" data-index="${i}">
        <img src="${g.photo}" alt="${g.caption}" loading="lazy">
        <div class="cap">${g.caption}</div>
      </div>
    `).join("");

    $$(".gallery-item", wrap).forEach(el => {
      el.addEventListener("click", () => openLightbox(parseInt(el.dataset.index, 10)));
    });
  }

  function openLightbox(index) {
    galleryIndex = index;
    updateLightbox();
    $("#lightbox").classList.add("open");
  }
  function updateLightbox() {
    const item = D.gallery[galleryIndex];
    $("#lightbox-img").src = item.photo;
    $("#lightbox-img").alt = item.caption;
    $("#lightbox-cap").textContent = item.caption;
  }
  function closeLightbox() { $("#lightbox").classList.remove("open"); }
  function nextLightbox() { galleryIndex = (galleryIndex + 1) % D.gallery.length; updateLightbox(); }
  function prevLightbox() { galleryIndex = (galleryIndex - 1 + D.gallery.length) % D.gallery.length; updateLightbox(); }

  /* ---------------------------------------------------------------
   * DRESS CODE
   * ------------------------------------------------------------- */
  function renderDressCode() {
    $("#dresscode-description").textContent = D.dressCode.description;
    $("#dresscode-swatches").innerHTML = D.dressCode.colors.map(c => `
      <div class="swatch">
        <div class="chip" style="background:${c.hex}"></div>
        <span>${c.name}</span>
      </div>
    `).join("");
    $("#dresscode-notes").innerHTML = D.dressCode.notes.map(n => `<li>${n}</li>`).join("");
  }

  /* ---------------------------------------------------------------
   * DIGITAL GIFT
   * ------------------------------------------------------------- */
  function renderDigitalGift() {
    $("#bank-panel").innerHTML = D.digitalGift.banks.map(b => `
      <div class="gift-card reveal">
        <div class="provider">${b.bank}</div>
        <div class="acc-name">${b.accountName}</div>
        <div class="acc-number">${b.accountNumber}</div>
        <div class="copy-row">
          <button class="copy-btn" data-copy="${b.accountNumber}">${iconCopy()} Salin Nomor</button>
        </div>
      </div>
    `).join("");

    $("#ewallet-panel").innerHTML = D.digitalGift.ewallets.map(w => `
      <div class="gift-card reveal">
        <div class="provider">${w.provider}</div>
        <div class="acc-name">${w.accountName}</div>
        <div class="acc-number">${w.number}</div>
        <div class="copy-row">
          <button class="copy-btn" data-copy="${w.number}">${iconCopy()} Salin Nomor</button>
        </div>
      </div>
    `).join("");

    $$("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        copyToClipboard(btn.dataset.copy);
        showToast("Nomor berhasil disalin!");
      });
    });

    $$(".gift-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".gift-tab").forEach(t => t.classList.remove("active"));
        $$(".gift-panel").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        $("#" + tab.dataset.target).classList.add("active");
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
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  let toastTimer;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------------------------------------------------------
   * RSVP FORM  (frontend-only demo; replace handleRsvpSubmit's TODO
   * with a fetch() call to your backend when ready)
   * ------------------------------------------------------------- */
  function initRsvpForm() {
    const form = $("#rsvp-form");
    if (!form) return;

    $$(".radio-pill", form).forEach(pill => {
      pill.addEventListener("click", () => {
        $$(".radio-pill", pill.parentElement).forEach(p => p.classList.remove("checked"));
        pill.classList.add("checked");
        $("input", pill).checked = true;
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      // TODO integrasi backend:
      // fetch('/api/rsvp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
      console.log("RSVP submitted (dummy):", data);

      showToast(`Terima kasih, ${data.name || "Tamu"}! Konfirmasi kehadiran diterima.`);
      form.reset();
      $$(".radio-pill", form).forEach(p => p.classList.remove("checked"));
    });
  }

  /* ---------------------------------------------------------------
   * WISHES / COMMENTS
   * ------------------------------------------------------------- */
  const WISHES_PAGE_SIZE = 4;
  let wishesShown = WISHES_PAGE_SIZE;
  // Local working copy — in production this state lives server-side.
  let wishesData = [...D.wishes];

  function renderWishes() {
    const list = $("#wishes-list");
    const sorted = [...wishesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const visible = sorted.slice(0, wishesShown);

    list.innerHTML = visible.map(w => `
      <div class="wish-item reveal is-visible">
        <div class="wish-head">
          <span class="wish-name">${escapeHtml(w.name)}</span>
          <span class="wish-date">${formatRelativeDate(w.createdAt)}</span>
        </div>
        <p class="wish-msg">${escapeHtml(w.message)}</p>
        <span class="wish-status ${w.attendance}">${w.attendance === "hadir" ? "Akan hadir" : "Tidak dapat hadir"}</span>
      </div>
    `).join("");

    const moreBtn = $("#wishes-load-more");
    moreBtn.style.display = wishesShown >= sorted.length ? "none" : "inline-flex";
  }

  function formatRelativeDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function initWishesForm() {
    const form = $("#wish-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.message) return;

      // TODO integrasi backend:
      // fetch('/api/wishes', { method:'POST', ... })
      wishesData.push({
        id: "w" + Date.now(),
        name: data.name,
        attendance: data.attendance || "hadir",
        message: data.message,
        createdAt: new Date().toISOString()
      });
      wishesShown = Math.max(wishesShown, WISHES_PAGE_SIZE);
      renderWishes();
      form.reset();
      showToast("Ucapan terkirim. Terima kasih!");
    });

    $("#wishes-load-more").addEventListener("click", () => {
      wishesShown += WISHES_PAGE_SIZE;
      renderWishes();
    });
  }

  /* ---------------------------------------------------------------
   * COUNTDOWN
   * ------------------------------------------------------------- */
  function initCountdown() {
    const target = new Date(D.events[0].date + "T" + D.events[0].timeStart + ":00");
    const els = {
      d: $("#cd-days"), h: $("#cd-hours"), m: $("#cd-minutes"), s: $("#cd-seconds")
    };
    if (!els.d) return;
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = "00"; return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      els.d.textContent = String(days).padStart(2, "0");
      els.h.textContent = String(hours).padStart(2, "0");
      els.m.textContent = String(mins).padStart(2, "0");
      els.s.textContent = String(secs).padStart(2, "0");
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
   * COVER / OPEN INVITATION
   * ------------------------------------------------------------- */
  function initCover() {
    $("#cover-photo").src = D.coverPhoto;
    const openBtn = $("#open-invitation-btn");
    openBtn.addEventListener("click", () => {
      $("#cover").classList.add("opened");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      toggleMusic(true);
      setTimeout(() => { $("#cover").style.display = "none"; }, 1050);
    });
  }

  /* ---------------------------------------------------------------
   * MUSIC TOGGLE
   * ------------------------------------------------------------- */
  function toggleMusic(forcePlay) {
    const audio = $("#bg-audio");
    const btn = $("#music-toggle");
    if (!audio.src) { return; } // no music file configured in data.js
    const shouldPlay = forcePlay !== undefined ? forcePlay : audio.paused;
    if (shouldPlay) {
      audio.play().catch(() => {});
      btn.classList.add("playing");
    } else {
      audio.pause();
      btn.classList.remove("playing");
    }
  }
  function initMusic() {
    if (D.meta.musicSrc) $("#bg-audio").src = D.meta.musicSrc;
    $("#music-toggle").addEventListener("click", () => toggleMusic());
  }

  /* ---------------------------------------------------------------
   * DOT NAV
   * ------------------------------------------------------------- */
  function initDotNav() {
    const sections = $$("main > section[id]");
    const dots = $$(".dotnav a");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          dots.forEach(d => d.classList.remove("active"));
          const dot = $(`.dotnav a[href="#${entry.target.id}"]`);
          if (dot) dot.classList.add("active");
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => io.observe(s));
  }

  /* ---------------------------------------------------------------
   * SCROLL REVEAL
   * ------------------------------------------------------------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    $$(".reveal").forEach(el => io.observe(el));
  }
  // Re-run for dynamically injected nodes (called after each render)
  function refreshReveal() {
    $$(".reveal:not(.is-visible)").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add("is-visible");
    });
    initReveal();
  }

  /* ---------------------------------------------------------------
   * LIGHTBOX EVENTS
   * ------------------------------------------------------------- */
  function initLightbox() {
    $("#lightbox-close").addEventListener("click", closeLightbox);
    $("#lightbox-next").addEventListener("click", nextLightbox);
    $("#lightbox-prev").addEventListener("click", prevLightbox);
    $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (!$("#lightbox").classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    });
  }

  /* ---------------------------------------------------------------
   * ICONS (inline SVG, no external deps)
   * ------------------------------------------------------------- */
  function iconCalendar() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`; }
  function iconPlus() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`; }
  function iconCopy() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`; }

  /* ---------------------------------------------------------------
   * PRELOADER
   * ------------------------------------------------------------- */
  function hidePreloader() {
    window.addEventListener("load", () => {
      setTimeout(() => $("#preloader").classList.add("hidden"), 400);
    });
    // fallback in case load already fired
    setTimeout(() => $("#preloader").classList.add("hidden"), 2500);
  }

  /* ---------------------------------------------------------------
   * INIT
   * ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderBasics();
    renderCouple();
    renderEvents();
    renderAddress();
    renderLoveStory();
    renderGallery();
    renderDressCode();
    renderDigitalGift();
    renderWishes();

    initCover();
    initMusic();
    initCountdown();
    initDotNav();
    initLightbox();
    initRsvpForm();
    initWishesForm();
    hidePreloader();

    document.documentElement.style.overflow = "hidden"; // lock scroll behind cover
    document.body.style.overflow = "hidden";
    refreshReveal();
    window.addEventListener("scroll", refreshReveal, { passive: true });
  });
})();
