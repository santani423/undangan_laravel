import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // three.js lives in its own lazily-loaded chunk (see App.tsx), which is
    // legitimately larger than Vite's 500 kB default warning threshold.
    chunkSizeWarningLimit: 1100,
  },
});
