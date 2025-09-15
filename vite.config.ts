import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Environment variable configuration
  envPrefix: 'VITE_',
  // Build configuration
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['axios', 'zustand', 'date-fns'],
        },
      },
    },
  },
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy API calls to backend in development
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Preview server configuration (for production builds)
  preview: {
    port: 3000,
    host: true,
  },
})
