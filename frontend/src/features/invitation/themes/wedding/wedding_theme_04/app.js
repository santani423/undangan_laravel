const $ = (selector) => document.querySelector(selector);

const toast = (message) => {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2200);
};

const createElement = (tag, className, html) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (html) element.innerHTML = html;
  return element;
};

const renderCouple = () => {
  const container = $("#coupleCards");
  const people = [invitationData.couple.groom, invitationData.couple.bride];
  container.innerHTML = people
    .map(
      (person, index) => `
        <article class="couple-card reveal ${index === 1 ? "reverse" : ""}">
          <div class="portrait">
            <img src="${person.photo}" alt="Foto ${person.fullName}" loading="lazy" />
          </div>
          <div class="couple-copy">
            <span>${person.shortName}</span>
            <h3>${person.fullName}</h3>
            <p class="parents">${person.parents}</p>
            <p>${person.description}</p>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderEvents = () => {
  $("#eventCards").innerHTML = invitationData.events
    .map(
      (event) => `
        <article class="event-card reveal">
          <img src="assets/ppt/image33.png" alt="" />
          <h3>${event.title}</h3>
          <p>${event.date}</p>
          <strong>${event.time}</strong>
          <p>${event.place}</p>
          <p>${event.address}</p>
          <a class="btn btn-secondary" href="${event.mapUrl}" target="_blank" rel="noreferrer">Buka Peta</a>
        </article>
      `,
    )
    .join("");
};

const renderAddress = () => {
  $("#addressText").textContent = invitationData.address.text;
  $("#mapsButton").href = invitationData.address.mapUrl;
  $("#mapEmbed").src = invitationData.address.embed;
};

const renderStory = () => {
  $("#storyTimeline").innerHTML = invitationData.stories
    .map(
      (story, index) => `
        <article class="timeline-item reveal">
          <div class="timeline-dot">${String(index + 1).padStart(2, "0")}</div>
          <div class="timeline-photo">
            <img src="${story.image}" alt="${story.title}" loading="lazy" />
          </div>
          <div class="timeline-copy">
            <time>${story.date}</time>
            <h3>${story.title}</h3>
            <p>${story.text}</p>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderGallery = () => {
  $("#galleryGrid").innerHTML = invitationData.gallery
    .map(
      (image, index) => `
        <button class="gallery-item reveal" type="button" data-image="${image}">
          <img src="${image}" alt="Galeri pasangan ${index + 1}" loading="lazy" />
        </button>
      `,
    )
    .join("");
};

const renderDress = () => {
  $("#dressPalette").innerHTML = invitationData.dressCode
    .map(
      (item) => `
        <div class="swatch">
          <span style="background:${item.color}"></span>
          <p>${item.label}</p>
        </div>
      `,
    )
    .join("");
};

const renderGifts = () => {
  $("#giftCards").innerHTML = invitationData.gifts
    .map(
      (gift) => `
        <article class="gift-card reveal">
          <p>${gift.type}</p>
          <h3>${gift.provider}</h3>
          <span>${gift.accountName}</span>
          <strong>${gift.number}</strong>
          <img src="${gift.qr}" alt="QR code ${gift.provider}" loading="lazy" />
          <button class="btn btn-secondary copy-button" type="button" data-copy="${gift.number}">Salin Nomor</button>
        </article>
      `,
    )
    .join("");
};

let visibleWishes = 3;
const renderWishes = () => {
  const items = invitationData.wishes.slice(0, visibleWishes);
  $("#wishList").innerHTML = items
    .map(
      (wish) => `
        <article class="wish-card">
          <h3>${wish.name}</h3>
          <p>${wish.message}</p>
        </article>
      `,
    )
    .join("");
  $("#loadMoreWishes").style.display =
    visibleWishes >= invitationData.wishes.length ? "none" : "inline-flex";
};

const initCountdown = () => {
  const target = new Date(invitationData.eventDate).getTime();
  const labels = ["Hari", "Jam", "Menit", "Detik"];
  const update = () => {
    const distance = Math.max(target - Date.now(), 0);
    const values = [
      Math.floor(distance / 86400000),
      Math.floor((distance % 86400000) / 3600000),
      Math.floor((distance % 3600000) / 60000),
      Math.floor((distance % 60000) / 1000),
    ];
    $("#countdown").innerHTML = values
      .map((value, index) => `<div><strong>${value}</strong><span>${labels[index]}</span></div>`)
      .join("");
  };
  update();
  window.setInterval(update, 1000);
};

const initInteractions = () => {
  const music = $("#weddingMusic");
  $("#openInvitation").addEventListener("click", async () => {
    $("#invitationGate").classList.add("hidden");
    document.body.classList.add("opened");
    try {
      await music.play();
      $("#musicToggle").classList.add("playing");
    } catch {
      toast("Musik siap diputar manual.");
    }
  });

  $("#musicToggle").addEventListener("click", async () => {
    if (music.paused) {
      await music.play();
      $("#musicToggle").classList.add("playing");
    } else {
      music.pause();
      $("#musicToggle").classList.remove("playing");
    }
  });

  document.addEventListener("click", async (event) => {
    const copyButton = event.target.closest(".copy-button");
    const galleryButton = event.target.closest(".gallery-item");
    if (copyButton) {
      await navigator.clipboard.writeText(copyButton.dataset.copy);
      toast("Nomor berhasil disalin.");
    }
    if (galleryButton) {
      $("#lightboxImage").src = galleryButton.dataset.image;
      $("#lightbox").classList.add("show");
    }
  });

  $("#closeLightbox").addEventListener("click", () => $("#lightbox").classList.remove("show"));
  $("#lightbox").addEventListener("click", (event) => {
    if (event.target.id === "lightbox") $("#lightbox").classList.remove("show");
  });

  $("#loadMoreWishes").addEventListener("click", () => {
    visibleWishes += 3;
    renderWishes();
  });

  $("#rsvpForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    localStorage.setItem("wedding-rsvp", JSON.stringify(data));
    toast("RSVP tersimpan sebagai data dummy lokal.");
    event.target.reset();
  });

  $("#wishForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    invitationData.wishes.unshift({ name: data.name, message: data.message });
    visibleWishes = Math.max(visibleWishes, 3);
    renderWishes();
    toast("Ucapan berhasil ditambahkan.");
    event.target.reset();
  });
};

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.16 },
  );
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
};

renderCouple();
renderEvents();
renderAddress();
renderStory();
renderGallery();
renderDress();
renderGifts();
renderWishes();
initCountdown();
initInteractions();
initReveal();
