# Audio

Reserved for music and sound effects that **you own or have a licence for**. The asset pack does not include audio.

1. Put a file here, e.g. `lagu-pesta.mp3` (MP3 or AAC/M4A plays in every browser).
2. In `src/config/invitation.config.ts`, set:

   ```ts
   music: {
     src: projectAsset('audio/lagu-pesta.mp3'),
     title: 'Judul lagu',
     credit: 'Penyanyi / lisensi',
     volume: 0.5,
     useGeneratedFallback: true, // used if the file fails to load
   },
   ```

While `src` is `null`, the invitation plays an original music-box melody generated with the Web Audio API. No audio plays until the guest interacts with the page.
