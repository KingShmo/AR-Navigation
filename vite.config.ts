import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // This exposes the server to your local network
    port: 5173,         // Default Vite port
    open: true,         // Automatically open the browser
    hmr: {
      overlay: true     // Show error overlay
    }
  },
  base: './',           // Use relative paths
  build: {
    sourcemap: true,    // Generate sourcemaps for debugging
    minify: false       // Don't minify for easier debugging
  }
})
