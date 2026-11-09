/* ===== Antarmuka undangan: mengisi data dari WEDDING dan menjalankan fitur (tanpa 3D) ===== */
const UI = (() => {
  const W = WEDDING, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waUrl = (no, msg) => `https://wa.me/${no}?text=${encodeURIComponent(msg)}`;
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => k === 'class' ? e.className = v : e.setAttribute(k, v)); kids.forEach(k => e.append(k)); return e; };

  // warna tema dari konfigurasi
  Object.entries({ '--gading': W.tema.gading, '--sampanye': W.tema.sampanye, '--emas': W.tema.emas, '--sage': W.tema.sage, '--maroon': W.tema.maroon, '--kayu': W.tema.kayu })
    .forEach(([k, v]) => v && document.documentElement.style.setProperty(k, v));

  // isi teks
  const isi = {
    pria: W.mempelai.pria.panggilan, wanita: W.mempelai.wanita.panggilan, semboyan: W.semboyan, tanggalTampil: W.tanggalTampil, pembuka: W.pembuka,
    priaLengkap: W.mempelai.pria.lengkap, priaKet: W.mempelai.pria.keterangan, priaOrtu: W.mempelai.pria.ortu,
    wanitaLengkap: W.mempelai.wanita.lengkap, wanitaKet: W.mempelai.wanita.keterangan, wanitaOrtu: W.mempelai.wanita.ortu,
    lokasiNama: W.lokasi.nama, lokasiAlamat: W.lokasi.alamat, penutup: W.penutup
  };
  $$('[data-isi]').forEach(e => { const v = isi[e.dataset.isi]; if (v !== undefined) e.textContent = v; });
  $('#pemuatNama').textContent = `${isi.pria} & ${isi.wanita}`;
  document.title = `${isi.pria} & ${isi.wanita}`;

  // nama tamu dari tautan: undangan.html#Budi_Santoso
  let tamu = '';
  try { tamu = decodeURIComponent(location.hash.slice(1)).replace(/[_.~-]+/g, ' ').trim(); } catch (_) { }
  if (tamu && !document.getElementById(tamu.toLowerCase())) $('#namaTamu').textContent = tamu;
  else tamu = '';

  // hitung mundur
  const mulai = new Date(`${W.tanggal}T${W.acara[0].mulai}:00${W.zonaWaktu}`).getTime();
  const pad = n => String(n).padStart(2, '0');
  function hitung() {
    const d = mulai - Date.now();
    if (d <= 0) { $('#hitung').replaceChildren(el('p', { class: 'kecil', style: 'grid-column:1/-1;text-align:center' }, 'Hari bahagia telah tiba. Hatur nuhun atas doanya.')); return false; }
    const s = Math.floor(d / 1000);
    $('#cdH').textContent = Math.floor(s / 86400); $('#cdJ').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cdM').textContent = pad(Math.floor(s % 3600 / 60)); $('#cdD').textContent = pad(s % 60);
    return true;
  }
  if (hitung()) { const iv = setInterval(() => { if (!hitung()) clearInterval(iv); }, 1000); }

  // kisah cinta & galeri
  const lini = $('#lini');
  W.kisah.forEach(k => lini.append(el('li', {}, el('time', {}, k.tahun), el('b', {}, k.judul), el('p', {}, k.teks))));
  const galeri = $('#galeri');
  W.galeri.forEach((src, i) => {
    const b = el('button', { type: 'button', 'aria-label': `Buka foto ${i + 1}` }, el('img', { src, alt: `Foto galeri ${i + 1}`, loading: 'lazy' }));
    b.addEventListener('click', () => bukaFoto(i)); galeri.append(b);
  });
  $('#labelContoh').hidden = !W.fotoContoh;
  let lightbox = null;
  function bukaFoto(i) {
    tutupFoto();
    const img = el('img', { src: W.galeri[i], alt: `Foto galeri ${i + 1}` });
    const tutup = el('button', { class: 'btn btn-garis btn-kecil', type: 'button' }, 'Tutup');
    const prev = el('button', { class: 'btn btn-garis btn-kecil', type: 'button', 'aria-label': 'Foto sebelumnya' }, '‹');
    const next = el('button', { class: 'btn btn-garis btn-kecil', type: 'button', 'aria-label': 'Foto berikutnya' }, '›');
    lightbox = el('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Galeri foto' },
      el('figure', {}, img, el('figcaption', {}, el('span', {}, `${i + 1} / ${W.galeri.length}`), el('span', { class: 'baris-btn' }, prev, next, tutup))));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) tutupFoto(); });
    tutup.addEventListener('click', tutupFoto);
    prev.addEventListener('click', () => bukaFoto((i + W.galeri.length - 1) % W.galeri.length));
    next.addEventListener('click', () => bukaFoto((i + 1) % W.galeri.length));
    document.body.append(lightbox); tutup.focus();
  }
  function tutupFoto() { if (lightbox) { lightbox.remove(); lightbox = null; } }
  addEventListener('keydown', e => { if (e.key === 'Escape') tutupFoto(); });
  function aturLini(i) { $$('#lini li').forEach((li, k) => li.classList.toggle('aktif', k === i)); }
  aturLini(0);

  // jadwal, peta, kalender, dress code
  const jadwal = $('#jadwal');
  W.acara.forEach(a => jadwal.append(el('article', {},
    el('span', { class: 'ikon' }, svgUse('i-kalender')),
    el('div', {}, el('h3', {}, a.nama), el('p', { class: 'jam' }, `${a.mulai} – ${a.selesai} WIB`), el('p', { class: 'kecil' }, a.tempat), el('p', { class: 'kecil' }, a.catatan || '')))));
  function svgUse(id) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#' + id); s.append(u); return s; }
  $('#tautanPeta').href = W.lokasi.peta;
  {
    const toUTC = jam => { const d = new Date(`${W.tanggal}T${jam}:00${W.zonaWaktu}`); return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
    const a0 = W.acara[0], a1 = W.acara[W.acara.length - 1];
    const q = new URLSearchParams({ action: 'TEMPLATE', text: `Pernikahan ${isi.pria} & ${isi.wanita}`, dates: `${toUTC(a0.mulai)}/${toUTC(a1.selesai)}`,
      details: W.acara.map(a => `${a.nama}: ${a.mulai}–${a.selesai} WIB`).join('\n'), location: `${W.lokasi.nama}, ${W.lokasi.alamat}` });
    $('#tautanKalender').href = 'https://calendar.google.com/calendar/render?' + q.toString();
  }
  $('#dressCode').textContent = W.dressCode.aktif ? 'Dress code: ' + W.dressCode.teks : '';

  // RSVP: pesan WhatsApp ke keluarga mempelai (+ opsional endpoint backend)
  if (!W.rsvp.aktif) $('#blokRsvp').hidden = true;
  const jml = $('#rsvpJumlah'); for (let i = 1; i <= W.rsvp.maksTamu; i++) jml.append(el('option', {}, String(i)));
  if (tamu) $('#rsvpNama').value = tamu;
  $('#formRsvp').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.currentTarget, nama = f.nama.value.trim(), hadir = f.hadir.value === 'ya', n = f.jumlah.value;
    $('#rsvpGalat').hidden = !!nama; if (!nama) { f.nama.focus(); return; }
    const pesan = `Sampurasun, saya ${nama}. ${hadir ? `Insya Allah hadir (${n} orang)` : 'Mohon maaf, saya berhalangan hadir'} di pernikahan ${isi.pria} & ${isi.wanita}, ${W.tanggalTampil}.`;
    $('#rsvpPesan').textContent = pesan;
    $('#rsvpWa').href = waUrl(W.rsvp.whatsapp, pesan);
    let status = 'Konfirmasi belum terkirim. Tekan tombol di bawah untuk mengirimnya lewat WhatsApp.';
    if (W.rsvp.endpoint) {
      try { const r = await fetch(W.rsvp.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama, hadir, jumlah: +n, waktu: new Date().toISOString() }) });
        status = r.ok ? 'Konfirmasi tercatat. Terima kasih! Anda juga dapat mengabari lewat WhatsApp.' : 'Server konfirmasi tidak merespons. Silakan kirim lewat WhatsApp.'; }
      catch (_) { status = 'Server konfirmasi tidak dapat dihubungi. Silakan kirim lewat WhatsApp.'; }
    }
    $('#rsvpStatus').textContent = status;
    $('#rsvpHasil').hidden = false;
  });

  // tanda kasih
  if (!W.hadiah.aktif) $('#blokHadiah').hidden = true;
  W.hadiah.rekening.forEach(r => {
    const no = el('b', {}, r.nomor);
    const btn = el('button', { class: 'btn btn-garis btn-kecil', type: 'button' }, 'Salin');
    btn.addEventListener('click', () => salin(r.nomor.replace(/\s/g, ''), btn, no));
    $('#rekening').append(el('div', { class: 'rek' }, el('div', {}, el('span', { class: 'kecil' }, `${r.bank} · a.n. ${r.nama}`), el('br'), no), btn));
  });
  if (W.hadiah.qris) { $('#qris').hidden = false; $('#qris img').src = W.hadiah.qris; }
  $('#alamatKado').textContent = W.hadiah.alamatKado ? 'Kirim kado: ' + W.hadiah.alamatKado : '';
  function salin(teks, btn, target) {
    const ok = () => { btn.textContent = 'Tersalin'; setTimeout(() => btn.textContent = 'Salin', 1600); };
    const pilih = () => { const r = document.createRange(); r.selectNodeContents(target); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Terpilih'; };
    try { navigator.clipboard.writeText(teks).then(ok, pilih); } catch (_) { pilih(); }
  }

  // buku tamu: tersimpan di perangkat ini, atau ke endpoint bila diisi
  const KUNCI = 'ucapan-' + W.tanggal;
  const muatUcapan = () => { try { return JSON.parse(localStorage.getItem(KUNCI) || '[]'); } catch (_) { return []; } };
  const simpanUcapan = d => { try { localStorage.setItem(KUNCI, JSON.stringify(d)); return true; } catch (_) { return false; } };
  function tampilUcapan() {
    const box = $('#daftarUcapan'); box.replaceChildren();
    const data = muatUcapan();
    if (!data.length) box.append(el('p', { class: 'kecil' }, 'Belum ada ucapan. Jadilah yang pertama mendoakan.'));
    data.slice().reverse().forEach(u => box.append(el('article', {}, el('b', {}, u.nama, el('small', {}, new Date(u.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }))), el('p', {}, u.isi))));
  }
  $('#ucapCatatan').textContent = W.bukuTamu.endpoint ? '' : 'Ucapan disimpan di perangkat ini. Agar terbaca mempelai, kirim juga lewat WhatsApp.';
  $('#formUcapan').addEventListener('submit', async e => {
    e.preventDefault();
    const nama = $('#ucapNama').value.trim(), isiU = $('#ucapIsi').value.trim();
    $('#ucapGalat').hidden = !!(nama && isiU); if (!nama || !isiU) return;
    const data = muatUcapan(); data.push({ nama, isi: isiU, waktu: Date.now() }); simpanUcapan(data);
    if (W.bukuTamu.endpoint) { try { await fetch(W.bukuTamu.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama, isi: isiU }) }); } catch (_) { } }
    $('#ucapIsi').value = ''; tampilUcapan();
    if (window.Adegan) Adegan.taburMelati();
  });
  tampilUcapan();
  $('#kredit').href = waUrl(W.kredit.whatsapp, `Halo ${W.kredit.nama}, saya ingin membuat undangan seperti ini.`);
  $('#kredit').textContent = W.kredit.nama;

  // dok navigasi: tandai bagian aktif
  const bagian = ['sumping', 'uleman', 'panganten', 'carita', 'mapag', 'panineungan'];
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) $$('.dok a').forEach(a => a.setAttribute('aria-current', a.dataset.bagian === en.target.id)); }), { rootMargin: '-45% 0px -45% 0px' });
  bagian.forEach(id => io.observe(document.getElementById(id)));

  // pemuat
  const pemuat = { done: false };
  document.body.classList.add('memuat');
  function progres(p) { $('#pemuatBilah').style.width = Math.round(p * 100) + '%'; }
  function tutupPemuat() {
    if (pemuat.done) return; pemuat.done = true; progres(1);
    $('#pemuat').classList.add('selesai'); document.body.classList.remove('memuat');
    setTimeout(() => $('#pemuat')?.remove(), 1100);
    if (!reduce) $('.sambut').classList.add('masuk');
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  setTimeout(tutupPemuat, 14000);

  // status undangan dibuka
  const kejadian = new EventTarget();
  let terbuka = false;
  function bukaUndangan(sumber = 'tombol') {
    if (terbuka) return; terbuka = true;
    $('#panelUleman').classList.add('terbuka');
    kejadian.dispatchEvent(new CustomEvent('buka', { detail: sumber }));
  }
  $('#bukaUndangan').addEventListener('click', () => bukaUndangan('tombol'));

  return { reduce, aturLini, tutupPemuat, progres, bukaUndangan, kejadian, get terbuka() { return terbuka; } };
})();
