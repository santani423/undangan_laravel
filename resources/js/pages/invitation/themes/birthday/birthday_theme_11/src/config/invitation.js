/**
 * ============================================================================
 *  LITTLE SMILE DENTAL ADVENTURE — INVITATION CONFIGURATION
 * ============================================================================
 *
 *  This is the ONLY file you need to edit to personalise the invitation.
 *  Every value marked  SAMPLE  is editable demo data — replace it with your
 *  real party details before sharing the site.
 *
 *  Paths that start with "/assets/..." point to files inside /public/assets/.
 *  Set optional asset paths to null to keep the built-in procedural fallback.
 * ============================================================================
 */

export const invitation = {
  /* ------------------------------------------------------------------------
   * Birthday child & celebration
   * ---------------------------------------------------------------------- */
  child: {
    name: 'Alya', //                         SAMPLE — the birthday child's first name
    age: 5, //                               SAMPLE — age being celebrated (also the number of candles, max 12)
    pronoun: 'her', //                       SAMPLE — used in copy like "celebrate her birthday" (her / his / their)
  },

  /* ------------------------------------------------------------------------
   * Event date & time
   * Times are local to the venue. `utcOffset` is the venue's offset from UTC,
   * e.g. '+07:00' for Jakarta (WIB), '+08:00' for Singapore, '-05:00' for New York.
   * ---------------------------------------------------------------------- */
  event: {
    date: '2026-12-05', //                   SAMPLE — YYYY-MM-DD
    startTime: '15:00', //                   SAMPLE — 24h HH:MM
    endTime: '18:00', //                     SAMPLE — 24h HH:MM
    utcOffset: '+07:00', //                  SAMPLE
    timeZoneLabel: 'WIB', //                 SAMPLE — shown next to times; use '' to hide
    locale: 'en-GB', //                      Date formatting locale, e.g. 'en-US', 'id-ID'
    dressCode: 'Pastel colours & your brightest smile', // SAMPLE — set to '' to hide
  },

  /* ------------------------------------------------------------------------
   * Venue
   * ---------------------------------------------------------------------- */
  venue: {
    name: 'Rainbow Sprinkle Party Garden', //            SAMPLE
    address: 'Jl. Pelangi Ceria No. 12, Kebayoran Baru, Jakarta Selatan 12160', // SAMPLE
    // Optional. If set, used exactly for the "Open Google Maps" button.
    mapsUrl: null, //                                     e.g. 'https://maps.app.goo.gl/xxxx'
    // Optional. Used when mapsUrl is null. Leave null to search by name + address.
    coordinates: null, //                                 e.g. { lat: -6.2441, lng: 106.7999 }
  },

  /* ------------------------------------------------------------------------
   * Host & RSVP
   * ---------------------------------------------------------------------- */
  host: {
    names: "{name}'s parents", //            SAMPLE — shown as the sender of the invitation
    // WhatsApp number in international format, digits only (no +, spaces or dashes).
    whatsappNumber: '6280000000000', //      SAMPLE — replace with the host's real WhatsApp number
  },

  rsvp: {
    maxGuestsPerReply: 4, //                 Largest party size one guest can confirm
    deadline: '2026-11-28', //               SAMPLE — "Please reply by" date (YYYY-MM-DD) or null
    messageMaxLength: 280,
  },

  /* ------------------------------------------------------------------------
   * Words
   * Any text in this file may use these tokens, filled in automatically:
   *   {name} → child.name     {age} → child.age     {pronoun} → child.pronoun
   *   {ageOrdinal} → "fifth", "sixth", …
   * ---------------------------------------------------------------------- */
  copy: {
    siteTitle: 'Little Smile Dental Adventure',
    heroLine: 'is turning', //               "Alya is turning 5"
    invitationHeading: 'You are invited!',
    // SAMPLE — the main invitation message. Use \n\n for a new paragraph.
    invitationMessage:
      "Dr. Smiley and the Tooth Friends are throwing a sparkly party, and it wouldn't be complete without you!\n\nCome brush up on fun with games, cake and plenty of big smiles as we celebrate {name}'s {ageOrdinal} birthday together.",
    detailsNote: 'Little guests are welcome with a grown-up. Snacks are sugar-smart, the fun is not.', // SAMPLE
    galleryIntro: "A few favourite smiles from {name}'s first {age} years.", // SAMPLE
    cakeIntro: '{age} candles, one big wish. Blow them out with a tap, or with a real puff into your microphone.',
    rsvpIntro: 'Let us know if you can come so we can save you a party hat.',
    finaleHeading: 'Thank you for joining the adventure!',
    // SAMPLE — final birthday message shown in the closing scene.
    finaleMessage:
      'Every smile you bring makes the party brighter. We cannot wait to celebrate with you, so keep smiling and see you soon!',
  },

  /* ------------------------------------------------------------------------
   * Activities — shown in section 4.
   * `icon` picks both the illustration and the 3D prop:
   *   'games' | 'cake' | 'photo' | 'gift' | 'dental' | 'balloons'
   * `time` is optional ('' hides it).
   * ---------------------------------------------------------------------- */
  activities: [
    {
      id: 'games',
      icon: 'games',
      title: 'Party games',
      time: '15:15',
      summary: 'Musical chairs, balloon relay and the tooth-fairy treasure hunt.',
      details:
        'Every child joins a team of Tooth Friends for balloon relays, musical chairs and a treasure hunt for the golden toothbrush. Small prizes for every player.',
    },
    {
      id: 'dental',
      icon: 'dental',
      title: 'Dental adventure',
      time: '15:45',
      summary: 'Dr. Smiley shows how super-brushers keep their smiles shining.',
      details:
        'A playful mini-show with a giant toothbrush, a sparkle-paste challenge and a take-home brushing chart. Every little brusher gets a sticker badge.',
    },
    {
      id: 'photo',
      icon: 'photo',
      title: 'Photo booth',
      time: '16:15',
      summary: 'Props, frames and silly faces at the Smile Snap corner.',
      details:
        'Grab a party hat, a giant tooth sign or a balloon bunch and strike a pose. Printed instant photos go home in the goodie bag.',
    },
    {
      id: 'cake',
      icon: 'cake',
      title: 'Cake cutting',
      time: '16:45',
      summary: 'Happy birthday song, {age} candles and one big wish.',
      details:
        "We'll sing together while {name} blows out the candles, then share a strawberry-and-vanilla cake (with a sugar-free option for anyone who needs it).",
    },
    {
      id: 'gift',
      icon: 'gift',
      title: 'Gift exchange',
      time: '17:15',
      summary: 'Bring a small wrapped toy and take home a surprise.',
      details:
        'Optional and low-key: bring a small wrapped gift under the price of a storybook and pick a surprise from the Tooth Friends treasure chest.',
    },
    {
      id: 'goodbye',
      icon: 'balloons',
      title: 'Balloon goodbye',
      time: '17:45',
      summary: 'Every guest leaves with a balloon and a goodie bag.',
      details:
        'Before heading home, each guest picks a balloon and a goodie bag with a new toothbrush, stickers and a thank-you card.',
    },
  ],

  /* ------------------------------------------------------------------------
   * Gallery — section 5.
   * Replace the placeholder SVGs with real photos, e.g. '/assets/images/gallery/alya-1.jpg'.
   * Keep `alt` descriptive for screen-reader users.
   * ---------------------------------------------------------------------- */
  gallery: [
    { src: '/assets/images/gallery/photo-placeholder-1.svg', alt: 'Placeholder for photo 1', caption: 'First tooth day' },
    { src: '/assets/images/gallery/photo-placeholder-2.svg', alt: 'Placeholder for photo 2', caption: 'Balloon chaser' },
    { src: '/assets/images/gallery/photo-placeholder-3.svg', alt: 'Placeholder for photo 3', caption: 'Cake face, age 2' },
    { src: '/assets/images/gallery/photo-placeholder-4.svg', alt: 'Placeholder for photo 4', caption: 'Super brusher' },
    { src: '/assets/images/gallery/photo-placeholder-5.svg', alt: 'Placeholder for photo 5', caption: 'Present unwrapper' },
    { src: '/assets/images/gallery/photo-placeholder-6.svg', alt: 'Placeholder for photo 6', caption: 'Big smile, age 4' },
  ],

  /* ------------------------------------------------------------------------
   * Theme colours (hex) — used by the page CSS and by the main pastel
   * surfaces of the 3D world (gifts, balloons, pedestals, island grass…).
   * The sky colours of each scene live in src/scene/stations.js.
   * ---------------------------------------------------------------------- */
  theme: {
    sky: '#b8e8f5',
    pink: '#ffb9d0',
    mint: '#bdeccb',
    yellow: '#ffe28a',
    cream: '#fff8ef',
    ink: '#20435d',
    blue: '#55b9dc',
    lavender: '#c8b5ff',
  },

  /* ------------------------------------------------------------------------
   * Sound
   * No audio files ship with this project. By default the music box melody
   * and sound effects are synthesised in the browser with the Web Audio API.
   * To use your own licensed audio, drop files into /public/assets/audio/ and
   * set the paths below (e.g. '/assets/audio/birthday-background.mp3').
   * ---------------------------------------------------------------------- */
  audio: {
    startMusicOnAdventureStart: true, //     "Start the adventure" button also starts the music
    musicVolume: 0.35,
    effectsVolume: 0.6,
    files: {
      music: null, //                        '/assets/audio/birthday-background.mp3'
      pop: null, //                          '/assets/audio/ui-pop.mp3'
      chime: null, //                        '/assets/audio/magic-chime.mp3'
      celebration: null, //                  '/assets/audio/celebration.mp3'
    },
  },

  /* ------------------------------------------------------------------------
   * Optional GLB/GLTF models. Leave null to use the built-in procedural
   * 3D models. Models are auto-scaled and stood on the ground; an animation
   * clip named "idle" (or the first clip) plays automatically.
   * See ASSETS.md for orientation guidance.
   * ---------------------------------------------------------------------- */
  models: {
    mascot: null, //                         '/assets/models/dr-smiley.glb'
    toothFriend: null, //                    '/assets/models/tooth-friend.glb' (used for all six friends)
    cake: null, //                           '/assets/models/birthday-cake.glb' (candles stay interactive)
  },
};

export default invitation;
