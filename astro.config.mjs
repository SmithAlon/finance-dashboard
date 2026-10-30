import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Never inline scripts into the HTML: the Content-Security-Policy (public/_headers) allows only
  // same-origin script files.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
