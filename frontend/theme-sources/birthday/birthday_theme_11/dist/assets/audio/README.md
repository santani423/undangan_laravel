# Optional audio files

No audio files are bundled. Out of the box:

- **Music** is a music-box arrangement of “Happy Birthday to You” (public domain),
  synthesised live in the browser with the Web Audio API.
- **Sound effects** (pop, chime, whoosh, celebration, candle puff, fireworks) are synthesised too.

To use your own licensed audio, drop files here and set their paths in `src/config/invitation.js`:

| Suggested file | Config key | Plays when |
| --- | --- | --- |
| `birthday-background.mp3` | `audio.files.music` | Music toggle on (loops) |
| `ui-pop.mp3` | `audio.files.pop` | Buttons, activities, balloons |
| `magic-chime.mp3` | `audio.files.chime` | Moving to a new scene, calendar download, relighting candles |
| `celebration.mp3` | `audio.files.celebration` | Candles blown out, RSVP sent |

Nothing plays until the guest interacts with the page (browser autoplay rules). A file that
fails to load falls back to the synthesised sound. Use royalty-free or original audio and keep
proof of the licence.
