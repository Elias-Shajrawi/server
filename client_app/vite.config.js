import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    // Make environment variables available at build time
    'import.meta.env.VITE_TUNNEL_SERVER_URL': JSON.stringify(
      process.env.VITE_TUNNEL_SERVER_URL || 'http://localhost:3000'
    ),
    'import.meta.env.VITE_DEFAULT_SERVER_HOST': JSON.stringify(
      process.env.VITE_DEFAULT_SERVER_HOST || 'tunnel.mycompany.com'
    )
  }
})
