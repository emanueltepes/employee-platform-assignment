import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: process.env.VITE_API_URL || 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'employee-platform-assignment-fronend.onrender.com',
      '.onrender.com', // Allow all Render hosts
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:8080',
        changeOrigin: true,
      },
      '/actuator': {
        target: process.env.VITE_API_URL || 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})

