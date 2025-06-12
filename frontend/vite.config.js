import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        // Block backend modules from frontend
        /..\/backend/,
        'url',
        'path',
        'cloudinary'
      ]
    }
  },
  plugins: [react(),  tailwindcss()],
})
