/* 
   Interactive Script for Wedding Invitation: Putri & Putra
   Handles 3D Envelope Open, Audio Control, Copy Utilities,
   Dynamic Guest Name from URL, Lightbox Gallery, and local storage Wishes & RSVP
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Guest Name from URL Query (?to=Name+Here)
  const getQueryParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };
  
  const guestName = getQueryParam('to');
  const guestNameContainer = document.querySelector('.guest-name');
  if (guestNameContainer) {
    if (guestName) {
      guestNameContainer.textContent = decodeURIComponent(guestName);
    } else {
      guestNameContainer.textContent = "Tamu Undangan";
    }
  }

  // 2. 3D Envelope Opening Interaction
  const envelopeOverlay = document.querySelector('.envelope-overlay');
  const envelopeWrapper = document.querySelector('.envelope-wrapper');
  const openButton = document.querySelector('.btn-open');
  const waxSeal = document.querySelector('.wax-seal');
  const audioController = document.querySelector('.audio-controller');
  
  // Background Audio Setup
  const bgAudio = new Audio('assets/media1.mp3');
  bgAudio.loop = true;
  let isPlaying = false;

  const openInvitation = () => {
    if (envelopeWrapper.classList.contains('open')) return;
    
    // Add open class to trigger CSS 3D animations
    envelopeWrapper.classList.add('open');
    
    // Play Background music (triggered by user interaction)
    bgAudio.play().then(() => {
      isPlaying = true;
      audioController.classList.add('playing');
    }).catch(err => {
      console.log("Audio autoplay prevented. Playing upon next click.");
    });

    // Wait for the card animation to finish, then slide up the overlay
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
      audioController.style.display = 'flex';
      
      // Trigger animations for the first viewport sections
      triggerScrollAnimations();
    }, 1800);
  };

  // Click events for envelope
  if (openButton) openButton.addEventListener('click', openInvitation);
  if (waxSeal) waxSeal.addEventListener('click', openInvitation);
  if (envelopeWrapper) envelopeWrapper.addEventListener('click', (e) => {
    if (e.target.closest('.btn-open') || e.target.closest('.wax-seal')) return;
    openInvitation();
  });

  // Audio Play/Pause Button Logic
  if (audioController) {
    audioController.addEventListener('click', () => {
      if (isPlaying) {
        bgAudio.pause();
        audioController.classList.remove('playing');
        audioController.innerHTML = '<i class="music-icon">🔇</i>';
        isPlaying = false;
      } else {
        bgAudio.play();
        audioController.classList.add('playing');
        audioController.innerHTML = '<i class="music-icon">🎵</i>';
        isPlaying = true;
      }
    });
  }

  // 3. Custom Lightweight Scroll Animations (AOS replacement)
  const animatableElements = document.querySelectorAll('.animate-on-scroll');
  
  const triggerScrollAnimations = () => {
    const scrollContainer = document.querySelector('.main-invitation');
    const triggerBottom = window.innerHeight * 0.9;
    
    animatableElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Adjust scroll offset depending on desktop/mobile scroll containers
      if (rect.top < triggerBottom) {
        el.classList.add('animated');
      }
    });
  };

  // Add scroll listener to invitation content box
  const mainInvitation = document.querySelector('.main-invitation');
  if (mainInvitation) {
    mainInvitation.addEventListener('scroll', triggerScrollAnimations);
  }
  window.addEventListener('scroll', triggerScrollAnimations);

  // 4. Lightbox Modal for Photo Gallery
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item img');

  galleryItems.forEach(img => {
    img.parentElement.addEventListener('click', () => {
      lightbox.style.display = 'flex';
      lightboxImg.src = img.src;
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
      }
    });
  }

  // 5. Copy Bank/E-Wallet Numbers Utility
  window.copyToClipboard = (elementId, textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      const btn = document.getElementById(elementId);
      const originalText = btn.textContent;
      btn.textContent = 'Salin Berhasil!';
      btn.style.backgroundColor = 'var(--primary-green)';
      btn.style.color = '#fff';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--accent-gold-dark)';
      }, 2000);
    }).catch(err => {
      alert('Gagal menyalin nomor rekening.');
    });
  };

  // 6. Wishes & Guest Book Simulation (LocalStorage)
  const wishForm = document.getElementById('wish-form');
  const wishesContainer = document.getElementById('wishes-container');

  const defaultWishes = [
    {
      name: "Dinda Lestari",
      status: "Hadir",
      message: "Selamat ya Putri & Putra! Bahagia selalu hingga maut memisahkan. Sangat serasi!",
      timestamp: "2 jam yang lalu"
    },
    {
      name: "Budi Pratama",
      status: "Hadir",
      message: "Semoga pernikahannya selalu dipenuhi dengan rasa cinta dan keberkahan dari Allah SWT. Amin YRA.",
      timestamp: "4 jam yang lalu"
    },
    {
      name: "Siti Rahmawati",
      status: "Tidak Hadir",
      message: "Mohon maaf yang sebesar-besarnya belum bisa hadir karena ada dinas luar kota. Selamat menempuh hidup baru Putri & Putra!",
      timestamp: "1 hari yang lalu"
    },
    {
      name: "Rizky Fauzi",
      status: "Hadir",
      message: "Lancar sampai hari H sob! Siap hadir membawa pasukan. Sukses selalu untuk kalian berdua!",
      timestamp: "2 hari yang lalu"
    }
  ];

  const loadWishes = () => {
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes'));
    if (!wishes) {
      wishes = defaultWishes;
      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
    }
    
    wishesContainer.innerHTML = '';
    wishes.forEach(wish => {
      const wishEl = document.createElement('div');
      wishEl.className = 'wish-item';
      
      const badgeClass = wish.status === 'Hadir' ? 'wish-badge' : 'wish-badge absent';
      
      wishEl.innerHTML = `
        <div class="wish-header">
          <span class="wish-name">${escapeHTML(wish.name)}</span>
          <span class="${badgeClass}">${wish.status}</span>
        </div>
        <p class="wish-message">${escapeHTML(wish.message)}</p>
        <span class="wish-time">${wish.timestamp}</span>
      `;
      wishesContainer.appendChild(wishEl);
    });
  };

  const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  };

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('wish-name');
      const statusSelect = document.getElementById('wish-status');
      const messageInput = document.getElementById('wish-message');
      
      const newWish = {
        name: nameInput.value.trim(),
        status: statusSelect.value,
        message: messageInput.value.trim(),
        timestamp: "Baru saja"
      };

      if (!newWish.name || !newWish.message) return;

      // Save to localStorage
      let wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
      wishes.unshift(newWish);
      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

      // Reload UI
      loadWishes();

      // Reset form
      nameInput.value = '';
      messageInput.value = '';
      
      // Alert user
      alert('Ucapan dan doa berhasil dikirim!');
    });
  }

  // 7. RSVP Submission Integration (WhatsApp pre-filled message)
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('rsvp-name').value.trim();
      const phone = document.getElementById('rsvp-phone').value.trim();
      const guests = document.getElementById('rsvp-guests').value;
      const attendance = document.getElementById('rsvp-attendance').value;
      const notes = document.getElementById('rsvp-notes').value.trim();
      
      if (!name || !phone) {
        alert('Mohon isi nama dan nomor WhatsApp Anda.');
        return;
      }

      // Reformat WhatsApp Text
      const groomBrideNames = "Putri & Putra";
      const statusText = attendance === 'Hadir' ? 'HADIR' : 'TIDAK HADIR';
      
      const waMessage = `Halo ${groomBrideNames},%0A%0ASaya ingin mengkonfirmasi kehadiran undangan pernikahan kalian:%0A%0A` +
        `Nama: *${name}*%0A` +
        `WhatsApp: ${phone}%0A` +
        `Status Kehadiran: *${statusText}*%0A` +
        `Jumlah Tamu: ${guests} orang%0A` +
        `Ucapan/Pesan: ${notes || '-'}%0A%0A` +
        `Terima kasih!`;

      // Target groom/bride WhatsApp number (Mock: 6281234567890)
      const targetPhone = "6281234567890";
      const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${waMessage}`;
      
      // Save local backup to wishes too
      const rsvpWish = {
        name: name,
        status: attendance,
        message: notes || `Selamat menempuh hidup baru! ( RSVP Konfirmasi: ${statusText} )`,
        timestamp: "Baru saja"
      };
      
      let wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
      wishes.unshift(rsvpWish);
      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
      loadWishes();

      // Open WA link in a new tab
      window.open(waUrl, '_blank');
      
      // Reset form
      rsvpForm.reset();
      alert('Konfirmasi RSVP tersimpan! Anda akan diarahkan ke WhatsApp untuk mengirim pesan konfirmasi.');
    });
  }

  // Load wishes on start
  loadWishes();

  // Create desktop cover leaf falling particles
  const desktopCover = document.querySelector('.desktop-cover');
  if (desktopCover) {
    const leafImages = ['image1.png', 'image2.png', 'image3.png', 'image4.png', 'image11.png'];
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'leaf-particle';
      
      // Randomize values
      const randomLeaf = leafImages[Math.floor(Math.random() * leafImages.length)];
      particle.style.backgroundImage = `url('assets/${randomLeaf}')`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.width = `${10 + Math.random() * 20}px`;
      particle.style.height = particle.style.width;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${10 + Math.random() * 10}s`;
      
      desktopCover.appendChild(particle);
    }
  }
});
