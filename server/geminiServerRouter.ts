/**
 * NEXUS-4 Server-Side Router
 * Handles all @google/genai SDK operations securely on server side.
 * Also provides server-side deterministic kernel execution and Google Drive proxying.
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Request, Response, Router } from 'express';

export function createGeminiRouter(): Router {
  const router = Router();

  const apiKey = process.env.GEMINI_API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Helper to check AI availability
  const checkAi = (res: Response): boolean => {
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API is not configured on the server. GEMINI_API_KEY environment variable is required.',
      });
      return false;
    }
    return true;
  };

  // 1. ASO Candidate Orchestration (gemini-3.8-flash)
  router.post('/api/gemini/orchestrate', async (req: Request, res: Response) => {
    try {
      const { intent, payload } = req.body;
      if (!checkAi(res)) return;

      const prompt = `
You are the AI Systems Orchestrator (ASO) in NEXUS-4, a deterministic Eurocode Engineering OS.
The user intent is: "${intent}".
Input parameter payload:
${JSON.stringify(payload, null, 2)}

Task:
1. Identify the applicable Eurocode standard (e.g. CEN/TS 19103, EN 1995-1-1, EN 1992-1-1).
2. Synthesize a formal Chain-of-Thought (CoT) candidate calculation proposal.
3. Clearly mark this result with: "STATUS: KANDIDAT — Keine Freigabe. Vorbehaltlich SIO-Veto."
4. Provide candidate analytical values for the engineering parameters and summarize critical limits (e.g. gamma_2, (EI)_eff, bending stress sigma_m, deflection w_net,fin).
Return your response structured clearly with reasoning, candidate values, and standard citations.
`;

      const response = await ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are the ASO (AI Systems Orchestrator) in NEXUS-4. You orchestrate candidate calculation models for structural Eurocode design. All outputs are strictly candidate until SIO verification.',
        }
      });

      res.json({
        success: true,
        model: 'gemini-3.8-flash',
        result: response.text
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/orchestrate:', err);
      res.status(500).json({ error: err.message || 'ASO orchestration error' });
    }
  });

  // 2. Search Grounding (gemini-3.5-flash with googleSearch tool)
  router.post('/api/gemini/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!checkAi(res)) return;

      const response = await ai!.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Search grounded query regarding structural engineering standards and technical updates: ${query}`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      res.json({
        success: true,
        model: 'gemini-3.5-flash',
        result: response.text
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/search:', err);
      res.status(500).json({ error: err.message || 'Search grounding error' });
    }
  });

  // 3. High Thinking Mode (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  router.post('/api/gemini/thinking', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!checkAi(res)) return;

      const response = await ai!.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: query,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: 'You are the high-reasoning structural engineering intelligence kernel of NEXUS-4. Provide rigorous, deep technical derivations for Eurocode and structural mechanics.',
        }
      });

      res.json({
        success: true,
        model: 'gemini-3.1-pro-preview',
        result: response.text
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/thinking:', err);
      res.status(500).json({ error: err.message || 'High thinking error' });
    }
  });

  // 4. Low Latency Fast Responses (gemini-3.1-flash-lite)
  router.post('/api/gemini/fast', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!checkAi(res)) return;

      const response = await ai!.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: query,
      });

      res.json({
        success: true,
        model: 'gemini-3.1-flash-lite',
        result: response.text
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/fast:', err);
      res.status(500).json({ error: err.message || 'Fast check error' });
    }
  });

  // 5. Dual-Host TTS (gemini-3.8-flash-lite-tts)
  router.post('/api/gemini/tts', async (req: Request, res: Response) => {
    try {
      const { text, speaker } = req.body;
      if (!checkAi(res)) return;

      const voiceName = speaker === 'Elena' ? 'Kore' : 'Puck';

      const response = await ai!.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text || 'This is NEXUS-4 engineering radio.',
                speechMetadata: {
                  style: speaker === 'Elena' 
                    ? 'Clear, articulate structural computational architect' 
                    : 'Pragmatic, authoritative senior structural engineer',
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      res.json({
        success: true,
        audioBase64,
        mimeType: 'audio/wav',
        speaker,
        voiceName
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/tts:', err);
      res.status(500).json({ error: err.message || 'TTS generation error' });
    }
  });

  return router;
}
