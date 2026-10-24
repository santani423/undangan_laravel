import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from any folder or sub-path (GitHub Pages, Netlify, a USB stick…).
  base: './',
  build: {
    // Keep Vite's bundles apart from the public /assets folder.
    assetsDir: 'bundle',
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
  },
});
