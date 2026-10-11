import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // En build se publica en https://ricardofalcondev.github.io/prototipo-plazo-fijo/
  base: command === 'build' ? '/prototipo-plazo-fijo/' : '/',
  plugins: [react()],
  // Versión de publicación: se agrega a las URLs de imágenes de /public para evitar la caché vieja.
  define: { __VERSION__: JSON.stringify(command === 'build' ? Date.now().toString(36) : 'dev') },
  server: { port: 5174 },
}));
