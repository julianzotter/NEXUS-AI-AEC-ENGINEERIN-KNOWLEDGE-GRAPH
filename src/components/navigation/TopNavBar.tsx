/**
 * NEXUS-4 High-Density Top Navigation Bar
 * Features official Google Sign-In button, Push-to-Talk Voice Trigger, and System Status Badges.
 */

import React from 'react';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, 
  Mic, 
  Play, 
  Cpu, 
  Search, 
  LogOut, 
  HardDrive,
  Layers
} from 'lucide-react';

interface TopNavBarProps {
  currentUser: User | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenVoiceModal: () => void;
  onOpenSearchModal: () => void;
  onTriggerGoldenRun: () => void;
  onSelectPerspective?: (perspective: any) => void;
  systemOperational: boolean;
  driftLevel: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onOpenVoiceModal,
  onOpenSearchModal,
  onTriggerGoldenRun,
  onSelectPerspective,
  systemOperational,
  driftLevel
}) => {
  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between backdrop-blur-md z-40 select-none">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold text-sm shadow-md shadow-sky-500/10">
            N4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-100 tracking-tight text-sm">
                NEXUS-4
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
                AI-AEC-OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Deterministic Eurocode Engineering OS // EC2 • EC5 • CEN/TS 19103
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions / Central Intents */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onTriggerGoldenRun}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          RUN GOLDEN SLICE
        </button>

        {onSelectPerspective && (
          <>
            <button
              onClick={() => onSelectPerspective('CONNECTORS_HUB')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              CAD & TASKS
            </button>
            <button
              onClick={() => onSelectPerspective('STRUCTURAL_3D')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              3D VISUALIZER
            </button>
          </>
        )}

        <button
          onClick={onOpenSearchModal}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          SEARCH STANDARDS
        </button>

        <button
          onClick={onOpenVoiceModal}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition flex items-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5 text-pink-400" />
          VOICE COMMANDS
        </button>
      </div>

      {/* Right: System Status & Official Google Sign-In Button */}
      <div className="flex items-center gap-3">
        {/* SIO Integrity Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${driftLevel > 2 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
          <span className="text-slate-400">SIO SEAL:</span>
          <span className={driftLevel > 2 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
            {driftLevel > 2 ? 'SUSPENDED' : 'ARMED'}
          </span>
        </div>

        {/* Google Workspace Authentication per Skill Specification */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 pr-2.5 text-xs font-mono">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-white text-[10px]">
                {currentUser.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-slate-200 text-xs hidden sm:inline max-w-[120px] truncate">
              {currentUser.displayName || currentUser.email}
            </span>
            <button
              onClick={onSignOut}
              className="text-slate-400 hover:text-rose-400 p-1 rounded"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Official Google Material Sign-In Button per workspace-integration skill */
          <button
            onClick={onSignInWithGoogle}
            className="flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-md font-medium text-xs shadow-sm transition border border-slate-300"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className="font-sans font-medium text-slate-700">Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  );
};
