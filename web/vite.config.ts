import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Set BASE_PATH when the app is not at the domain root (e.g. GitHub project pages: `/repo-name/`). */
function viteBase(): string {
  const env = process.env.BASE_PATH;
  if (!env || env === '/') return '/';
  return env.endsWith('/') ? env : `${env}/`;
}

export default defineConfig({
  base: viteBase(),
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});