import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import {defineConfig, Plugin} from 'vite';
import {createGeminiRouter} from './server/geminiServerRouter';

dotenv.config();

function nexusApiPlugin(): Plugin {
  return {
    name: 'nexus-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '15mb' }));
      app.use(createGeminiRouter());
      server.middlewares.use(app);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), nexusApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

