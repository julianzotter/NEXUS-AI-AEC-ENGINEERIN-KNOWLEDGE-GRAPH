/**
 * NEXUS-4 Managed Agent: AI Talk Radio Antigravity
 * Dual-Host-TTS (Dr. Vance & Elena Rostova) + Lyria-Soundbed (D-Moll Synth) + Nanobanana Slides + Live-Waveform
 */

import React, { useState, useEffect, useRef } from 'react';
import { lyriaSoundbed } from '../../services/lyriaSoundbed';
import { generateDualHostTts } from '../../services/geminiClient';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Layers, 
  Mic, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Music
} from 'lucide-react';

interface DialogueLine {
  speaker: 'Vance' | 'Elena';
  text: string;
  slideIndex: number;
}

const RADIO_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Elena',
    text: "Willkommen bei NEXUS Talk Radio Antigravity. Heute im Fokus: CEN/TS 19103 und die Frage, warum starre Verbindungsmittel im Holz-Beton-Verbund versagen.",
    slideIndex: 0
  },
  {
    speaker: 'Vance',
    text: "Elena, pure Physik. Ein Holz-Beton-Verbundträger lebt von der Nachgiebigkeit der Scherfuge. Das γ-Verfahren nach Eurocode 5 Anhang B modelliert genau diesen Schlupf Kser.",
    slideIndex: 1
  },
  {
    speaker: 'Elena',
    text: "Absolut, Dr. Vance. Mit Kser = 50.000 N/mm erreichen wir einen Verbundwirkungsgrad γ₂ von fast 0.82. Das verdoppelt die effektive Biegesteifigkeit (EI)eff gegenüber dem getrennten Querschnitt!",
    slideIndex: 2
  },
  {
    speaker: 'Vance',
    text: "Und hier greift die 4-Layer-Governance: Keine KI-Halluzination darf eine Decke freigeben. Nur der SIO mit deterministischem Rechenkern setzt das Gütesiegel.",
    slideIndex: 3
  }
];

const NANOBANANA_SLIDES = [
  {
    title: 'CEN/TS 19103 // ARCHITECTURAL PARADIGM',
    subtitle: 'Timber-Concrete Composite Decks (HBV)',
    diagram: 'HBV_OVERVIEW',
    notes: 'Hybride Bauweise: Beton nimmt Druckkräfte auf, Holz die Zugkräfte.'
  },
  {
    title: 'SLIP MODULUS & SHEAR PLANE DYNAMICS',
    subtitle: 'Kser Semi-Rigid Fastener Slip Curve',
    diagram: 'SLIP_CURVE',
    notes: 'Verschiebungsmodul Kser = 2/3 Ku im Grenzzustand der Tragfähigkeit (GZT).'
  },
  {
    title: 'EFFECTIVE BENDING STIFFNESS (EI)eff',
    subtitle: 'γ-Method Cross-Section Neutral Axis Shift',
    diagram: 'GAMMA_AXIS',
    notes: 'Steifigkeitsgewinn durch Mitwirkung der Ortbeton- oder Fertigteilplatte.'
  },
  {
    title: 'SIO DETERMINISTIC GATE INTEGRITY',
    subtitle: 'Zero Stochastic Tolerance // Δ = 0.000000%',
    diagram: 'SIO_SEAL',
    notes: 'Reine analytische Gleichungen ohne LLM-Arithmetik.'
  }
];

export const TalkRadioWorkspace: React.FC = () => {
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSource, setAudioSource] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const activeLine = RADIO_DIALOGUE[currentLineIdx];
  const activeSlide = NANOBANANA_SLIDES[activeLine.slideIndex];

  // Initialize and animate live waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWaveform = () => {
      animFrameRef.current = requestAnimationFrame(renderWaveform);
      const analyser = lyriaSoundbed.getAnalyser();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser && isPlayingSynth) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          // Gradient from sky to purple
          const r = 56 + (i / bufferLength) * 180;
          const g = 189 - (i / bufferLength) * 60;
          const b = 248;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else {
        // Idle gentle wave
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const t = performance.now() * 0.002;
        for (let x = 0; x < canvas.width; x += 4) {
          const y = (canvas.height / 2) + Math.sin((x * 0.04) + t) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    renderWaveform();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingSynth]);

  // Toggle Lyria-Soundbed
  const handleToggleSoundbed = () => {
    const playing = lyriaSoundbed.toggle();
    setIsPlayingSynth(playing);
    lyriaSoundbed.setVolume(volume);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    lyriaSoundbed.setVolume(newVol);
  };

  // Play Line with Gemini TTS or Web Speech fallback
  const handleSpeakCurrentLine = async () => {
    setIsSpeaking(true);
    try {
      const res = await generateDualHostTts(activeLine.text, activeLine.speaker);
      if (res.success && res.data?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${res.data.audioBase64}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Browser speech fallback
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeLine.text);
        utterance.lang = 'de-DE';
        utterance.pitch = activeLine.speaker === 'Elena' ? 1.15 : 0.85;
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const handleNextLine = () => {
    setCurrentLineIdx(prev => (prev + 1) % RADIO_DIALOGUE.length);
  };

  const handlePrevLine = () => {
    setCurrentLineIdx(prev => (prev - 1 + RADIO_DIALOGUE.length) % RADIO_DIALOGUE.length);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-slate-100 text-sm">
                MANAGED AGENT 3: TALK RADIO ANTIGRAVITY
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/70 border border-pink-800 text-pink-300">
                DUAL-HOST TTS & SOUNDBED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dr. Vance & Elena Rostova // D-Moll Ambient Synth & Nanobanana Slides
            </p>
          </div>
        </div>

        {/* Lyria Soundbed Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <button
            onClick={handleToggleSoundbed}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition ${
              isPlayingSynth ? 'bg-pink-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            {isPlayingSynth ? 'LYRIA SOUNDBED: ON' : 'LYRIA SOUNDBED: OFF'}
          </button>

          <input
            type="range"
            min="0"
            max="0.4"
            step="0.02"
            value={volume}
            onChange={e => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 accent-pink-500"
            title="Soundbed Volume"
          />
        </div>
      </div>

      {/* Main Grid: Left Discourse, Right Nanobanana Slide Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Dual Host Dialogue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Episode: CEN/TS 19103 Holz-Beton-Verbund</span>
            <span>Line {currentLineIdx + 1} / {RADIO_DIALOGUE.length}</span>
          </div>

          {/* Active Speaker Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${activeLine.speaker === 'Elena' ? 'bg-pink-400' : 'bg-sky-400'}`} />
                <span className="font-mono font-bold text-sm text-slate-200">
                  {activeLine.speaker === 'Elena' ? 'Elena Rostova (Computational Architect)' : 'Dr. Vance (Senior Structural SIO)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {activeLine.speaker === 'Elena' ? 'Voice: Kore' : 'Voice: Puck'}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              "{activeLine.text}"
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevLine}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextLine}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSpeakCurrentLine}
                disabled={isSpeaking}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-mono text-xs flex items-center gap-1.5 transition"
              >
                <Mic className="w-3.5 h-3.5" />
                {isSpeaking ? 'SPEAKING...' : 'PLAY SPEECH (TTS)'}
              </button>
            </div>
          </div>

          {/* Real-Time Live Waveform Canvas */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>LIVE WAVEFORM FREQUENCY MONITOR</span>
              <span className={isPlayingSynth ? 'text-pink-400' : 'text-slate-600'}>
                {isPlayingSynth ? 'SYNTH CHORD ACTIVE (D-MOLL)' : 'STANDBY'}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={340}
              height={50}
              className="w-full h-12 bg-slate-950 rounded"
            />
          </div>
        </div>

        {/* Right: Nanobanana Synchronized Slide Deck */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between space-y-3 font-mono">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400">NANOBANANA SLIDE DECK</span>
              <span className="text-pink-400 font-bold">SLIDE #{activeLine.slideIndex + 1}</span>
            </div>

            <div className="mt-3 space-y-1">
              <h3 className="font-bold text-slate-100 text-sm">{activeSlide.title}</h3>
              <p className="text-xs text-sky-400">{activeSlide.subtitle}</p>
            </div>

            {/* Technical Diagram Placeholder representation */}
            <div className="mt-3 h-28 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
              <div className="relative text-center space-y-1">
                <div className="w-16 h-4 bg-sky-500/30 border border-sky-400/80 mx-auto rounded flex items-center justify-center text-[9px] text-sky-300 font-bold">
                  CONCRETE SLAB
                </div>
                <div className="w-1 h-3 bg-pink-500 mx-auto" title="Shear Connector (Kser)" />
                <div className="w-12 h-6 bg-amber-600/30 border border-amber-500/80 mx-auto rounded flex items-center justify-center text-[9px] text-amber-300 font-bold">
                  TIMBER BEAM
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-slate-500">ENGINEERING NOTE:</span> {activeSlide.notes}
          </div>
        </div>
      </div>
    </div>
  );
};
