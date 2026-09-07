import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cabinet/',
  build: { outDir: '../src/web/static/cabinet', emptyOutDir: true },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: process.env.CABINET_API_TARGET || 'http://127.0.0.1:5000', changeOrigin: true } },
  },
});
