import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Explicitly set output directory
    outDir: 'dist',
    // Optional: clean the dist folder on each build
    emptyOutDir: true,
  },
  // Optional: if you have a custom base path (e.g., for GitHub Pages)
  // base: './', 
})