Optional background music.

By default the invitation plays an original music-box melody synthesised in the browser
(src/audio/musicBox.ts), so no audio file is required.

To use your own track instead:
  1. Put a licensed file here, e.g. public/audio/our-song.mp3 (keep it under ~3 MB).
  2. In src/config/wedding.ts set  music.src = 'audio/our-song.mp3'  and update music.title / music.credit.
