/**
 * NEXUS-4 Voice Command & Live Dialogue Modal
 * Speech-to-Speech & Voice Run-Commands via Gemini API / Web Speech API
 */

import React, { useState, useEffect } from 'react';
import { executeFastLiteVerification } from '../../services/geminiClient';
import { Mic, X, Play, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunIntentDispatched: (intent: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onRunIntentDispatched
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Click microphone and speak Eurocode run command...');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.lang = 'de-DE';
        reco.interimResults = true;

        reco.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        reco.onend = () => {
          setIsListening(false);
          setStatusMessage('Voice capture complete. Processing intent...');
        };

        reco.onerror = (e: any) => {
          setIsListening(false);
          setStatusMessage(`Speech capture: ${e.error || 'idle'}`);
        };

        setRecognition(reco);
      }
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognition) {
      setStatusMessage('Web Speech API not supported in this browser environment. You can type commands below.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setStatusMessage('Listening for structural run command (German / English)...');
      recognition.start();
      setIsListening(true);
    }
  };

  const handleDispatch = async () => {
    if (!transcript.trim()) return;
    setStatusMessage('Dispatching run command through ASO route...');
    onRunIntentDispatched(transcript.trim());
    onClose();
  };

  const sampleCommands = [
    'Berechne HBV-Decke nach CEN/TS 19103 mit 6.2 Meter Spannweite',
    'Prüfe Bilanzidentität für SEC Form 10-K von Apple',
    'Führe EC5 Holzbalken Biegungsnachweis für C24 durch',
    'Aktiviere Talk Radio Antigravity Diskussion über Kser'
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
            <Mic className="w-5 h-5" />
            <span>NEXUS-4 LIVE VOICE // SPEECH-TO-RUN</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mic Button */}
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-2xl ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20 shadow-rose-600/50'
                : 'bg-slate-800 hover:bg-slate-700 text-pink-400 border border-slate-700'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <div className="text-center">
            <div className="text-slate-200 font-bold">
              {isListening ? 'LISTENING (PUSH TO STOP)...' : 'PUSH TO TALK'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{statusMessage}</div>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 uppercase">Captured Voice Command</label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Spoken words will appear here or type command..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs font-mono h-20 resize-none focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>

        {/* Quick Sample Commands */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase">Sample Engineering Voice Prompts</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(cmd)}
                className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-slate-300 transition text-left"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={!transcript.trim()}
            className="px-4 py-1.5 rounded bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            DISPATCH TO GATE CHAIN
          </button>
        </div>
      </div>
    </div>
  );
};
