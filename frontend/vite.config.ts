import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { ViteDevServer } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), {
    name: 'log-cache-free-url',
    configureServer(server: ViteDevServer) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address()
        if (typeof address === 'object' && address) {
          setTimeout(() => {
            console.log('\n🚀 Cache-free development URL:');
            console.log(`➜  http://localhost:${address.port}/?nocache=${Date.now()}\n`);
          }, 100); // Small delay to ensure it prints after Vite's output
        }
      });
    }
  }],
  server: {
    port: 5173,
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  compilerOptions: {
    lib: ['ES2020', 'DOM']
  }
})
