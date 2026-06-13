
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Undangan Pernikahan Bylla & Firman</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&family=Dancing+Script:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ===== RESET & BASE ===== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --sage:        #6B7C5C;
      --sage-light:  #8FA07A;
      --sage-pale:   #C8D5BB;
      --cream:       #F5EFE0;
      --cream-dark:  #EDE3CC;
      --gold:        #C8A96E;
      --gold-light:  #E2C896;
      --gold-pale:   #F0E4C8;
      --brown:       #7A5C3C;
      --dark:        #2C2416;
      --text:        #4A3C28;
      --text-light:  #7A6850;
      --white:       #FFFDF8;
      --font-serif:  'Cormorant Garamond', Georgia, serif;
      --font-sans:   'Montserrat', sans-serif;
      --font-script: 'Dancing Script', cursive;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      background: var(--cream);
      color: var(--text);
      overflow-x: hidden;
    }
    img { max-width: 100%; display: block; }
    a { text-decoration: none; color: inherit; }

    /* ===== OVERLAY / COVER ===== */
    #cover-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: var(--dark);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 1.5rem;
      transition: opacity 0.8s ease, visibility 0.8s ease;
    }
    #cover-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
    .cover-monogram {
      font-family: var(--font-script);
      font-size: clamp(3rem, 8vw, 5rem);
      color: var(--gold);
      letter-spacing: 0.05em;
    }
    .cover-sub {
      font-family: var(--font-sans);
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--gold-pale);
    }
    .cover-divider {
      width: 80px; height: 1px; background: var(--gold);
    }
    .cover-names {
      font-family: var(--font-serif);
      font-size: clamp(1.1rem, 3vw, 1.5rem);
      color: var(--cream);
      letter-spacing: 0.2em;
      text-align: center;
    }
    .btn-open {
      margin-top: 1rem;
      padding: 0.85rem 2.5rem;
      border: 1px solid var(--gold);
      color: var(--gold);
      font-family: var(--font-sans);
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      background: transparent;
      cursor: pointer;
      transition: all 0.35s ease;
    }
    .btn-open:hover { background: var(--gold); color: var(--dark); }

    /* ===== ORNAMENT HELPER ===== */
    .ornament {
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      color: var(--gold); font-size: 1rem; margin: 0.5rem 0;
    }
    .ornament::before, .ornament::after {
      content: ''; flex: 1; height: 1px; background: var(--gold); max-width: 60px;
    }
    .section-label {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--sage);
    }
    .section-title {
      font-family: var(--font-script);
      font-size: clamp(2.2rem, 5vw, 3.2rem);
      color: var(--brown);
      line-height: 1.1;
    }
    .section-title-serif {
      font-family: var(--font-serif);
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      color: var(--brown);
      font-weight: 400;
      letter-spacing: 0.05em;
    }
    .gold-line {
      width: 60px; height: 2px; background: var(--gold); margin: 1rem auto;
    }

    /* ===== MAIN WRAPPER ===== */
    #main { opacity: 0; transition: opacity 0.8s ease; }
    #main.visible { opacity: 1; }

    /* ===== HERO SECTION ===== */
    #hero {
      min-height: 100vh;
      background: linear-gradient(160deg, #2C2416 0%, #3D3020 40%, #4A3C28 70%, #5C4A30 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 4rem 2rem;
      position: relative; overflow: hidden;
    }
    #hero::before {
      content: '';
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Ccircle cx='200' cy='200' r='180' fill='none' stroke='%23C8A96E' stroke-width='0.4' stroke-dasharray='4 6'/%3E%3Ccircle cx='200' cy='200' r='155' fill='none' stroke='%23C8A96E' stroke-width='0.2'/%3E%3C/svg%3E") center/80vmin no-repeat;
      opacity: 0.15;
    }
    .hero-floral {
      position: absolute;
      opacity: 0.12;
      pointer-events: none;
    }
    .hero-floral-tl { top: -40px; left: -40px; width: 260px; transform: rotate(0deg); }
    .hero-floral-br { bottom: -40px; right: -40px; width: 260px; transform: rotate(180deg); }

    .hero-invite-text {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.4em;
      color: var(--gold-pale);
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .hero-photo-wrap {
      position: relative; width: 220px; height: 260px;
      margin: 1.5rem auto;
    }
    .hero-photo-wrap::before {
      content: '';
      position: absolute; inset: -8px;
      border: 1px solid var(--gold);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      opacity: 0.5;
    }
    .hero-photo-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    }
    .hero-photo-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(145deg, #4A3C28, #6B5A40);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-script);
      font-size: 4rem;
      color: var(--gold);
    }
    .hero-script { font-family: var(--font-script); }
    .hero-groom {
      font-family: var(--font-script);
      font-size: clamp(2.8rem, 7vw, 4.5rem);
      color: var(--white);
      line-height: 1;
    }
    .hero-ampersand {
      font-family: var(--font-script);
      font-size: clamp(2rem, 5vw, 3rem);
      color: var(--gold);
      display: block; margin: 0.3rem 0;
    }
    .hero-bride {
      font-family: var(--font-script);
      font-size: clamp(2.8rem, 7vw, 4.5rem);
      color: var(--white);
      line-height: 1;
    }
    .hero-date-wrap {
      margin-top: 1.5rem;
      display: flex; align-items: center; gap: 1.5rem;
    }
    .hero-date-item {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: var(--gold-pale);
      text-transform: uppercase;
    }
    .hero-date-num {
      font-family: var(--font-serif);
      font-size: 2.5rem;
      color: var(--gold);
      font-weight: 300;
      display: block;
    }
    .hero-separator { width: 1px; height: 40px; background: var(--gold); opacity: 0.5; }
    .hero-scroll {
      margin-top: 3rem;
      animation: bounce 2s infinite;
      color: var(--gold);
      font-size: 1.2rem;
      opacity: 0.7;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(8px); }
    }

    /* ===== SECTION WRAPPER ===== */
    .section {
      padding: 5rem 2rem;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
    }
    .section-full {
      padding: 5rem 2rem;
      text-align: center;
    }

    /* ===== QUOTE STRIP ===== */
    .quote-strip {
      background: var(--dark);
      padding: 3.5rem 2rem;
      text-align: center;
    }
    .quote-strip blockquote {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: var(--gold-pale);
      max-width: 680px;
      margin: 0 auto 0.75rem;
      line-height: 1.8;
    }
    .quote-strip cite {
      font-family: var(--font-sans);
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      color: var(--gold);
      text-transform: uppercase;
    }

    /* ===== COUPLE SECTION ===== */
    #couple { background: var(--white); }
    .couple-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 2rem;
      align-items: start;
      max-width: 800px; margin: 3rem auto 0;
    }
    .couple-card { text-align: center; }
    .couple-photo {
      width: 160px; height: 200px;
      border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
      margin: 0 auto 1.2rem;
      overflow: hidden;
      border: 4px solid var(--cream-dark);
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }
    .couple-photo img { width: 100%; height: 100%; object-fit: cover; }
    .couple-photo-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(145deg, var(--sage-pale), var(--sage));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-script); font-size: 2.5rem; color: var(--white);
    }
    .couple-role {
      font-family: var(--font-sans); font-size: 0.6rem;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: var(--sage); margin-bottom: 0.4rem;
    }
    .couple-name {
      font-family: var(--font-script);
      font-size: clamp(1.6rem, 3.5vw, 2rem);
      color: var(--brown);
    }
    .couple-full {
      font-family: var(--font-serif);
      font-size: 0.95rem;
      color: var(--text-light);
      margin: 0.3rem 0;
    }
    .couple-parents {
      font-family: var(--font-sans);
      font-size: 0.72rem;
      line-height: 1.6;
      color: var(--text-light);
      margin-top: 0.7rem;
    }
    .couple-parents strong { color: var(--text); }
    .couple-center {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding-top: 2.5rem;
    }
    .couple-ampersand {
      font-family: var(--font-script);
      font-size: 3.5rem;
      color: var(--gold);
    }

    /* ===== EVENT SECTION ===== */
    #event { background: var(--cream); }
    .event-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 2rem; margin-top: 3rem;
    }
    .event-card {
      background: var(--white);
      border: 1px solid var(--cream-dark);
      padding: 2.5rem 2rem;
      position: relative;
    }
    .event-card::before {
      content: '';
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 40px; height: 3px; background: var(--gold);
    }
    .event-icon { font-size: 2rem; margin-bottom: 1rem; color: var(--sage); }
    .event-type {
      font-family: var(--font-sans);
      font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase;
      color: var(--sage); margin-bottom: 0.5rem;
    }
    .event-name {
      font-family: var(--font-serif);
      font-size: 1.6rem; color: var(--brown);
      font-weight: 400; margin-bottom: 1.2rem;
    }
    .event-detail {
      font-family: var(--font-sans);
      font-size: 0.78rem; line-height: 1.8;
      color: var(--text-light);
    }
    .event-detail strong { color: var(--text); display: block; }
    .btn-maps {
      display: inline-flex; align-items: center; gap: 0.5rem;
      margin-top: 1.5rem; padding: 0.6rem 1.5rem;
      border: 1px solid var(--sage);
      color: var(--sage);
      font-family: var(--font-sans); font-size: 0.68rem;
      letter-spacing: 0.15em; text-transform: uppercase;
      transition: all 0.3s;
    }
    .btn-maps:hover { background: var(--sage); color: var(--white); }

    /* ===== MAP SECTION ===== */
    #map { background: var(--white); }
    .map-wrap {
      max-width: 800px; margin: 2.5rem auto 0;
      border: 6px solid var(--cream-dark);
    }
    .map-wrap iframe { width: 100%; height: 400px; display: block; border: none; }
    .map-address {
      font-family: var(--font-sans); font-size: 0.8rem;
      line-height: 1.9; color: var(--text-light);
      max-width: 480px; margin: 1.5rem auto 0;
    }
    .btn-nav {
      display: inline-flex; align-items: center; gap: 0.5rem;
      margin-top: 1.5rem; padding: 0.85rem 2rem;
      background: var(--sage);
      color: var(--white);
      font-family: var(--font-sans); font-size: 0.72rem;
      letter-spacing: 0.15em; text-transform: uppercase;
      transition: background 0.3s;
    }
    .btn-nav:hover { background: var(--sage-light); }

    /* ===== LOVE STORY ===== */
    #lovestory { background: var(--cream); }
    .timeline {
      position: relative; max-width: 700px; margin: 3rem auto 0;
      padding: 0 1rem;
    }
    .timeline::before {
      content: ''; position: absolute;
      left: 50%; top: 0; bottom: 0; width: 1px;
      background: linear-gradient(to bottom, transparent, var(--gold) 10%, var(--gold) 90%, transparent);
      transform: translateX(-50%);
    }
    .tl-item {
      display: grid; grid-template-columns: 1fr 40px 1fr;
      gap: 0; margin-bottom: 3.5rem;
      opacity: 0; transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .tl-item.visible { opacity: 1; transform: translateY(0); }
    .tl-item:nth-child(odd) .tl-content { grid-column: 1; text-align: right; padding-right: 2rem; }
    .tl-item:nth-child(odd) .tl-photo  { grid-column: 3; padding-left: 2rem; }
    .tl-item:nth-child(even) .tl-content { grid-column: 3; text-align: left; padding-left: 2rem; order: 3; }
    .tl-item:nth-child(even) .tl-photo  { grid-column: 1; padding-right: 2rem; order: 1; }
    .tl-dot {
      grid-column: 2; align-self: start; margin-top: 0.5rem;
      width: 40px; height: 40px;
      border-radius: 50%; background: var(--gold);
      border: 4px solid var(--cream);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; color: var(--white);
      box-shadow: 0 0 0 4px var(--gold-pale);
    }
    .tl-date {
      font-family: var(--font-sans); font-size: 0.6rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--sage); margin-bottom: 0.3rem;
    }
    .tl-title {
      font-family: var(--font-serif);
      font-size: 1.2rem; color: var(--brown); font-weight: 500;
    }
    .tl-desc {
      font-family: var(--font-sans); font-size: 0.75rem;
      line-height: 1.7; color: var(--text-light); margin-top: 0.4rem;
    }
    .tl-img {
      width: 100%; aspect-ratio: 4/3;
      background: linear-gradient(135deg, var(--sage-pale), var(--sage));
      border-radius: 4px; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--white);
    }
    .tl-img img { width: 100%; height: 100%; object-fit: cover; }

    /* ===== GALLERY ===== */
    #gallery { background: var(--white); }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      max-width: 900px; margin: 2.5rem auto 0;
    }
    .gallery-item {
      aspect-ratio: 1; overflow: hidden;
      cursor: pointer; position: relative;
    }
    .gallery-item:nth-child(4) { grid-column: span 2; aspect-ratio: 2/1; }
    .gallery-item img,
    .gallery-placeholder {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .gallery-placeholder {
      background: linear-gradient(135deg, var(--sage-pale), var(--cream-dark));
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-script); font-size: 2rem; color: var(--sage);
    }
    .gallery-item:hover img,
    .gallery-item:hover .gallery-placeholder { transform: scale(1.05); }
    .gallery-overlay {
      position: absolute; inset: 0;
      background: rgba(44, 36, 22, 0.4);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s;
      color: white; font-size: 1.5rem;
    }
    .gallery-item:hover .gallery-overlay { opacity: 1; }

    /* Lightbox */
    #lightbox {
      position: fixed; inset: 0; z-index: 8888;
      background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      opacity: 0; visibility: hidden; transition: all 0.3s;
    }
    #lightbox.open { opacity: 1; visibility: visible; }
    #lightbox img { max-height: 85vh; max-width: 100%; object-fit: contain; }
    .lb-placeholder {
      max-height: 85vh; max-width: 600px; width: 100%;
      aspect-ratio: 4/3;
      background: var(--dark); border: 1px solid var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-script); font-size: 3rem; color: var(--gold);
    }
    .lb-close {
      position: absolute; top: 1.5rem; right: 1.5rem;
      color: white; font-size: 2rem; cursor: pointer; line-height: 1;
      opacity: 0.7; transition: opacity 0.2s;
    }
    .lb-close:hover { opacity: 1; }
    .lb-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      color: white; font-size: 2rem; cursor: pointer;
      opacity: 0.6; transition: opacity 0.2s; padding: 1rem;
    }
    .lb-nav:hover { opacity: 1; }
    .lb-prev { left: 0; }
    .lb-next { right: 0; }

    /* ===== DRESS CODE ===== */
    #dresscode { background: var(--dark); }
    #dresscode .section-label { color: var(--gold-pale); }
    #dresscode .section-title { color: var(--gold); }
    .dress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem; max-width: 800px; margin: 3rem auto 0;
    }
    .dress-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(200,169,110,0.2);
      padding: 2rem 1.5rem; text-align: center;
    }
    .dress-swatch {
      width: 80px; height: 80px;
      border-radius: 50%; margin: 0 auto 1rem;
      border: 4px solid rgba(255,255,255,0.1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .dress-color-name {
      font-family: var(--font-serif);
      font-size: 1.1rem; color: var(--gold-pale);
      font-weight: 400;
    }
    .dress-color-hex {
      font-family: var(--font-sans); font-size: 0.65rem;
      letter-spacing: 0.15em; color: var(--text-light);
      margin-top: 0.3rem;
    }
    .dress-note {
      max-width: 520px; margin: 2.5rem auto 0;
      font-family: var(--font-sans); font-size: 0.78rem;
      line-height: 1.9; color: var(--gold-pale);
      background: rgba(200,169,110,0.08);
      padding: 1.5rem; border-left: 3px solid var(--gold);
    }

    /* ===== AMPLOP DIGITAL ===== */
    #wallet { background: var(--cream); }
    .wallet-tabs {
      display: flex; justify-content: center; gap: 0; margin: 2.5rem auto 0;
      max-width: 480px; border: 1px solid var(--cream-dark);
    }
    .wallet-tab {
      flex: 1; padding: 0.7rem 1rem;
      font-family: var(--font-sans); font-size: 0.68rem;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; background: var(--white);
      color: var(--text-light); border: none;
      transition: all 0.3s;
    }
    .wallet-tab.active { background: var(--sage); color: var(--white); }
    .wallet-panel { display: none; max-width: 600px; margin: 0 auto; }
    .wallet-panel.active { display: block; }
    .wallet-card {
      background: var(--white);
      border: 1px solid var(--cream-dark);
      padding: 1.8rem; margin-top: 1.2rem;
      display: flex; align-items: center; gap: 1.5rem;
    }
    .wallet-icon {
      width: 56px; height: 56px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }
    .wallet-info { flex: 1; text-align: left; }
    .wallet-bank {
      font-family: var(--font-sans); font-size: 0.65rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--sage); margin-bottom: 0.25rem;
    }
    .wallet-name {
      font-family: var(--font-serif); font-size: 1.05rem;
      color: var(--brown); font-weight: 500;
    }
    .wallet-number {
      font-family: var(--font-sans); font-size: 0.9rem;
      color: var(--text); letter-spacing: 0.08em;
      margin-top: 0.2rem;
    }
    .btn-copy {
      padding: 0.5rem 1.2rem;
      border: 1px solid var(--sage); background: transparent;
      color: var(--sage); font-family: var(--font-sans);
      font-size: 0.65rem; letter-spacing: 0.15em;
      text-transform: uppercase; cursor: pointer;
      transition: all 0.3s; white-space: nowrap;
    }
    .btn-copy:hover { background: var(--sage); color: var(--white); }
    .btn-copy.copied { background: var(--sage); color: var(--white); }

    /* ===== RSVP ===== */
    #rsvp { background: var(--white); }
    .rsvp-form {
      max-width: 540px; margin: 3rem auto 0;
      display: grid; gap: 1.2rem;
    }
    .form-group { text-align: left; }
    .form-label {
      display: block; font-family: var(--font-sans);
      font-size: 0.65rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--sage);
      margin-bottom: 0.5rem;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%; padding: 0.85rem 1rem;
      border: 1px solid var(--cream-dark);
      background: var(--white); color: var(--text);
      font-family: var(--font-sans); font-size: 0.85rem;
      outline: none; transition: border-color 0.3s;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--sage);
    }
    .form-textarea { resize: vertical; min-height: 100px; }
    .rsvp-radio-group {
      display: flex; gap: 1rem;
    }
    .rsvp-radio {
      flex: 1; position: relative;
    }
    .rsvp-radio input { position: absolute; opacity: 0; }
    .rsvp-radio label {
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; padding: 0.8rem;
      border: 1px solid var(--cream-dark);
      cursor: pointer; font-family: var(--font-sans);
      font-size: 0.75rem; color: var(--text-light);
      transition: all 0.3s;
    }
    .rsvp-radio input:checked + label {
      border-color: var(--sage); background: var(--sage);
      color: var(--white);
    }
    .btn-submit {
      width: 100%; padding: 1rem;
      background: var(--sage); color: var(--white);
      border: none; font-family: var(--font-sans);
      font-size: 0.72rem; letter-spacing: 0.25em;
      text-transform: uppercase; cursor: pointer;
      transition: background 0.3s;
    }
    .btn-submit:hover { background: var(--sage-light); }

    /* ===== WISHES ===== */
    #wishes { background: var(--cream); }
    .wish-form {
      max-width: 540px; margin: 2.5rem auto 0;
      display: grid; gap: 1rem;
    }
    .wish-list {
      max-width: 700px; margin: 3rem auto 0;
    }
    .wish-item {
      background: var(--white);
      padding: 1.5rem; margin-bottom: 1rem;
      border-left: 3px solid var(--gold);
      text-align: left;
      animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .wish-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.8rem; }
    .wish-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--sage-pale);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-sans); font-weight: 600;
      font-size: 0.9rem; color: var(--sage); flex-shrink: 0;
    }
    .wish-name { font-family: var(--font-serif); font-size: 1rem; color: var(--brown); }
    .wish-date { font-family: var(--font-sans); font-size: 0.65rem; color: var(--text-light); }
    .wish-msg { font-family: var(--font-sans); font-size: 0.82rem; line-height: 1.7; color: var(--text); }

    /* ===== CLOSING ===== */
    #closing {
      background: linear-gradient(160deg, #2C2416 0%, #3D3020 60%, #4A3C28 100%);
      padding: 6rem 2rem; text-align: center;
      position: relative; overflow: hidden;
    }
    #closing::before {
      content: '';
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Ccircle cx='150' cy='150' r='130' fill='none' stroke='%23C8A96E' stroke-width='0.4' stroke-dasharray='3 5'/%3E%3C/svg%3E") center/60vmin no-repeat;
      opacity: 0.1;
    }
    .closing-thanks {
      font-family: var(--font-sans); font-size: 0.65rem;
      letter-spacing: 0.35em; text-transform: uppercase;
      color: var(--gold-pale); margin-bottom: 1rem;
    }
    .closing-names {
      font-family: var(--font-script);
      font-size: clamp(2.5rem, 6vw, 4rem);
      color: var(--white); line-height: 1.1;
    }
    .closing-year {
      font-family: var(--font-serif); font-size: 1rem;
      color: var(--gold); letter-spacing: 0.3em; margin-top: 1.5rem;
    }
    footer {
      background: #1A1510;
      padding: 1.5rem;
      text-align: center;
      font-family: var(--font-sans); font-size: 0.65rem;
      letter-spacing: 0.1em; color: var(--text-light);
    }
    footer a { color: var(--gold); }

    /* ===== SCROLL ANIMATIONS ===== */
    .reveal {
      opacity: 0; transform: translateY(40px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-left.visible, .reveal-right.visible { opacity: 1; transform: translateX(0); }

    /* ===== COUNTDOWN ===== */
    .countdown {
      display: flex; gap: 1.5rem; justify-content: center;
      margin-top: 2rem; flex-wrap: wrap;
    }
    .countdown-item { text-align: center; }
    .countdown-num {
      font-family: var(--font-serif); font-size: clamp(2rem, 5vw, 3rem);
      color: var(--gold); font-weight: 300; line-height: 1;
      display: block;
    }
    .countdown-label {
      font-family: var(--font-sans); font-size: 0.55rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--gold-pale);
    }
    .countdown-sep {
      font-family: var(--font-serif); font-size: 2rem;
      color: var(--gold); opacity: 0.4; align-self: flex-start; padding-top: 0.2rem;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .couple-grid {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .couple-center { order: -1; padding: 0; margin-bottom: 1rem; flex-direction: row; }
      .couple-ampersand { font-size: 2.5rem; }
      .timeline::before { left: 20px; }
      .tl-item { grid-template-columns: 40px 1fr; }
      .tl-item:nth-child(odd) .tl-content,
      .tl-item:nth-child(even) .tl-content {
        grid-column: 2; text-align: left; padding: 0 0 0 1.5rem; order: 2;
      }
      .tl-item:nth-child(odd) .tl-photo,
      .tl-item:nth-child(even) .tl-photo {
        grid-column: 2; padding: 0 0 0 1.5rem; order: 3;
      }
      .tl-dot { grid-column: 1; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
      .gallery-item:nth-child(4) { grid-column: span 1; aspect-ratio: 1; }
      .wallet-card { flex-wrap: wrap; }
      .rsvp-radio-group { flex-direction: column; }
    }

    @media (max-width: 480px) {
      .section { padding: 3.5rem 1.2rem; }
      .hero-date-wrap { gap: 1rem; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-photo-wrap { width: 180px; height: 210px; }
    }

    /* ===== TOAST ===== */
    .toast {
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: var(--dark); color: var(--gold-pale);
      padding: 0.75rem 2rem; font-family: var(--font-sans);
      font-size: 0.75rem; letter-spacing: 0.1em;
      z-index: 9999; opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .toast.show { opacity: 1; }

    /* ===== MUSIC PLAYER ===== */
    .music-btn {
      position: fixed; bottom: 2rem; right: 2rem;
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--dark); border: 1px solid var(--gold);
      color: var(--gold); font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 900;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .music-btn:hover { background: var(--gold); color: var(--dark); }
    .music-btn.playing { animation: pulse 2s infinite; }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.4); }
      50% { box-shadow: 0 0 0 10px rgba(200,169,110,0); }
    }
  </style>
</head>
<body>

<!-- ===== COVER OVERLAY ===== -->
<div id="cover-overlay">
  <!-- Decorative floral SVG corners -->
  <svg class="hero-floral hero-floral-tl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20,20 Q80,5 140,60 Q200,115 160,180 Q120,245 60,260 Q0,275 10,200 Q20,125 20,20Z" stroke="#C8A96E" stroke-width="0.8" fill="none"/>
    <path d="M40,40 Q90,20 145,70 Q200,120 165,175 Q130,230 75,245" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
    <circle cx="80" cy="60" r="8" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
    <circle cx="140" cy="100" r="5" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
    <circle cx="100" cy="140" r="6" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
  </svg>
  <div class="cover-sub">The Wedding of</div>
  <div class="cover-monogram">B & F</div>
  <div class="cover-divider"></div>
  <div class="cover-names">BYLLA AULIA RAHMA<br>&amp;<br>FIRMAN HADI KUSUMA</div>
  <div class="cover-divider"></div>
  <div class="cover-sub">Sabtu, 14 Februari 2026</div>
  <button class="btn-open" onclick="openInvitation()">&#9829; Buka Undangan</button>
</div>

<!-- ===== MAIN CONTENT ===== -->
<div id="main">

  <!-- MUSIC BUTTON -->
  <button class="music-btn" id="musicBtn" title="Play/Pause Music" onclick="toggleMusic()">♪</button>
  <audio id="bgMusic" loop>
    <source src="music/background.mp3" type="audio/mpeg" />
  </audio>

  <!-- ===== 1. HERO SECTION ===== -->
  <section id="hero">
    <svg class="hero-floral hero-floral-tl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,20 Q80,5 140,60 Q200,115 160,180 Q120,245 60,260 Q0,275 10,200 Q20,125 20,20Z" stroke="#C8A96E" stroke-width="0.8" fill="none"/>
      <path d="M40,40 Q90,20 145,70 Q200,120 165,175 Q130,230 75,245" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
      <circle cx="80" cy="60" r="8" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
      <circle cx="140" cy="100" r="5" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
    </svg>
    <svg class="hero-floral hero-floral-br" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,20 Q80,5 140,60 Q200,115 160,180 Q120,245 60,260 Q0,275 10,200 Q20,125 20,20Z" stroke="#C8A96E" stroke-width="0.8" fill="none"/>
      <path d="M40,40 Q90,20 145,70 Q200,120 165,175 Q130,230 75,245" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
      <circle cx="80" cy="60" r="8" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
      <circle cx="140" cy="100" r="5" stroke="#C8A96E" stroke-width="0.5" fill="none"/>
    </svg>

    <div class="reveal">
      <p class="hero-invite-text">Kami mengundang Anda untuk merayakan pernikahan</p>
      <div class="hero-photo-wrap">
        <div class="hero-photo-placeholder">B&amp;F</div>
      </div>
      <div style="margin-top:1.5rem;">
        <div class="hero-groom">Firman</div>
        <span class="hero-ampersand">&amp;</span>
        <div class="hero-bride">Bylla</div>
      </div>
      <div class="hero-date-wrap">
        <div class="hero-date-item">
          <span class="hero-date-num">14</span>
          Februari
        </div>
        <div class="hero-separator"></div>
        <div class="hero-date-item">
          <span class="hero-date-num">2026</span>
          Sabtu
        </div>
        <div class="hero-separator"></div>
        <div class="hero-date-item">
          <span class="hero-date-num">09</span>
          Pagi
        </div>
      </div>
      <!-- Countdown -->
      <div class="countdown" id="countdown"></div>
    </div>
    <div class="hero-scroll">↓</div>
  </section>

  <!-- ===== QUOTE STRIP ===== -->
  <div class="quote-strip reveal">
    <blockquote>
      "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri,
      supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."
    </blockquote>
    <cite>Q.S. Ar-Rum: 21</cite>
  </div>

  <!-- ===== 2. COUPLE SECTION ===== -->
  <section id="couple" class="section-full">
    <div class="section">
      <p class="section-label reveal">The Couple</p>
      <h2 class="section-title reveal">Mempelai Kami</h2>
      <div class="gold-line"></div>

      <div class="couple-grid">
        <!-- Pria -->
        <div class="couple-card reveal-left">
          <div class="couple-photo">
            <div class="couple-photo-placeholder">F</div>
          </div>
          <p class="couple-role">Mempelai Pria</p>
          <h3 class="couple-name">Firman</h3>
          <p class="couple-full">Firman Hadi Kusuma, S.T.</p>
          <div class="ornament"><span>✦</span></div>
          <div class="couple-parents">
            Putra dari:<br/>
            <strong>Bapak Ahmad Kusuma</strong><br/>
            &amp; <strong>Ibu Sari Dewi</strong>
          </div>
          <p style="font-family:var(--font-sans);font-size:0.75rem;color:var(--text-light);margin-top:0.8rem;line-height:1.7;">
            Pria yang lahir di Bandung, 12 Maret 1996. Seseorang yang mencintai keluarga dan bersyukur telah dipertemukan dengan belahan jiwanya.
          </p>
        </div>

        <!-- Center -->
        <div class="couple-center">
          <div class="couple-ampersand">&amp;</div>
        </div>

        <!-- Wanita -->
        <div class="couple-card reveal-right">
          <div class="couple-photo">
            <div class="couple-photo-placeholder" style="background:linear-gradient(145deg,var(--gold-pale),var(--gold));">B</div>
          </div>
          <p class="couple-role">Mempelai Wanita</p>
          <h3 class="couple-name">Bylla</h3>
          <p class="couple-full">Bylla Aulia Rahma, S.Pd.</p>
          <div class="ornament"><span>✦</span></div>
          <div class="couple-parents">
            Putri dari:<br/>
            <strong>Bapak Rahmat Hidayat</strong><br/>
            &amp; <strong>Ibu Nur Khasanah</strong>
          </div>
          <p style="font-family:var(--font-sans);font-size:0.75rem;color:var(--text-light);margin-top:0.8rem;line-height:1.7;">
            Wanita yang lahir di Yogyakarta, 7 Agustus 1998. Seseorang yang penuh kasih sayang dan selalu membawa kebahagiaan bagi orang-orang di sekitarnya.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 3. EVENT SECTION ===== -->
  <section id="event" class="section-full">
    <div class="section">
      <p class="section-label reveal">Save The Date</p>
      <h2 class="section-title reveal">Rangkaian Acara</h2>
      <div class="gold-line"></div>
      <p style="font-family:var(--font-sans);font-size:0.8rem;color:var(--text-light);max-width:480px;margin:0 auto;" class="reveal">
        Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu.
      </p>

      <div class="event-grid">
        <!-- Akad -->
        <div class="event-card reveal">
          <div class="event-icon">☽</div>
          <p class="event-type">Ijab Kabul</p>
          <h3 class="event-name">Akad Nikah</h3>
          <div class="event-detail">
            <strong>Sabtu, 14 Februari 2026</strong>
            Pukul 08.00 – 10.00 WIB
            <br/><br/>
            <strong>Lokasi</strong>
            Masjid Al-Ikhlas<br/>
            Jl. Mawar No. 12, Condongcatur,<br/>
            Sleman, Yogyakarta
          </div>
          <a href="https://maps.google.com/?q=Masjid+Al-Ikhlas+Condongcatur+Sleman" target="_blank" rel="noopener" class="btn-maps">
            ↗ Lihat di Maps
          </a>
        </div>

        <!-- Resepsi -->
        <div class="event-card reveal">
          <div class="event-icon">♡</div>
          <p class="event-type">Pesta Pernikahan</p>
          <h3 class="event-name">Resepsi</h3>
          <div class="event-detail">
            <strong>Sabtu, 14 Februari 2026</strong>
            Pukul 11.00 – 14.00 WIB
            <br/><br/>
            <strong>Lokasi</strong>
            Gedung Graha Sari<br/>
            Jl. Kaliurang KM 8, Sinduharjo,<br/>
            Ngaglik, Sleman, Yogyakarta
          </div>
          <a href="https://maps.google.com/?q=Graha+Sari+Kaliurang+Sleman" target="_blank" rel="noopener" class="btn-maps">
            ↗ Lihat di Maps
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 4. MAP SECTION ===== -->
  <section id="map" class="section-full">
    <div class="section">
      <p class="section-label reveal">Alamat Acara</p>
      <h2 class="section-title reveal">Lokasi</h2>
      <div class="gold-line"></div>
      <div class="map-wrap reveal">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.7!2d110.3923!3d-7.7278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5811daa4b3d7%3A0x1234!2sGedung+Graha+Sari!5e0!3m2!1sid!2sid!4v1234567890"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Lokasi Resepsi"
        ></iframe>
      </div>
      <div class="map-address reveal">
        <strong style="color:var(--brown);font-family:var(--font-serif);font-size:1.1rem;">Gedung Graha Sari</strong><br/>
        Jl. Kaliurang KM 8, Sinduharjo, Ngaglik,<br/>
        Sleman, Daerah Istimewa Yogyakarta 55581
      </div>
      <a href="https://maps.google.com/?q=Graha+Sari+Kaliurang+Sleman" target="_blank" rel="noopener" class="btn-nav reveal" style="display:inline-flex;margin-top:2rem;">
        ↗ Buka Google Maps
      </a>
    </div>
  </section>

  <!-- ===== 5. LOVE STORY ===== -->
  <section id="lovestory" class="section-full">
    <div class="section">
      <p class="section-label reveal">Our Journey</p>
      <h2 class="section-title reveal">Love Story</h2>
      <div class="gold-line"></div>
      <p style="font-family:var(--font-sans);font-size:0.8rem;color:var(--text-light);max-width:420px;margin:0 auto 1rem;" class="reveal">
        Setiap pertemuan adalah rencana-Nya yang indah.
      </p>
    </div>

    <div class="timeline">
      <!-- Item 1 -->
      <div class="tl-item">
        <div class="tl-content">
          <p class="tl-date">Agustus 2019</p>
          <h4 class="tl-title">Pertemuan Pertama</h4>
          <p class="tl-desc">Pertama kali bertemu di acara ospek kampus. Saling berkenalan dan tanpa disadari momen itu menjadi awal dari segalanya.</p>
        </div>
        <div class="tl-dot">✦</div>
        <div class="tl-photo">
          <div class="tl-img">📸</div>
        </div>
      </div>
      <!-- Item 2 -->
      <div class="tl-item">
        <div class="tl-content">
          <p class="tl-date">Maret 2020</p>
          <h4 class="tl-title">Mulai Dekat</h4>
          <p class="tl-desc">Pandemi mempertemukan kami lebih sering dalam diskusi daring. Dari teman kuliah menjadi lebih dari sekadar teman.</p>
        </div>
        <div class="tl-dot">♡</div>
        <div class="tl-photo">
          <div class="tl-img">💌</div>
        </div>
      </div>
      <!-- Item 3 -->
      <div class="tl-item">
        <div class="tl-content">
          <p class="tl-date">Desember 2021</p>
          <h4 class="tl-title">Resmi Berpacaran</h4>
          <p class="tl-desc">Di bawah langit Yogyakarta yang berbintang, Firman mengungkapkan perasaannya. Bylla menjawab dengan senyuman yang tak terlupakan.</p>
        </div>
        <div class="tl-dot">★</div>
        <div class="tl-photo">
          <div class="tl-img">🌟</div>
        </div>
      </div>
      <!-- Item 4 -->
      <div class="tl-item">
        <div class="tl-content">
          <p class="tl-date">Juli 2023</p>
          <h4 class="tl-title">Lamaran</h4>
          <p class="tl-desc">Firman melamar Bylla di hadapan kedua keluarga. Tangis bahagia dan doa mengiringi momen sakral yang tak terlupakan.</p>
        </div>
        <div class="tl-dot">💍</div>
        <div class="tl-photo">
          <div class="tl-img">💍</div>
        </div>
      </div>
      <!-- Item 5 -->
      <div class="tl-item">
        <div class="tl-content">
          <p class="tl-date">14 Februari 2026</p>
          <h4 class="tl-title">Hari Bahagia</h4>
          <p class="tl-desc">Hari ini, di hadapan Allah dan para saksi, kami melangkah bersama menuju kehidupan baru penuh berkah dan kasih sayang.</p>
        </div>
        <div class="tl-dot">☽</div>
        <div class="tl-photo">
          <div class="tl-img">✨</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 6. GALLERY ===== -->
  <section id="gallery" class="section-full">
    <div class="section">
      <p class="section-label reveal">Our Moments</p>
      <h2 class="section-title reveal">Galeri Foto</h2>
      <div class="gold-line"></div>
    </div>

    <div class="gallery-grid" style="padding:0 1rem;" id="galleryGrid">
      <!-- Items will be generated by JS -->
    </div>
  </section>

  <!-- Lightbox -->
  <div id="lightbox">
    <span class="lb-close" onclick="closeLightbox()">✕</span>
    <span class="lb-nav lb-prev" onclick="lbPrev()">‹</span>
    <div id="lbContent"></div>
    <span class="lb-nav lb-next" onclick="lbNext()">›</span>
  </div>

  <!-- ===== 7. DRESS CODE ===== -->
  <section id="dresscode" class="section-full">
    <div class="section">
      <p class="section-label reveal" style="color:var(--gold-pale);">Dress Code</p>
      <h2 class="section-title reveal" style="color:var(--gold);">Kode Berpakaian</h2>
      <div class="gold-line"></div>
      <p style="font-family:var(--font-sans);font-size:0.8rem;color:var(--gold-pale);max-width:480px;margin:0 auto;" class="reveal">
        Untuk menjaga keselarasan suasana, kami mengharapkan tamu undangan mengenakan pakaian dengan palet warna berikut.
      </p>

      <div class="dress-grid">
        <div class="dress-card reveal">
          <div class="dress-swatch" style="background:#8FA07A;"></div>
          <p class="dress-color-name">Sage Green</p>
          <p class="dress-color-hex">#8FA07A</p>
        </div>
        <div class="dress-card reveal">
          <div class="dress-swatch" style="background:#C8D5BB;"></div>
          <p class="dress-color-name">Pale Sage</p>
          <p class="dress-color-hex">#C8D5BB</p>
        </div>
        <div class="dress-card reveal">
          <div class="dress-swatch" style="background:#E2C896;"></div>
          <p class="dress-color-name">Gold Cream</p>
          <p class="dress-color-hex">#E2C896</p>
        </div>
        <div class="dress-card reveal">
          <div class="dress-swatch" style="background:#F5EFE0;"></div>
          <p class="dress-color-name">Ivory</p>
          <p class="dress-color-hex">#F5EFE0</p>
        </div>
      </div>

      <div class="dress-note reveal">
        <strong style="color:var(--gold);display:block;margin-bottom:0.5rem;">Catatan Penting</strong>
        Mohon hindari pemakaian warna <strong style="color:#fff;">putih bersih</strong> dan <strong style="color:#fff;">hitam polos</strong> agar tidak menyamakan dengan pakaian mempelai dan keluarga. Kami menyarankan busana formal atau semi-formal bernuansa warna di atas.
      </div>
    </div>
  </section>

  <!-- ===== 8. DIGITAL WALLET ===== -->
  <section id="wallet" class="section-full">
    <div class="section">
      <p class="section-label reveal">Amplop Digital</p>
      <h2 class="section-title reveal">Hadiah &amp; Doa</h2>
      <div class="gold-line"></div>
      <p style="font-family:var(--font-sans);font-size:0.8rem;color:var(--text-light);max-width:480px;margin:0 auto;" class="reveal">
        Kehadiran dan doa Anda adalah hadiah terbesar bagi kami. Namun jika berkenan, berikut informasi transfer.
      </p>

      <div class="wallet-tabs reveal">
        <button class="wallet-tab active" onclick="switchWallet('bank',this)">Transfer Bank</button>
        <button class="wallet-tab" onclick="switchWallet('ewallet',this)">E-Wallet</button>
      </div>

      <!-- Bank Panel -->
      <div class="wallet-panel active" id="panel-bank">
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#003f7f;">
            <svg width="28" height="20" viewBox="0 0 80 30" fill="white"><text y="22" font-size="20" font-weight="bold">BCA</text></svg>
          </div>
          <div class="wallet-info">
            <p class="wallet-bank">Bank BCA</p>
            <p class="wallet-name">Firman Hadi Kusuma</p>
            <p class="wallet-number">1234 5678 9012</p>
          </div>
          <button class="btn-copy" data-copy="123456789012" onclick="copyText(this)">Salin</button>
        </div>
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#f26522;">
            <svg width="28" height="20" viewBox="0 0 80 30" fill="white"><text y="22" font-size="18" font-weight="bold">BRI</text></svg>
          </div>
          <div class="wallet-info">
            <p class="wallet-bank">Bank BRI</p>
            <p class="wallet-name">Bylla Aulia Rahma</p>
            <p class="wallet-number">0987 6543 2109 8765</p>
          </div>
          <button class="btn-copy" data-copy="0987654321098765" onclick="copyText(this)">Salin</button>
        </div>
      </div>

      <!-- E-Wallet Panel -->
      <div class="wallet-panel" id="panel-ewallet">
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#118EEA;font-size:1.3rem;color:white;">OVO</div>
          <div class="wallet-info">
            <p class="wallet-bank">OVO</p>
            <p class="wallet-name">Firman Hadi Kusuma</p>
            <p class="wallet-number">0812-3456-7890</p>
          </div>
          <button class="btn-copy" data-copy="081234567890" onclick="copyText(this)">Salin</button>
        </div>
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#108BD8;font-size:1.3rem;color:white;">DANA</div>
          <div class="wallet-info">
            <p class="wallet-bank">DANA</p>
            <p class="wallet-name">Bylla Aulia Rahma</p>
            <p class="wallet-number">0898-7654-3210</p>
          </div>
          <button class="btn-copy" data-copy="089876543210" onclick="copyText(this)">Salin</button>
        </div>
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#00AED6;font-size:0.9rem;color:white;text-align:center;line-height:1.2;">Go<br/>Pay</div>
          <div class="wallet-info">
            <p class="wallet-bank">GoPay</p>
            <p class="wallet-name">Firman H.K.</p>
            <p class="wallet-number">0812-3456-7890</p>
          </div>
          <button class="btn-copy" data-copy="081234567890" onclick="copyText(this)">Salin</button>
        </div>
        <div class="wallet-card reveal">
          <div class="wallet-icon" style="background:#F05A28;font-size:0.75rem;color:white;text-align:center;line-height:1.2;">Shopee<br/>Pay</div>
          <div class="wallet-info">
            <p class="wallet-bank">ShopeePay</p>
            <p class="wallet-name">Bylla A.R.</p>
            <p class="wallet-number">0898-7654-3210</p>
          </div>
          <button class="btn-copy" data-copy="089876543210" onclick="copyText(this)">Salin</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== 9. RSVP ===== -->
  <section id="rsvp" class="section-full">
    <div class="section">
      <p class="section-label reveal">Konfirmasi</p>
      <h2 class="section-title reveal">RSVP</h2>
      <div class="gold-line"></div>
      <p style="font-family:var(--font-sans);font-size:0.8rem;color:var(--text-light);max-width:420px;margin:0 auto;" class="reveal">
        Mohon konfirmasikan kehadiran Anda sebelum <strong>7 Februari 2026</strong> agar kami dapat mempersiapkan segalanya dengan baik.
      </p>

      <form class="rsvp-form reveal" id="rsvpForm" onsubmit="submitRsvp(event)">
        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input type="text" class="form-input" placeholder="Nama Anda" required id="rsvpName"/>
        </div>
        <div class="form-group">
          <label class="form-label">Nomor WhatsApp</label>
          <input type="tel" class="form-input" placeholder="08xxxxxxxxxx" id="rsvpPhone"/>
        </div>
        <div class="form-group">
          <label class="form-label">Jumlah Tamu</label>
          <select class="form-select" id="rsvpCount">
            <option value="1">1 orang</option>
            <option value="2">2 orang</option>
            <option value="3">3 orang</option>
            <option value="4">4 orang</option>
            <option value="5+">5+ orang</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Konfirmasi Kehadiran</label>
          <div class="rsvp-radio-group">
            <div class="rsvp-radio">
              <input type="radio" name="attend" id="attend-yes" value="hadir" checked/>
              <label for="attend-yes">✓ Hadir</label>
            </div>
            <div class="rsvp-radio">
              <input type="radio" name="attend" id="attend-no" value="tidak"/>
              <label for="attend-no">✗ Tidak Hadir</label>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Pesan (opsional)</label>
          <textarea class="form-textarea" placeholder="Tulis pesan untuk kedua mempelai..." id="rsvpMessage"></textarea>
        </div>
        <button type="submit" class="btn-submit">Kirim Konfirmasi</button>
      </form>
    </div>
  </section>

  <!-- ===== 10. WISHES ===== -->
  <section id="wishes" class="section-full">
    <div class="section">
      <p class="section-label reveal">Doa &amp; Harapan</p>
      <h2 class="section-title reveal">Ucapan Tamu</h2>
      <div class="gold-line"></div>

      <form class="wish-form reveal" id="wishForm" onsubmit="submitWish(event)">
        <div class="form-group">
          <label class="form-label">Nama Anda</label>
          <input type="text" class="form-input" placeholder="Nama Anda" required id="wishName"/>
        </div>
        <div class="form-group">
          <label class="form-label">Ucapan &amp; Doa</label>
          <textarea class="form-textarea" placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..." required id="wishMsg" style="min-height:80px;"></textarea>
        </div>
        <button type="submit" class="btn-submit">Kirim Ucapan ♡</button>
      </form>

      <div class="wish-list" id="wishList"></div>
    </div>
  </section>

  <!-- ===== 11. CLOSING ===== -->
  <section id="closing">
    <div class="reveal">
      <p class="closing-thanks">Terima kasih atas doa &amp; kehadiran Anda</p>
      <div class="gold-line" style="background:var(--gold);"></div>
      <div class="closing-names">
        Firman<br/>
        <span style="font-family:var(--font-serif);font-size:clamp(1.5rem,4vw,2.5rem);color:var(--gold);font-weight:300;">&amp;</span><br/>
        Bylla
      </div>
      <p class="closing-year">14 . 02 . 2026</p>
      <div style="margin-top:2.5rem;">
        <div class="ornament" style="color:var(--gold);"><span>✦</span></div>
        <p style="font-family:var(--font-serif);font-style:italic;color:var(--gold-pale);font-size:1rem;margin-top:0.5rem;">
          "Semoga kami senantiasa dalam ridho dan rahmat-Nya"
        </p>
      </div>
    </div>
  </section>

  <footer>
    <p>Made with ♡ for <span style="color:var(--gold);">Bylla &amp; Firman</span> &nbsp;|&nbsp; 14 Februari 2026</p>
    <p style="margin-top:0.3rem;opacity:0.5;">Website Undangan Digital</p>
  </footer>

</div><!-- end #main -->

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
  // ===== DATA =====
  const WEDDING_DATE = new Date('2026-02-14T08:00:00');

  const galleryData = [
    { emoji: '📷', label: 'Pre-wedding 1' },
    { emoji: '💑', label: 'Pre-wedding 2' },
    { emoji: '🌸', label: 'Momen Manis' },
    { emoji: '🎊', label: 'Pre-wedding 3' },
    { emoji: '🌿', label: 'Outdoor' },
    { emoji: '✨', label: 'Spesial' },
    { emoji: '💕', label: 'Berdua' },
    { emoji: '🌺', label: 'Garden' },
    { emoji: '🎆', label: 'Kenangan' },
  ];

  const defaultWishes = [
    { name: 'Ahmad Rizky', date: '10 Jan 2026', msg: 'Selamat menempuh hidup baru, semoga menjadi keluarga sakinah mawaddah warahmah. Barakallahu lakuma wa baraka alaikuma! 🤲' },
    { name: 'Siti Rahayu', date: '11 Jan 2026', msg: 'Masya Allah... akhirnya tiba juga hari yang dinantikan. Semoga langgeng hingga jannah. Aamiin ya Rabb 💚' },
    { name: 'Budi & Keluarga', date: '12 Jan 2026', msg: 'Selamat Bylla & Firman! Semoga pernikahan kalian menjadi ladang pahala dan sumber kebahagiaan dunia akhirat. Aamiin 🌸' },
    { name: 'Dian Pertiwi', date: '13 Jan 2026', msg: 'Turut berbahagia atas pernikahan kalian. Semoga selalu sabar, saling menguatkan, dan dipenuhi keberkahan. 💍' },
    { name: 'Keluarga Santoso', date: '14 Jan 2026', msg: 'Congratulations! Wishing you both a lifetime of love and happiness. May Allah bless your marriage! 🙏' },
  ];

  let wishes = [...defaultWishes];
  let lbIndex = 0;

  // ===== OPEN INVITATION =====
  function openInvitation() {
    const overlay = document.getElementById('cover-overlay');
    const main = document.getElementById('main');
    overlay.classList.add('hidden');
    main.classList.add('visible');
    startCountdown();
    renderGallery();
    renderWishes();
    setTimeout(initScrollAnimations, 100);
    tryPlayMusic();
  }

  // ===== COUNTDOWN =====
  function startCountdown() {
    function update() {
      const now = new Date();
      const diff = WEDDING_DATE - now;
      if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '<p style="font-family:var(--font-serif);font-size:1.2rem;color:var(--gold);">Hari Pernikahan Telah Tiba ✨</p>';
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.getElementById('countdown').innerHTML = `
        <div class="countdown-item"><span class="countdown-num">${String(d).padStart(2,'0')}</span><span class="countdown-label">Hari</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-num">${String(h).padStart(2,'0')}</span><span class="countdown-label">Jam</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-num">${String(m).padStart(2,'0')}</span><span class="countdown-label">Menit</span></div>
        <span class="countdown-sep">:</span>
        <div class="countdown-item"><span class="countdown-num">${String(s).padStart(2,'0')}</span><span class="countdown-label">Detik</span></div>
      `;
    }
    update();
    setInterval(update, 1000);
  }

  // ===== GALLERY =====
  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = galleryData.map((item, i) => `
      <div class="gallery-item" onclick="openLightbox(${i})">
        <div class="gallery-placeholder">${item.emoji}</div>
        <div class="gallery-overlay">🔍</div>
      </div>
    `).join('');
  }

  function openLightbox(i) {
    lbIndex = i;
    const lb = document.getElementById('lightbox');
    const content = document.getElementById('lbContent');
    content.innerHTML = `<div class="lb-placeholder">${galleryData[i].emoji}<br/><small style="font-size:1rem;font-family:var(--font-sans);letter-spacing:0.1em;">${galleryData[i].label}</small></div>`;
    lb.classList.add('open');
  }
  function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
  function lbPrev() { lbIndex = (lbIndex - 1 + galleryData.length) % galleryData.length; openLightbox(lbIndex); }
  function lbNext() { lbIndex = (lbIndex + 1) % galleryData.length; openLightbox(lbIndex); }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev();
    if (e.key === 'ArrowRight') lbNext();
  });

  // ===== WALLET TABS =====
  function switchWallet(type, btn) {
    document.querySelectorAll('.wallet-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.wallet-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + type).classList.add('active');
  }

  // ===== COPY TEXT =====
  function copyText(btn) {
    const text = btn.dataset.copy;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ Tersalin';
      btn.classList.add('copied');
      showToast('Nomor berhasil disalin!');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Nomor berhasil disalin!');
    });
  }

  // ===== RSVP =====
  function submitRsvp(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('rsvpName').value,
      phone: document.getElementById('rsvpPhone').value,
      count: document.getElementById('rsvpCount').value,
      attend: document.querySelector('input[name="attend"]:checked').value,
      message: document.getElementById('rsvpMessage').value,
      timestamp: new Date().toISOString()
    };
    console.log('RSVP Data (ready for API):', data);
    showToast('Konfirmasi berhasil dikirim! Terima kasih 🙏');
    e.target.reset();
    document.getElementById('attend-yes').checked = true;
  }

  // ===== WISHES =====
  function renderWishes() {
    const list = document.getElementById('wishList');
    list.innerHTML = wishes.map(w => `
      <div class="wish-item">
        <div class="wish-header">
          <div class="wish-avatar">${w.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="wish-name">${escapeHtml(w.name)}</div>
            <div class="wish-date">${w.date}</div>
          </div>
        </div>
        <p class="wish-msg">${escapeHtml(w.msg)}</p>
      </div>
    `).join('');
  }

  function submitWish(e) {
    e.preventDefault();
    const name = document.getElementById('wishName').value.trim();
    const msg = document.getElementById('wishMsg').value.trim();
    if (!name || !msg) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    wishes.unshift({ name, date: dateStr, msg });
    renderWishes();
    e.target.reset();
    showToast('Ucapan berhasil dikirim! Terima kasih 💚');
    document.getElementById('wishList').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ===== TOAST =====
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ===== SCROLL ANIMATIONS =====
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .tl-item').forEach(el => {
      observer.observe(el);
    });
  }

  // ===== MUSIC =====
  function tryPlayMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio.src && audio.src !== window.location.href) {
      audio.play().catch(() => {});
    }
  }
  function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    if (!audio.src || audio.src === window.location.href) {
      showToast('File musik tidak tersedia (letakkan music/background.mp3)');
      return;
    }
    if (audio.paused) {
      audio.play();
      btn.classList.add('playing');
      btn.textContent = '♫';
    } else {
      audio.pause();
      btn.classList.remove('playing');
      btn.textContent = '♪';
    }
  }
</script>
</body>
</html>
