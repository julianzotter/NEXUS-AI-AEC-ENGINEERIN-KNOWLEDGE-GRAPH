/**
 * NEXUS-4 Production Server
 * Express full-stack host for API routes and static production build.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createGeminiRouter } from './server/geminiServerRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Attach Gemini & Kernel API routes
app.use(createGeminiRouter());

// Serve static frontend files from dist in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[NEXUS-4 OS] Server active on http://0.0.0.0:${PORT}`);
});
