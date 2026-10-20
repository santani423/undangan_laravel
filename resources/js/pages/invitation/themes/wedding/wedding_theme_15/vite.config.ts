import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // three.js lives in the lazily loaded scene chunk; it is large by nature.
    chunkSizeWarningLimit: 1400,
  },
})
