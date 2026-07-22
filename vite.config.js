import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://rskpdgcshpbsupflgsiv.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/functions/v1/api'),
      },
    },
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react') || id.includes('react-datepicker')) {
              return 'vendor-ui';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
