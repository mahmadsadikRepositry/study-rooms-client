import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React dev server runs on port 5173 and the Express API on port 3000.
// The proxy forwards /api and /uploads requests to Express, so the browser
// sees one origin and no CORS setup is needed during development.
export default defineConfig({
  plugins: [react()],
  // `npm run build` writes the finished frontend into the server's public folder,
  // so Express can serve it and nobody needs React tools to use it.
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
});
