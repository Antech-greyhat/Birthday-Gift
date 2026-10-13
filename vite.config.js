import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the build works from any folder or static host
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
