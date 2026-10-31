import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: './', // Essential for relative assets on GitHub Pages
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
