import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds Code Blocks as one self-contained HTML file (scripts, styles, editor, icons inlined).
// scripts/embed-pyodide.mjs then adds Python itself, so the page also works offline.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  optimizeDeps: {
    exclude: ['lucide-react', 'pyodide'],
  },
  // Classic (non-module) workers, because browsers only allow those from a blob when the page
  // is opened straight from a file (e.g. a USB stick).
  worker: {
    format: 'iife',
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 10000,
    assetsInlineLimit: 100000000,
  },
});
