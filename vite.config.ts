import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This sets the base path to relative ('./'), 
  // which is required for the site to work on GitHub Pages subdirectories.
  base: './',
});