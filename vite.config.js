import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/photo-booth/',
  server: {
    open: true,
    port: 5173
  }
})
