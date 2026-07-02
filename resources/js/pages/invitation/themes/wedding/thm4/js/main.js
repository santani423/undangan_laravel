/* =====================================================
   Wedding Invitation – Main JS
   Rizky & Nadira
   ===================================================== */

'use strict';

/* ===== COVER / OPEN ===== */
function openInvitation() {
  const cover = document.getElementById('cover');
  const main  = document.getElementById('main-content');
  cover.classList.add('hide');
  setTimeout(() => {
    cover.style.display = 'none';
    main.classList.remove('hidden');
    initReveal();
    initCountdown();
    renderWishes();
    tryAutoplay();
  }, 800);
}

/* ===== SCROLL REVEAL ===== */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/* ===== COUNTDOWN ===== */
function initCountdown() {
  const target = new Date('2025-07-19T08:00:00');
  function tick() {
    const now  = new Date();
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById('cd-days').textContent  = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent  = '00';
      document.getElementById('cd-secs').textContent  = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent  = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);
}

/* ===== MUSIC ===== */
let musicPlaying = false;
function tryAutoplay() {
  const audio = document.getElementById('bg-music');
  audio.volume = 0.4;
  audio.play().then(() => {
    musicPlaying = true;
    document.getElementById('music-btn').classList.remove('paused');
  }).catch(() => {
    document.getElementById('music-btn').classList.add('paused');
  });
}
function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');
  if (musicPlaying) {
    audio.pause();
    btn.classList.add('paused');
  } else {
    audio.play();
    btn.classList.remove('paused');
  }
  musicPlaying = !musicPlaying;
}

/* ===== LIGHTBOX ===== */
const galleryImages = [
  'img/gallery1.jpg',
  'img/gallery2.jpg',
  'img/gallery3.jpg',
  'img/gallery4.jpg',
  'img/gallery5.jpg',
  'img/gallery6.jpg',
];
let currentImg = 0;

function openLightbox(index) {
  currentImg = index;
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  img.src = galleryImages[index];
  img.alt = 'Foto ' + (index + 1);
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function changeLightbox(dir) {
  currentImg = (currentImg + dir + galleryImages.length) % galleryImages.length;
  document.getElementById('lb-img').src = galleryImages[currentImg];
}
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  changeLightbox(1);
  if (e.key === 'ArrowLeft')   changeLightbox(-1);
});

/* ===== COPY TO CLIPBOARD ===== */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Tersalin! ✓';
    btn.classList.add('copied');
    showToast('Nomor berhasil disalin!');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Nomor berhasil disalin!');
  });
}

/* ===== TOAST ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ===== RSVP FORM ===== */
function submitRSVP(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name:    form.name.value,
    whatsapp: form.whatsapp.value,
    guests:  form.guests.value,
    attend:  form.attend.value,
    message: form.message.value,
    timestamp: new Date().toISOString(),
  };
  console.log('RSVP Data:', data);
  // TODO: POST to backend endpoint e.g. /api/rsvp
  form.reset();
  showToast('Terima kasih! Konfirmasi Anda telah diterima 🙏');
}

/* ===== WISHES ===== */
const WISHES_PER_PAGE = 5;
let wishPage = 0;

const seedWishes = [
  {
    name: 'Budi Santoso',
    wish: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Barakallahu lakuma.',
    time: '2025-06-10T09:15:00',
  },
  {
    name: 'Siti Aminah',
    wish: 'Alhamdulillah akhirnya menikah juga! Semoga langgeng sampai kakek nenek dan selalu bahagia bersama. Doaku selalu menyertai kalian.',
    time: '2025-06-11T14:22:00',
  },
  {
    name: 'Deni Kurniawan',
    wish: 'Selamat dan bahagia untuk Rizky & Nadira! Semoga Allah SWT meridhoi dan memberkahi rumah tangga kalian.',
    time: '2025-06-12T08:40:00',
  },
  {
    name: 'Ratna Dewi',
    wish: 'Wah akhirnya jadian juga setelah sekian lama 😄 Selamat ya! Semoga semakin kompak dan bahagia!',
    time: '2025-06-12T16:05:00',
  },
  {
    name: 'Ahmad Faisal',
    wish: 'Barakallahu lakuma wabaraka alaykuma wa jama\'a baynakuma fii khair. Semoga menjadi keluarga yang berkah dan harmonis.',
    time: '2025-06-13T10:30:00',
  },
  {
    name: 'Maya Sari',
    wish: 'Selamat ya Rizky dan Nadira! Semoga kalian selalu diberi kesehatan, kebahagiaan, dan rezeki yang berlimpah.',
    time: '2025-06-13T19:45:00',
  },
  {
    name: 'Hendra Wijaya',
    wish: 'Congratulations! Semoga pernikahannya langgeng dan segera dikaruniai keturunan yang soleh dan soleha.',
    time: '2025-06-14T07:20:00',
  },
];

let wishes = [...seedWishes];

function renderWishes() {
  const list = document.getElementById('wish-list');
  const start = wishPage * WISHES_PER_PAGE;
  const end   = start + WISHES_PER_PAGE;
  const slice = wishes.slice().reverse().slice(start, end);

  list.innerHTML = slice.map(w => {
    const initial = w.name.charAt(0).toUpperCase();
    const timeStr = formatTime(w.time);
    return `
      <div class="wish-item">
        <div class="wish-item-header">
          <div class="wish-avatar">${initial}</div>
          <span class="wish-name">${escHtml(w.name)}</span>
          <span class="wish-time">${timeStr}</span>
        </div>
        <p class="wish-text">"${escHtml(w.wish)}"</p>
      </div>`;
  }).join('');

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(wishes.length / WISHES_PER_PAGE);
  const pg    = document.getElementById('wish-pagination');
  if (total <= 1) { pg.innerHTML = ''; return; }
  pg.innerHTML = Array.from({length: total}, (_, i) =>
    `<button class="pg-btn${i === wishPage ? ' active' : ''}" onclick="goPage(${i})">${i+1}</button>`
  ).join('');
}

function goPage(p) {
  wishPage = p;
  renderWishes();
  document.getElementById('wishes').scrollIntoView({behavior:'smooth', block:'start'});
}

function submitWish(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.wname.value.trim();
  const wish = form.wish.value.trim();
  if (!name || !wish) return;

  const entry = { name, wish, time: new Date().toISOString() };
  wishes.unshift(entry);
  // TODO: POST to backend endpoint e.g. /api/wishes
  wishPage = 0;
  renderWishes();
  form.reset();
  showToast('Ucapan Anda telah terkirim 💌');
}

/* ===== HELPERS ===== */
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
