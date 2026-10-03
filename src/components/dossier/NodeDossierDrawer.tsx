/**
 * NEXUS-4 Node Dossier Drawer
 * 5-Tab Workspace: Overview | Workspace | Relations | Audit | Mission
 */

import React, { useState } from 'react';
import { OrbitNode, DossierTab } from '../../types/nexus';
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Share2, 
  FileText, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Terminal,
  Activity
} from 'lucide-react';

interface NodeDossierDrawerProps {
  node: OrbitNode | null;
  onClose: () => void;
  onTriggerRunForNode?: (nodeId: string) => void;
  onTriggerVeto?: (role: string, reason: string) => void;
}

export const NodeDossierDrawer: React.FC<NodeDossierDrawerProps> = ({
  node,
  onClose,
  onTriggerRunForNode,
  onTriggerVeto
}) => {
  const [activeTab, setActiveTab] = useState<DossierTab>('OVERVIEW');
  const [vetoReasonInput, setVetoReasonInput] = useState('');
  const [showVetoForm, setShowVetoForm] = useState(false);

  if (!node) return null;

  const handleVetoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetoReasonInput.trim()) return;
    if (onTriggerVeto) {
      onTriggerVeto(node.shortName, vetoReasonInput.trim());
    }
    setVetoReasonInput('');
    setShowVetoForm(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div 
            className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-800"
            style={{ backgroundColor: node.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-slate-100 text-sm">{node.shortName}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {node.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-sm">{node.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-3 overflow-x-auto text-xs font-mono">
        {(['OVERVIEW', 'WORKSPACE', 'RELATIONS', 'AUDIT', 'MISSION'] as DossierTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'OVERVIEW' && <Activity className="w-3.5 h-3.5" />}
            {tab === 'WORKSPACE' && <Cpu className="w-3.5 h-3.5" />}
            {tab === 'RELATIONS' && <Share2 className="w-3.5 h-3.5" />}
            {tab === 'AUDIT' && <FileText className="w-3.5 h-3.5" />}
            {tab === 'MISSION' && <Target className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Node Description</span>
              <p className="text-slate-300 leading-relaxed">{node.description}</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-500 text-[10px] font-mono">EXECUTION RUNS</div>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">{node.runsCount}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">verified cycles</div>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-500 text-[10px] font-mono">DRIFT LEVEL</div>
                <div className={`text-xl font-bold font-mono mt-1 ${node.driftLevel > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {node.driftLevel.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{node.driftLevel > 2 ? 'Threshold exceeded!' : 'Under 2.0% limit'}</div>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-500 text-[10px] font-mono">CURRENT STATUS</div>
                <div className="text-sm font-bold font-mono text-slate-200 mt-1.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${node.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  {node.status}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Sovereign Gate</div>
              </div>
            </div>

            {/* Governance Actions (e.g. SIO Veto, Run Intent) */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onTriggerRunForNode?.(node.id)}
                className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono font-medium transition flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                EXECUTE GOLDEN INTENT THROUGH THIS NODE
              </button>

              {(node.layer === 'SIO' || node.layer === 'AEGS') && (
                <div>
                  {!showVetoForm ? (
                    <button
                      onClick={() => setShowVetoForm(true)}
                      className="w-full py-2 px-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-mono transition flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      EXERCISE SOVEREIGN VETO (PFLICHT-BEGRÜNDUNG)
                    </button>
                  ) : (
                    <form onSubmit={handleVetoSubmit} className="bg-rose-950/40 border border-rose-800/80 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-rose-300 font-mono text-xs">
                        <span>MANDATORY VETO JUSTIFICATION:</span>
                        <button type="button" onClick={() => setShowVetoForm(false)} className="text-slate-400 hover:text-slate-200">Cancel</button>
                      </div>
                      <textarea
                        value={vetoReasonInput}
                        onChange={(e) => setVetoReasonInput(e.target.value)}
                        placeholder="State technical, norm-based or ethical reason for veto (e.g. Discrepancy > 1e-9 or drift > 2%)..."
                        className="w-full bg-slate-950 border border-rose-800/70 rounded p-2 text-slate-200 text-xs font-mono h-20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs"
                      >
                        SIGN & ISSUE IRREVOCABLE VETO
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WORKSPACE */}
        {activeTab === 'WORKSPACE' && (
          <div className="space-y-3 font-mono">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-2">
              <span className="text-slate-500 text-[10px] uppercase">Node Specialized Capabilities</span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>Deterministic Kernel Execution with Closed Equations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>SHA-256 Digest Verification on input parameters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>Local MCP Bridge Binding via JSON-RPC protocol</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-2">
              <span className="text-slate-500 text-[10px] uppercase">Connected Clauses in SSOT</span>
              <div className="space-y-1">
                {node.clauses.map(clause => (
                  <div key={clause} className="flex items-center justify-between text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">
                    <span>{clause}</span>
                    <span className="text-[10px] text-emerald-400">ACTIVE & BINDING</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RELATIONS */}
        {activeTab === 'RELATIONS' && (
          <div className="space-y-3 font-mono">
            <span className="text-slate-500 text-[10px] uppercase">Interface Contracts (MCP-Routes)</span>
            <div className="space-y-2">
              {node.contracts.map(contractId => (
                <div key={contractId} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-slate-200 text-xs">{contractId}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">FastMCP / Streamable</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-3 font-mono">
            <span className="text-slate-500 text-[10px] uppercase">Provenance & Audit Trail</span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <div className="text-slate-400">Fingerprint: <span className="text-sky-300">SHA256:0x7b4a2f8c9d01</span></div>
              <div className="text-slate-400">Authority: <span className="text-slate-200">Eurocode Structural Registry</span></div>
              <div className="text-slate-400">Tolerance: <span className="text-emerald-400">&lt; 1e-9 (Strictly Deterministic)</span></div>
              <div className="text-slate-400">Last Verified: <span className="text-slate-300">2026-10-03 07:30 UTC</span></div>
            </div>
          </div>
        )}

        {/* TAB 5: MISSION */}
        {activeTab === 'MISSION' && (
          <div className="space-y-3">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Constitutional Mission Mandate</span>
              <p className="text-slate-200 leading-relaxed font-sans text-xs italic">
                "{node.mission}"
              </p>
            </div>
            <div className="bg-sky-950/20 border border-sky-800/40 p-3 rounded-lg text-slate-300 text-xs">
              <b className="text-sky-400">LEITPRINZIP:</b> Automatisierte Berechnung liefert Kandidatenergebnisse, keine Freigaben. Nur der SIO bestätigt technische Validität final.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
