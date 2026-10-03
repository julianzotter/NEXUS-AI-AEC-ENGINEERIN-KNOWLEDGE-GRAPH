/**
 * NEXUS-4 Left Column: Role Perspective Sidebar
 * Navigation between the 4 Governance Layers + 3 Managed Agents + Kernels
 */

import React from 'react';
import { GovernanceRole, AgentRole } from '../../types/nexus';
import { 
  Database, 
  Cpu, 
  Scale, 
  ShieldCheck, 
  FileSpreadsheet, 
  Building2, 
  Radio, 
  Calculator, 
  BookOpen, 
  Share2,
  HardDrive
} from 'lucide-react';

export type ActivePerspective = 
  | 'GOV_DAA' 
  | 'GOV_ASO' 
  | 'GOV_AEGS' 
  | 'GOV_SIO' 
  | 'AGENT_DATA' 
  | 'AGENT_TICKR' 
  | 'AGENT_RADIO' 
  | 'KERNEL_HBV' 
  | 'KERNEL_EC5' 
  | 'KERNEL_EC2'
  | 'KNOWLEDGE_SSOT'
  | 'MCP_BRIDGE'
  | 'ORBIT_3D';

interface RolePerspectiveSidebarProps {
  currentPerspective: ActivePerspective;
  onSelectPerspective: (perspective: ActivePerspective) => void;
  driftLevel: number;
}

export const RolePerspectiveSidebar: React.FC<RolePerspectiveSidebarProps> = ({
  currentPerspective,
  onSelectPerspective,
  driftLevel
}) => {
  const governanceItems = [
    { id: 'GOV_DAA' as ActivePerspective, label: 'DAA // Data Quality', role: 'DAA', icon: Database, color: 'text-sky-400' },
    { id: 'GOV_ASO' as ActivePerspective, label: 'ASO // Orchestrator', role: 'ASO', icon: Cpu, color: 'text-indigo-400' },
    { id: 'GOV_AEGS' as ActivePerspective, label: 'AEGS // EU AI Act', role: 'AEGS', icon: Scale, color: 'text-amber-400' },
    { id: 'GOV_SIO' as ActivePerspective, label: 'SIO // Sovereign Veto', role: 'SIO', icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  const agentItems = [
    { id: 'AGENT_DATA' as ActivePerspective, label: 'AI Data Analyst', icon: FileSpreadsheet, color: 'text-cyan-400' },
    { id: 'AGENT_TICKR' as ActivePerspective, label: 'TICKR Financial', icon: Building2, color: 'text-emerald-400' },
    { id: 'AGENT_RADIO' as ActivePerspective, label: 'Talk Radio Antigravity', icon: Radio, color: 'text-pink-400' },
  ];

  const kernelItems = [
    { id: 'KERNEL_HBV' as ActivePerspective, label: 'CEN/TS 19103 HBV (Golden)', icon: Calculator, color: 'text-emerald-400' },
    { id: 'KERNEL_EC5' as ActivePerspective, label: 'EC5 Holzbalken', icon: Calculator, color: 'text-slate-300' },
    { id: 'KERNEL_EC2' as ActivePerspective, label: 'EC2 Stahlbetonplatte', icon: Calculator, color: 'text-purple-400' },
    { id: 'KNOWLEDGE_SSOT' as ActivePerspective, label: 'SSOT Knowledge Graph', icon: BookOpen, color: 'text-purple-400' },
    { id: 'MCP_BRIDGE' as ActivePerspective, label: 'Local MCP Tool Bridge', icon: Share2, color: 'text-yellow-400' },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-800/80 p-3 flex flex-col justify-between overflow-y-auto select-none font-mono text-xs">
      <div className="space-y-4">
        {/* Orbit View Launcher */}
        <button
          onClick={() => onSelectPerspective('ORBIT_3D')}
          className={`w-full py-2 px-3 rounded-lg border text-left font-bold transition flex items-center justify-between ${
            currentPerspective === 'ORBIT_3D'
              ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            3D-ORBIT CONTROL PLANE
          </span>
          <span className="text-[10px] text-slate-500">12 NODES</span>
        </button>

        {/* 1. Governance Perspectives */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 font-bold flex justify-between">
            <span>4-Layer Governance</span>
            <span className="text-sky-400">Strict Gate</span>
          </div>
          {governanceItems.map(item => {
            const Icon = item.icon;
            const isSelected = currentPerspective === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPerspective(item.id)}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Managed Agents */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 font-bold">
            Managed Agents (3)
          </div>
          {agentItems.map(item => {
            const Icon = item.icon;
            const isSelected = currentPerspective === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPerspective(item.id)}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Deterministic Kernels & Knowledge */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 font-bold">
            Rechenkerne & SSOT
          </div>
          {kernelItems.map(item => {
            const Icon = item.icon;
            const isSelected = currentPerspective === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPerspective(item.id)}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Health Box */}
      <div className="pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
        <div className="flex justify-between">
          <span>Drift Level:</span>
          <span className={driftLevel > 2 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
            {driftLevel.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tolerance:</span>
          <span className="text-slate-300">&lt; 1e-9 (Δ = 0.0%)</span>
        </div>
        <div className="text-[9px] text-slate-500 pt-1">
          SIO VETO: Sovereign & Final
        </div>
      </div>
    </aside>
  );
};
