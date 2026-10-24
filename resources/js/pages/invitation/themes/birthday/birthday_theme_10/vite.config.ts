import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack in its own cacheable chunk so the invitation
        // HTML (cover, details, RSVP) can render before WebGL code arrives.
        // React gets its own chunk first; otherwise the 3D chunk would absorb it as a
        // shared dependency and be preloaded by the entry.
        manualChunks(id: string) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor';
          if (id.includes('node_modules/three') || id.includes('@react-three') || id.includes('troika')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
