/**
 * NEXUS-4 Managed Agent: TICKR Financial Research Agent
 * SEC EDGAR 10-K/10-Q Ingestion & Deterministic Balance Sheet Reconciliation (A = L + E)
 */

import React, { useState } from 'react';
import { BalanceSheetData } from '../../types/nexus';
import { verifyBalanceIdentity } from '../../kernels/financialKernel';
import { GOLDEN_FINANCIAL_SHEETS } from '../../knowledge/goldenSet';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  ExternalLink, 
  Clock, 
  Fingerprint,
  FileCheck
} from 'lucide-react';

interface TickrFinancialWorkspaceProps {
  onTriggerVeto?: (role: string, reason: string) => void;
}

export const TickrFinancialWorkspace: React.FC<TickrFinancialWorkspaceProps> = ({
  onTriggerVeto
}) => {
  const [selectedSheet, setSelectedSheet] = useState<BalanceSheetData>(GOLDEN_FINANCIAL_SHEETS[0]);
  const [customAssets, setCustomAssets] = useState<number>(selectedSheet.assets);
  const [customLiabilities, setCustomLiabilities] = useState<number>(selectedSheet.liabilities);
  const [customEquity, setCustomEquity] = useState<number>(selectedSheet.equity);

  // Run deterministic kernel check
  const verification = verifyBalanceIdentity({
    ...selectedSheet,
    assets: customAssets,
    liabilities: customLiabilities,
    equity: customEquity
  });

  const handleSelectPreset = (sheet: BalanceSheetData) => {
    setSelectedSheet(sheet);
    setCustomAssets(sheet.assets);
    setCustomLiabilities(sheet.liabilities);
    setCustomEquity(sheet.equity);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-slate-100 text-sm">
                MANAGED AGENT 2: FINANCIAL RESEARCH (TICKR)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300">
                SEC EDGAR // A = L + E KERNEL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Deterministic Balance Sheet Identity Verification // Strictly No Financial Advice
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 ${
          verification.identityHolds 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
            : 'bg-rose-950/60 border-rose-800 text-rose-400 animate-pulse'
        }`}>
          {verification.identityHolds ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>A = L + E BALANCED (Δ &lt; 1e-9)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DISCREPANCY: ${verification.deltaAbsolute.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Preset Ingestion Selector */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {GOLDEN_FINANCIAL_SHEETS.map(item => (
          <button
            key={item.ticker}
            onClick={() => handleSelectPreset(item)}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedSheet.ticker === item.ticker
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {item.company} ({item.ticker}) [{item.formType}]
          </button>
        ))}
      </div>

      {/* Numerical Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-1">
          <label className="text-[10px] text-slate-500 uppercase">Total Assets (A)</label>
          <input
            type="number"
            value={customAssets}
            onChange={e => setCustomAssets(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-100 font-bold"
          />
          <div className="text-[10px] text-slate-500 mt-1">${customAssets.toLocaleString()}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-1">
          <label className="text-[10px] text-slate-500 uppercase">Total Liabilities (L)</label>
          <input
            type="number"
            value={customLiabilities}
            onChange={e => setCustomLiabilities(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-100 font-bold"
          />
          <div className="text-[10px] text-slate-500 mt-1">${customLiabilities.toLocaleString()}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-1">
          <label className="text-[10px] text-slate-500 uppercase">Stockholders' Equity (E)</label>
          <input
            type="number"
            value={customEquity}
            onChange={e => setCustomEquity(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-100 font-bold"
          />
          <div className="text-[10px] text-slate-500 mt-1">${customEquity.toLocaleString()}</div>
        </div>
      </div>

      {/* Discrepancy & Veto Box */}
      {!verification.identityHolds && (
        <div className="bg-rose-950/30 border border-rose-800/80 rounded-lg p-3 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-rose-300 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              BALANCE SHEET DRIFT DETECTED: A − (L + E) ≠ 0
            </span>
            <span>Δ = {verification.deltaPercentage.toFixed(2)}%</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            The financial ledger identity is breached. SIO protocol mandates rejection of unverified mega-project financing structures.
          </p>
          <button
            onClick={() => onTriggerVeto?.('TICKR', `Balance sheet identity violation: Discrepancy of $${verification.deltaAbsolute.toLocaleString()} detected.`)}
            className="py-1 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
          >
            TRIGGER SIO FINANCIAL VETO
          </button>
        </div>
      )}

      {/* Citations & Evidence Trail */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2 text-xs font-mono">
        <span className="text-[10px] text-slate-500 uppercase">SEC EDGAR Provenance & Source Citations</span>
        <ul className="space-y-1 text-slate-400 text-[11px]">
          {selectedSheet.citations.map((cite, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{cite}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="text-[10px] text-slate-500 font-mono italic">
        DISCLAIMER: Der Financial Research Agent dient ausschließlich der baubetrieblichen Bilanzprüfung im AEC-Engineering-Kontext. Keine Anlageberatung oder Finanzdienstleistung.
      </div>
    </div>
  );
};
