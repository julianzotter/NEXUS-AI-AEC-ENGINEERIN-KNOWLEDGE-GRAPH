/**
 * NEXUS-4 Client-Side Service Communicating with Server-Side Gemini API Endpoints
 * Conforms to guidelines: client never imports @google/genai directly.
 */

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  modelUsed?: string;
}

export async function postApi<T>(endpoint: string, body: any): Promise<GeminiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.error || `HTTP ${res.status}: ${res.statusText}`
      };
    }

    const data = await res.json();
    return { success: true, data: data.result || data, modelUsed: data.model };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with NEXUS server'
    };
  }
}

export async function orchestrateAsoCandidate(intent: string, payload: any) {
  return postApi('/api/gemini/orchestrate', { intent, payload });
}

export async function searchEurocodeGrounding(query: string) {
  return postApi('/api/gemini/search', { query });
}

export async function executeHighThinkingAec(query: string) {
  return postApi('/api/gemini/thinking', { query });
}

export async function executeFastLiteVerification(query: string) {
  return postApi('/api/gemini/fast', { query });
}

export async function generateDualHostTts(text: string, speaker: 'Vance' | 'Elena') {
  return postApi<{ audioBase64?: string; mimeType?: string }>('/api/gemini/tts', { text, speaker });
}
