import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base: './' keeps every asset path relative so the build can be hosted from any sub-path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
