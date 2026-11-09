/**
 * main.js — rendering + interaction layer for the wedding invitation.
 * All content comes from WEDDING_DATA (js/data.js) so a real backend
 * can later replace that object (or feed an API response into it)
 * without any change here.
 */
(function () {
  "use strict";

  const D = WEDDING_DATA;

  /* ---------------------------------------------------------------
   * Guest name from URL (?to=Nama%20Tamu) — common invitation pattern
   * ------------------------------------------------------------- */
  function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get("to");
    const el = document.getElementById("guestName");
    if (el) el.textContent = guest ? decodeURIComponent(guest) : D.meta.guestNameFallback;
  }

  /* ---------------------------------------------------------------
   * Petals background
   * ------------------------------------------------------------- */
  function initPetals() {
    const wrap = document.getElementById("petals");
    if (!wrap) return;
    const count = window.innerWidth < 640 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const size = 8 + Math.random() * 10;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = 12 + Math.random() * 14 + "s";
      p.style.animationDelay = Math.random() * -20 + "s";
      p.style.opacity = 0.3 + Math.random() * 0.35;
      wrap.appendChild(p);
    }
  }

  /* ---------------------------------------------------------------
   * Cover / gate opening
   * ------------------------------------------------------------- */
  function initCover() {
    const cover = document.getElementById("cover");
    const openBtn = document.getElementById("openInvitation");
    const music = document.getElementById("bgMusic");
    const musicToggle = document.getElementById("musicToggle");

    document.getElementById("coverDate").textContent = D.events[0].dateDisplay;
    document.getElementById("heroDate").textContent = `${D.events[0].day}, ${D.events[0].dateDisplay}`;

    openBtn.addEventListener("click", function () {
      cover.classList.add("is-open");
      document.body.style.overflow = "auto";
      music.play().then(() => {
        musicToggle.classList.add("is-playing");
      }).catch(() => {/* autoplay blocked, user can tap the music button */});
      setTimeout(() => { cover.style.display = "none"; }, 1200);
      revealOnLoad();
    });

    document.body.style.overflow = "hidden";
  }

  function revealOnLoad() {
    // Trigger hero reveal immediately since it's already in view.
    document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------
   * Music toggle
   * ------------------------------------------------------------- */
  function initMusic() {
    const btn = document.getElementById("musicToggle");
    const audio = document.getElementById("bgMusic");
    btn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play();
        btn.classList.add("is-playing");
      } else {
        audio.pause();
        btn.classList.remove("is-playing");
      }
    });
  }

  /* ---------------------------------------------------------------
   * Nav: scroll shadow, mobile toggle, active link, smooth close
   * ------------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("navToggle");
    const list = document.getElementById("navList");

    window.addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    }, { passive: true });

    toggle.addEventListener("click", () => {
      toggle.classList.toggle("is-open");
      list.classList.toggle("is-open");
    });

    list.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        toggle.classList.remove("is-open");
        list.classList.remove("is-open");
      });
    });

    const links = document.querySelectorAll("[data-nav]");
    const sections = Array.from(links).map((a) => document.querySelector(a.getAttribute("href")));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          const match = Array.from(links).find((l) => l.getAttribute("href") === "#" + entry.target.id);
          if (match) match.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach((s) => s && obs.observe(s));
  }

  /* ---------------------------------------------------------------
   * Scroll reveal (IntersectionObserver) + timeline line draw
   * ------------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => obs.observe(el));

    const timeline = document.getElementById("timeline");
    if (timeline) {
      const tObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timeline.classList.add("is-drawn");
            tObs.disconnect();
          }
        });
      }, { threshold: 0.2 });
      tObs.observe(timeline);
    }
  }

  /* ---------------------------------------------------------------
   * Countdown timer
   * ------------------------------------------------------------- */
  function initCountdown() {
    const target = new Date(D.countdownTarget).getTime();
    const els = {
      d: document.getElementById("cdDays"),
      h: document.getElementById("cdHours"),
      m: document.getElementById("cdMinutes"),
      s: document.getElementById("cdSeconds"),
    };
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = "00";
        return;
      }
      const pad = (n) => String(n).padStart(2, "0");
      els.d.textContent = pad(Math.floor(diff / 86400000));
      els.h.textContent = pad(Math.floor((diff / 3600000) % 24));
      els.m.textContent = pad(Math.floor((diff / 60000) % 60));
      els.s.textContent = pad(Math.floor((diff / 1000) % 60));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
   * Couple section
   * ------------------------------------------------------------- */
  function renderCouple() {
    const g = D.couple.groom, b = D.couple.bride;
    document.getElementById("groomName").textContent = g.fullName;
    document.getElementById("groomOrder").textContent = g.order;
    document.getElementById("groomParents").textContent = g.parents;
    document.getElementById("groomBio").textContent = g.bio;
    document.getElementById("groomIg").href = "https://instagram.com/" + g.instagram.replace("@", "");
    document.getElementById("groomIgText").textContent = g.instagram;

    document.getElementById("brideName").textContent = b.fullName;
    document.getElementById("brideOrder").textContent = b.order;
    document.getElementById("brideParents").textContent = b.parents;
    document.getElementById("brideBio").textContent = b.bio;
    document.getElementById("brideIg").href = "https://instagram.com/" + b.instagram.replace("@", "");
    document.getElementById("brideIgText").textContent = b.instagram;

    document.getElementById("quoteText").textContent = `"${D.quote.text}"`;
    document.getElementById("quoteSource").textContent = D.quote.source;
  }

  /* ---------------------------------------------------------------
   * Event cards
   * ------------------------------------------------------------- */
  function renderEvents() {
    const wrap = document.getElementById("eventGrid");
    wrap.innerHTML = D.events.map((ev, i) => `
      <div class="event-card reveal" data-anim="fade-up" data-delay="${i}">
        <p class="event-card__day">${ev.day}</p>
        <h3 class="event-card__label">${ev.label}</h3>
        <p class="event-card__date">${ev.dateDisplay}</p>
        <p class="event-card__time">${ev.timeDisplay}</p>
        <div class="event-card__divider"></div>
        <p class="event-card__place">${ev.place}</p>
        <p class="event-card__address">${ev.address}</p>
        <a class="btn btn--outline" href="${ev.mapsUrl}" target="_blank" rel="noopener">Lihat Lokasi</a>
      </div>
    `).join("");
    wireReveal(wrap);
  }

  /* ---------------------------------------------------------------
   * Address / map
   * ------------------------------------------------------------- */
  function renderAddress() {
    document.getElementById("venueName").textContent = D.venue.name;
    document.getElementById("venueAddress").textContent = D.venue.fullAddress;
    document.getElementById("venueNote").textContent = D.venue.notes;
    document.getElementById("btnMaps").href = D.venue.mapsUrl;
    document.getElementById("btnDirections").href = D.venue.mapsUrl;
    document.getElementById("mapEmbed").src = D.venue.mapsEmbedSrc;
  }

  /* ---------------------------------------------------------------
   * Love story timeline
   * ------------------------------------------------------------- */
  function renderTimeline() {
    const wrap = document.getElementById("timeline");
    wrap.innerHTML = D.loveStory.map((item) => `
      <div class="timeline-item reveal" data-anim="fade-up">
        <span class="timeline-item__dot"></span>
        <img class="timeline-item__photo" src="${item.photo}" alt="${item.title}" loading="lazy">
        <p class="timeline-item__date">${item.date}</p>
        <h3 class="timeline-item__title">${item.title}</h3>
        <p class="timeline-item__desc">${item.description}</p>
      </div>
    `).join("");
    wireReveal(wrap);
  }

  /* ---------------------------------------------------------------
   * Gallery + lightbox
   * ------------------------------------------------------------- */
  let galleryIndex = 0;
  function renderGallery() {
    const wrap = document.getElementById("galleryGrid");
    wrap.innerHTML = D.gallery.map((g, i) => `
      <div class="gallery-item reveal" data-anim="fade-up" data-delay="${i % 4}" data-index="${i}">
        <img src="${g.src}" alt="${g.caption}" loading="lazy">
        <div class="gallery-item__overlay"><span>${g.caption}</span></div>
      </div>
    `).join("");
    wireReveal(wrap);

    wrap.querySelectorAll(".gallery-item").forEach((el) => {
      el.addEventListener("click", () => openLightbox(parseInt(el.dataset.index, 10)));
    });
  }

  function openLightbox(index) {
    galleryIndex = index;
    updateLightbox();
    document.getElementById("lightbox").classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function updateLightbox() {
    const item = D.gallery[galleryIndex];
    document.getElementById("lightboxImg").src = item.src;
    document.getElementById("lightboxImg").alt = item.caption;
    document.getElementById("lightboxCaption").textContent = item.caption;
  }
  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("is-open");
    document.body.style.overflow = "auto";
  }
  function initLightbox() {
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightbox").addEventListener("click", (e) => {
      if (e.target.id === "lightbox") closeLightbox();
    });
    document.getElementById("lightboxPrev").addEventListener("click", () => {
      galleryIndex = (galleryIndex - 1 + D.gallery.length) % D.gallery.length;
      updateLightbox();
    });
    document.getElementById("lightboxNext").addEventListener("click", () => {
      galleryIndex = (galleryIndex + 1) % D.gallery.length;
      updateLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!document.getElementById("lightbox").classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") document.getElementById("lightboxPrev").click();
      if (e.key === "ArrowRight") document.getElementById("lightboxNext").click();
    });
  }

  /* ---------------------------------------------------------------
   * Dress code
   * ------------------------------------------------------------- */
  function renderDressCode() {
    document.getElementById("dressIntro").textContent = D.dressCode.intro;
    document.getElementById("palette").innerHTML = D.dressCode.palette.map((c, i) => `
      <div class="swatch reveal" data-anim="fade-up" data-delay="${i % 4}">
        <div class="swatch__circle" style="background:${c.hex}"></div>
        <div class="swatch__name">${c.name}</div>
        <div class="swatch__hex">${c.hex}</div>
      </div>
    `).join("");
    document.getElementById("dressDo").innerHTML = D.dressCode.dos.map((t) => `<li>${t}</li>`).join("");
    document.getElementById("dressDont").innerHTML = D.dressCode.donts.map((t) => `<li>${t}</li>`).join("");
    wireReveal(document.getElementById("palette"));
  }

  /* ---------------------------------------------------------------
   * Digital gift (bank / e-wallet) with copy-to-clipboard
   * ------------------------------------------------------------- */
  function fallbackCopy(text) {
    // Fallback for contexts where navigator.clipboard is unavailable or
    // blocked (e.g. the page opened directly via file:// or an insecure
    // origin). Uses a temporary off-screen textarea + execCommand.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function markCopied(btn) {
    showToast("Nomor berhasil disalin");
    btn.classList.add("is-copied");
    const original = btn.textContent;
    btn.textContent = "Tersalin \u2713";
    setTimeout(() => { btn.classList.remove("is-copied"); btn.textContent = original; }, 1800);
  }

  function copyText(text, btn) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => markCopied(btn),
        () => { fallbackCopy(text) ? markCopied(btn) : showToast("Gagal menyalin, silakan salin manual"); }
      );
    } else {
      fallbackCopy(text) ? markCopied(btn) : showToast("Gagal menyalin, silakan salin manual");
    }
  }

  function renderGift() {
    document.getElementById("giftIntro").textContent = D.digitalGifts.intro;

    document.getElementById("bankPanel").innerHTML = D.digitalGifts.banks.map((b) => `
      <div class="gift-card">
        <div class="gift-card__top"><span class="gift-card__bank">${b.bank}</span></div>
        <div class="gift-card__number">${b.accountNumber}</div>
        <div class="gift-card__name">a.n. ${b.accountName}</div>
        <button class="gift-card__copy" data-copy="${b.accountNumber}" type="button">Salin Nomor</button>
      </div>
    `).join("");

    document.getElementById("ewalletPanel").innerHTML = D.digitalGifts.ewallets.map((e) => `
      <div class="gift-card">
        <div class="gift-card__top">
          <span class="gift-card__bank">${e.name}</span>
          ${e.qr ? `<img class="gift-card__qr" src="${e.qr}" alt="QR ${e.name}">` : ""}
        </div>
        <div class="gift-card__number">${e.number}</div>
        <div class="gift-card__name">a.n. ${e.accountName}</div>
        <button class="gift-card__copy" data-copy="${e.number}" type="button">Salin Nomor</button>
      </div>
    `).join("");

    document.querySelectorAll(".gift-card__copy").forEach((btn) => {
      btn.addEventListener("click", () => copyText(btn.dataset.copy.replace(/-/g, ""), btn));
    });

    document.querySelectorAll(".gift-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".gift-tab").forEach((t) => t.classList.remove("is-active"));
        document.querySelectorAll(".gift-panel").forEach((p) => p.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("is-active");
      });
    });
  }

  /* ---------------------------------------------------------------
   * RSVP form (dummy submit -> localStorage, ready for real API swap)
   * ------------------------------------------------------------- */
  function initRsvp() {
    const form = document.getElementById("rsvpForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        name: document.getElementById("rsvpName").value.trim(),
        phone: document.getElementById("rsvpPhone").value.trim(),
        guests: document.getElementById("rsvpGuests").value,
        attendance: form.querySelector('input[name="attendance"]:checked').value,
        message: document.getElementById("rsvpMessage").value.trim(),
        submittedAt: new Date().toISOString(),
      };

      // TODO(backend): replace with e.g. fetch('/api/rsvp', { method:'POST', body: JSON.stringify(payload) })
      const stored = JSON.parse(localStorage.getItem("rsvp_responses") || "[]");
      stored.push(payload);
      localStorage.setItem("rsvp_responses", JSON.stringify(stored));

      document.getElementById("rsvpNote").textContent = "Terima kasih! Konfirmasi kehadiran Anda telah kami terima.";
      showToast("Konfirmasi kehadiran terkirim");
      form.reset();
    });
  }

  /* ---------------------------------------------------------------
   * Wishes / comments (dummy data + localStorage additions + pagination)
   * ------------------------------------------------------------- */
  let wishesVisible = WISHES_PAGE_SIZE;
  function getAllWishes() {
    const local = JSON.parse(localStorage.getItem("local_wishes") || "[]");
    return [...local, ...D.wishes].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  function attendanceLabel(v) {
    return { hadir: "Hadir", tidak_hadir: "Tidak Hadir", ragu: "Masih Ragu", belum_konfirmasi: "Belum Konfirmasi" }[v] || v;
  }
  function renderWishes() {
    const all = getAllWishes();
    const wrap = document.getElementById("wishesList");
    const visible = all.slice(0, wishesVisible);
    document.getElementById("wishesCount").textContent = `${all.length} ucapan`;
    wrap.innerHTML = visible.map((w) => `
      <div class="wish-card">
        <div class="wish-card__top">
          <span class="wish-card__name">${escapeHtml(w.name)}</span>
          <span class="wish-card__badge wish-card__badge--${w.attendance}">${attendanceLabel(w.attendance)}</span>
        </div>
        <p class="wish-card__msg">${escapeHtml(w.message)}</p>
        <p class="wish-card__date">${new Date(w.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
    `).join("");
    document.getElementById("loadMoreWishes").style.display = visible.length < all.length ? "inline-flex" : "none";
  }
  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function initWishes() {
    renderWishes();
    document.getElementById("loadMoreWishes").addEventListener("click", () => {
      wishesVisible += WISHES_PAGE_SIZE;
      renderWishes();
    });

    document.getElementById("wishForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("wishName").value.trim();
      const message = document.getElementById("wishMessage").value.trim();
      if (!name || !message) return;

      // TODO(backend): replace with fetch('/api/wishes', { method:'POST', body: ... })
      const local = JSON.parse(localStorage.getItem("local_wishes") || "[]");
      local.unshift({
        id: "local-" + Date.now(),
        name, message,
        attendance: "hadir",
        date: new Date().toISOString(),
      });
      localStorage.setItem("local_wishes", JSON.stringify(local));

      wishesVisible = Math.max(wishesVisible, WISHES_PAGE_SIZE);
      renderWishes();
      showToast("Ucapan Anda telah terkirim");
      this.reset();
    });
  }

  /* ---------------------------------------------------------------
   * Closing / footer + back to top
   * ------------------------------------------------------------- */
  function initClosing() {
    document.getElementById("closingHashtag").textContent = D.meta.hashtag;
    document.getElementById("backToTop").addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------
   * Toast helper
   * ------------------------------------------------------------- */
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  }

  /* ---------------------------------------------------------------
   * Helper: (re)wire reveal observer for dynamically injected nodes
   * ------------------------------------------------------------- */
  function wireReveal(container) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    container.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
  }

  /* ---------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initGuestName();
    initPetals();
    initCover();
    initMusic();
    initNav();
    initCountdown();
    renderCouple();
    renderEvents();
    renderAddress();
    renderTimeline();
    renderGallery();
    initLightbox();
    renderDressCode();
    renderGift();
    initRsvp();
    initWishes();
    initClosing();
    initReveal(); // observe static .reveal nodes present at load
  });

})();
