// App logic for Wedding Invitation: Johan & Joana

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Dynamic Guest Name ---
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || 'Tamu Undangan';
  const guestNameElements = document.querySelectorAll('.guest-name');
  guestNameElements.forEach(el => {
    el.textContent = guestName;
  });

  // --- 2. Welcome Overlay & Background Music ---
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const btnOpen = document.getElementById('btn-open');
  const bgMusic = document.getElementById('bg-music');
  const musicControl = document.getElementById('music-control');
  
  // Set music volume slightly lower
  bgMusic.volume = 0.5;

  btnOpen.addEventListener('click', () => {
    // Fade out overlay
    welcomeOverlay.classList.add('fade-out');
    
    // Play background music
    bgMusic.play().then(() => {
      musicControl.classList.remove('hide');
      musicControl.classList.add('playing');
    }).catch(err => {
      console.log('Audio autoplay blocked, waiting for user interaction on music button:', err);
      // Still show button but paused
      musicControl.classList.remove('hide');
    });

    // Initialize animations on sections
    initializeReveal();
  });

  // Floating Music Controller Toggle
  musicControl.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicControl.classList.add('playing');
      musicControl.querySelector('i').className = 'fa-solid fa-volume-high';
    } else {
      bgMusic.pause();
      musicControl.classList.remove('playing');
      musicControl.querySelector('i').className = 'fa-solid fa-volume-xmark';
    }
  });

  // --- 3. Countdown Timer ---
  // Target: September 1, 2026 (01.09.26)
  const targetDate = new Date('2026-09-01T08:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      document.querySelectorAll('.countdown-box').forEach(box => {
        box.querySelector('.countdown-num').textContent = '00';
      });
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    // Update Left Panel Countdown (Desktop)
    document.getElementById('days').textContent = pad(days);
    document.getElementById('hours').textContent = pad(hours);
    document.getElementById('minutes').textContent = pad(minutes);
    document.getElementById('seconds').textContent = pad(seconds);

    // Update Mobile Flow Countdown
    document.getElementById('mob-days').textContent = pad(days);
    document.getElementById('mob-hours').textContent = pad(hours);
    document.getElementById('mob-minutes').textContent = pad(minutes);
    document.getElementById('mob-seconds').textContent = pad(seconds);
  }

  // Update immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- 4. Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');
  
  function initializeReveal() {
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, no need to track it anymore
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  }

  // Active Bottom Navigation Spy
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop;
      const sectionHeight = sec.clientHeight;
      if (window.scrollY >= (sectionTop - 300)) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });

  // --- 5. Interactive Lightbox Gallery ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  
  let currentImgIndex = 0;
  const imageSources = Array.from(galleryItems).map(item => item.getAttribute('data-src'));

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentImgIndex = index;
      openLightbox();
    });
  });

  function openLightbox() {
    lightboxImg.src = imageSources[currentImgIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNextImage() {
    currentImgIndex = (currentImgIndex + 1) % imageSources.length;
    lightboxImg.src = imageSources[currentImgIndex];
  }

  function showPrevImage() {
    currentImgIndex = (currentImgIndex - 1 + imageSources.length) % imageSources.length;
    lightboxImg.src = imageSources[currentImgIndex];
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNextImage);
  lightboxPrev.addEventListener('click', showPrevImage);

  // Close lightbox on clicking background
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // --- 6. Copy Account Numbers ---
  const copyButtons = document.querySelectorAll('.btn-copy');
  const toast = document.getElementById('toast');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      
      // Copy to clipboard
      navigator.clipboard.writeText(num).then(() => {
        // Show Success Toast
        toast.textContent = 'Nomor rekening/e-wallet berhasil disalin!';
        toast.classList.add('show');
        
        // Change button text briefly
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Disalin';
        
        setTimeout(() => {
          toast.classList.remove('show');
          btn.innerHTML = origText;
        }, 2500);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    });
  });

  // --- 7. RSVP Submission (Mock Database) ---
  const rsvpForm = document.getElementById('rsvp-form');
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('rsvp-name').value.trim();
    const phone = document.getElementById('rsvp-phone').value.trim();
    const guests = document.getElementById('rsvp-guests').value;
    const status = document.querySelector('input[name="rsvp-status"]:checked').value;
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name || !phone) {
      alert('Mohon lengkapi nama dan nomor WhatsApp Anda.');
      return;
    }

    const newRsvp = {
      name,
      phone,
      guests,
      status,
      message,
      timestamp: new Date().toISOString()
    };

    // Save to LocalStorage
    let rsvpList = JSON.parse(localStorage.getItem('rsvp_records')) || [];
    rsvpList.push(newRsvp);
    localStorage.setItem('rsvp_records', JSON.stringify(rsvpList));

    // Show Confirmation Toast
    toast.textContent = 'Terima kasih, konfirmasi kehadiran Anda berhasil dikirim!';
    toast.classList.add('show');
    
    // Reset Form
    rsvpForm.reset();

    // If attending, add to guestbook comments automatically
    if (status === 'hadir') {
      saveComment(name, message || 'Insya Allah saya akan hadir di hari bahagia kalian. Selamat!', 'hadir');
    } else {
      saveComment(name, message || 'Selamat atas pernikahannya. Maaf saya berhalangan hadir, semoga lancar semuanya.', 'absen');
    }

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  });

  // --- 8. Comment / Guestbook Section (Local Storage Database) ---
  const wishForm = document.getElementById('wish-form');
  const wishesListContainer = document.getElementById('wishes-list');
  const paginationContainer = document.getElementById('wish-pagination');
  
  let currentCommentPage = 1;
  const commentsPerPage = 5;

  // Initial Seed Comments to make it look active
  const defaultComments = [
    { name: 'Ahmad Syarif', message: 'Selamat Johan & Joan! Semoga dilancarkan semua urusannya sampai hari H. Tuntunlah keluarga barumu dengan penuh cinta dan ketaatan kepada Allah SWT. Aamiin.', status: 'hadir', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
    { name: 'Siti Rahma', message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair. Selamat menempuh hidup baru Joan sayang, bahagia terus ya bersama Johan.', status: 'hadir', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
    { name: 'Budi Santoso', message: 'Maaf kawan sekalian, tidak bisa hadir dikarenakan tugas luar kota. Semoga kedua mempelai langgeng sampai kakek nenek, sakinah mawaddah warahmah.', status: 'absen', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
    { name: 'Diana Putri', message: 'Wah bahagianya melihat kalian berdua bersatu! Semoga resepsinya nanti berjalan lancar dan menjadi kenangan terindah seumur hidup. Selamat ya!', status: 'hadir', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { name: 'Rian & Fira', message: 'Happy wedding Johan & Joana! Wishing you a lifetime of love and happiness. Cheers to new beginnings!', status: 'hadir', timestamp: new Date(Date.now() - 1800000).toISOString() }
  ];

  function getComments() {
    let comments = JSON.parse(localStorage.getItem('wedding_comments'));
    if (!comments || comments.length === 0) {
      comments = defaultComments;
      localStorage.setItem('wedding_comments', JSON.stringify(comments));
    }
    // Sort descending by timestamp
    return comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function saveComment(name, message, status) {
    const comments = getComments();
    comments.push({
      name,
      message,
      status,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('wedding_comments', JSON.stringify(comments));
    renderComments();
  }

  function renderComments() {
    const comments = getComments();
    wishesListContainer.innerHTML = '';
    
    const startIndex = (currentCommentPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const paginatedComments = comments.slice(startIndex, endIndex);

    if (paginatedComments.length === 0) {
      wishesListContainer.innerHTML = '<p class="text-center" style="font-size: 0.85rem; color: var(--text-muted);">Belum ada ucapan.</p>';
      paginationContainer.innerHTML = '';
      return;
    }

    paginatedComments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'wish-item';
      
      const timeAgo = formatTimeAgo(c.timestamp);
      const statusLabel = c.status === 'hadir' ? 'Hadir' : 'Absen';
      const statusClass = c.status === 'hadir' ? 'hadir' : 'absen';

      item.innerHTML = `
        <div class="wish-item-header">
          <span class="wish-name">${escapeHTML(c.name)}</span>
          <span class="wish-status ${statusClass}">${statusLabel}</span>
        </div>
        <p class="wish-msg">${escapeHTML(c.message)}</p>
        <span class="wish-time"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
      `;
      wishesListContainer.appendChild(item);
    });

    renderPagination(comments.length);
  }

  function renderPagination(totalItems) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / commentsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn ${i === currentCommentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentCommentPage = i;
        renderComments();
        // scroll comments slightly into view
        document.getElementById('wishes-list').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      paginationContainer.appendChild(btn);
    }
  }

  wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('wish-name').value.trim();
    const message = document.getElementById('wish-message').value.trim();
    const status = document.getElementById('wish-status').value;

    if (!name || !message) {
      alert('Mohon isi nama dan ucapan Anda.');
      return;
    }

    saveComment(name, message, status);
    
    // Reset Form
    wishForm.reset();
    currentCommentPage = 1; // Go to first page to see the new comment
    renderComments();

    toast.textContent = 'Ucapan doa restu Anda berhasil dikirim!';
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  });

  // --- Helper Functions ---
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Kemarin';
    return `${days} hari yang lalu`;
  }

  // Initial render of comments
  renderComments();
});
