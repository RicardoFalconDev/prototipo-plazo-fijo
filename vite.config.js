import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // En build se publica en https://ricardofalcondev.github.io/prototipo-plazo-fijo/
  base: command === 'build' ? '/prototipo-plazo-fijo/' : '/',
  plugins: [react()],
  server: { port: 5174 },
}));
