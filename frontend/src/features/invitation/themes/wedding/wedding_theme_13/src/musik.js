/* ===== Musik latar bernuansa kecapi suling, disintesis langsung di browser =====
   Kecapi: petikan Karplus-Strong. Suling: nada sinus dengan napas & vibrato.
   Tangga nada: pendekatan salendro (5 nada hampir sama jarak dalam satu oktaf). */
const Musik = (() => {
  let ctx = null, master = null, rev = null, timer = null, langkah = 0, nextT = 0;
  const DASAR = 293.66;                                      // nada dasar (D)
  const nada = (k, okt = 0) => DASAR * Math.pow(2, okt + k / 5);
  const buffers = new Map();

  function petik(freq) {                                     // Karplus-Strong, disimpan agar tidak dihitung ulang
    const key = freq.toFixed(2); if (buffers.has(key)) return buffers.get(key);
    const sr = ctx.sampleRate, len = Math.floor(sr * 2.6), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const N = Math.max(2, Math.round(sr / freq)), line = new Float32Array(N);
    for (let i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;
    let idx = 0, prev = 0;
    for (let i = 0; i < len; i++) { const cur = line[idx]; const v = .4985 * (cur + prev) * 1.0; prev = cur; line[idx] = v; d[i] = cur; idx = (idx + 1) % N; }
    buffers.set(key, buf); return buf;
  }
  function kecapi(freq, t, vol) {
    const s = ctx.createBufferSource(); s.buffer = petik(freq);
    const g = ctx.createGain(); g.gain.value = vol;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    s.connect(lp); lp.connect(g); g.connect(master); g.connect(rev); s.start(t);
  }
  function suling(freq, t, dur, vol) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = freq; o2.frequency.value = freq * 2;
    lfo.frequency.value = 5.2; lg.gain.value = freq * .006; lfo.connect(lg); lg.connect(o.frequency);
    const g2 = ctx.createGain(); g2.gain.value = .08; o2.connect(g2); g2.connect(g); o.connect(g);
    // napas: derau tersaring di sekitar nada
    const nb = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq * 2; bp.Q.value = 6;
    const ng = ctx.createGain(); ng.gain.value = .035; ns.connect(bp); bp.connect(ng); ng.connect(g);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .18); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur);
    g.connect(master); g.connect(rev);
    [o, o2, lfo, ns].forEach(n => { n.start(t); n.stop(t + dur + .05); });
  }
  // pola kecapi berulang dan frasa suling panjang (karya sendiri, bukan lagu yang ada)
  const POLA = [0, 2, 4, 2, 1, 3, 0, 2, 4, 3, 1, 2, 0, 4, 2, 1];
  const FRASA = [[4, 1, 2], [3, 1, 1], [2, 1, 2], [0, 1, 3], [1, 1, 2], [2, 1, 1], [4, 1, 1], [3, 1, 4], [null, 0, 2], [2, 1, 2], [4, 1, 2], [0, 2, 3], [4, 1, 3], [null, 0, 2]];
  let fi = 0, sulingSampai = 0;
  function jadwal() {
    const ketuk = .32;
    while (nextT < ctx.currentTime + .7) {
      const k = POLA[langkah % POLA.length];
      kecapi(nada(k, -1), nextT, .32);
      if (langkah % 4 === 0) kecapi(nada(POLA[(langkah / 4) % 5] , -2), nextT, .22);
      if (langkah % 8 === 6) kecapi(nada((k + 2) % 5, 0), nextT + ketuk / 2, .14);
      if (nextT >= sulingSampai) {
        const [nk, okt, lama] = FRASA[fi % FRASA.length]; fi++;
        const dur = lama * ketuk * 2;
        if (nk !== null) suling(nada(nk, okt), nextT, dur, .055);
        sulingSampai = nextT + dur;
      }
      nextT += ketuk; langkah++;
    }
  }
  function siapkan() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    // gema sederhana (delay berumpan balik) agar terasa seperti di pendopo terbuka
    rev = ctx.createDelay(1); rev.delayTime.value = .23; const fb = ctx.createGain(); fb.gain.value = .35; const wet = ctx.createGain(); wet.gain.value = .35;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(wet); wet.connect(ctx.destination);
  }
  return {
    get on() { return !!timer; },
    start() { if (!ctx) siapkan(); ctx.resume(); nextT = ctx.currentTime + .08; sulingSampai = nextT + .64; timer = setInterval(jadwal, 160); },
    stop() { clearInterval(timer); timer = null; if (ctx) ctx.suspend(); }
  };
})();
{
  const b = document.getElementById('tombolMusik');
  const segarkan = () => { b.setAttribute('aria-pressed', Musik.on); b.setAttribute('aria-label', Musik.on ? 'Hentikan musik latar' : 'Putar musik latar'); };
  b.hidden = !WEDDING.musik.aktif;
  b.addEventListener('click', () => { try { Musik.on ? Musik.stop() : Musik.start(); } catch (_) { } segarkan(); });
  UI.kejadian.addEventListener('buka', e => {
    if (WEDDING.musik.aktif && WEDDING.musik.putarSaatDibuka && e.detail === 'tombol' && !Musik.on) { try { Musik.start(); } catch (_) { } segarkan(); }
  });
}
