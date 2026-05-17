import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ebird': {
        target: 'https://api.ebird.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ebird/, '')
      }
    }
  }
})