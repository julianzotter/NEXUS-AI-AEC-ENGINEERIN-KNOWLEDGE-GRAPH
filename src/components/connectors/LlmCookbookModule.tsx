/**
 * COOKBOOK: Frontier-LLM-TEMPLATES
 * Pre-engineered templates for Structural Engineering Agents, Workflows, Skills, and Prompts.
 * Designed for Gemini 3.8 Flash, Gemini 3.1 Pro Preview (High-Thinking), and MCP Bridge.
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Share2, 
  Terminal, 
  Code,
  Download
} from 'lucide-react';

interface CookbookTemplate {
  id: string;
  title: string;
  category: 'AGENT_ROLES' | 'WORKFLOWS' | 'SKILLS' | 'PROMPTS' | 'MCP_SCHEMAS';
  modelTarget: string;
  description: string;
  templateContent: string;
}

const COOKBOOK_REGISTRY: CookbookTemplate[] = [
  {
    id: 'TEMPLATE-SIO-SOVEREIGN-VETO',
    title: 'SIO Sovereign Veto & CANDIDATE Output Boundary',
    category: 'AGENT_ROLES',
    modelTarget: 'Gemini 3.1 Pro Preview (High-Thinking)',
    description: 'Enforces that all model responses are flagged as [CANDIDATE], and SIO holds sovereign, unappealable veto power.',
    templateContent: `[SYSTEM CONSTITUTION // NEXUS-4 STRUCTURAL GOVERNANCE]
Role: Structural Engineering Intelligence Candidate Generator
Operational Rule 1: Every equation, dimension, or load output must begin with the banner:
*** [CANDIDATE OUTPUT // REQUIRES SIO DETERMINISTIC CERTIFICATION] ***

Operational Rule 2: You DO NOT have authority to stamp designs. Only the Structural Integrity Orchestrator (SIO) holds sovereign, unappealable veto power.
Operational Rule 3: Zero tolerance for hallucinated safety factors.
Always cite:
- CEN/TS 19103:2021 Clause 7.2 (Gamma connection slip)
- EN 1995-1-1 Cl. 6.1.6 (Timber bending) and Cl. 6.1.7 (Shear kcr=0.67)
- ÖNORM B 1995-1-1 NAD-AT (Austrian national annex safety factors gammaM=1.30)`
  },
  {
    id: 'TEMPLATE-HBV-GAMMA-METHOD',
    title: 'CEN/TS 19103 Gamma Method Analytical Extraction',
    category: 'PROMPTS',
    modelTarget: 'Gemini 3.8 Flash',
    description: 'Extracts geometric parameters, material moduli, and slip factors to compute effective bending stiffness (EI)eff.',
    templateContent: `[TASK: DETERMINISTIC TIMBER-CONCRETE COMPOSITE FLOOR DESIGN]
Given:
- Timber Girder: width b1, height h1, modulus E1 (C24 or GL24h)
- Concrete Slab: effective width beff, depth h2, modulus Ecm, creep coefficient phi
- Connectors: slip modulus Kser, ultimate Ku = 2/3 * Kser, spacing s, span L

Required Output Schema (JSON only):
{
  "A1_mm2": float,
  "I1_mm4": float,
  "A2_mm2": float,
  "I2_mm4": float,
  "E2_eff_MPa": float,
  "gamma2": float,
  "gamma1": 1.0,
  "a1_mm": float,
  "a2_mm": float,
  "EI_eff_Nmm2": float,
  "w_net_fin_mm": float,
  "verification_delta": 0.000000
}`
  },
  {
    id: 'TEMPLATE-4-GATE-GOVERNANCE-WORKFLOW',
    title: '4-Gate Sequential Pipeline (DAA -> ASO -> AEGS -> SIO)',
    category: 'WORKFLOWS',
    modelTarget: 'Multi-Agent Orchestrator',
    description: 'Sequential consensus pipeline routing raw input through quality, reasoning, EU AI Act compliance, and final engineering approval.',
    templateContent: `[WORKFLOW ORCHESTRATION PIPELINE: 4-LAYER GOVERNANCE]
Gate 1 [DAA - Data Advantage Architect]:
  - Compute SHA-256 fingerprint on raw inputs.
  - Verify schema against EurocodeCalculationProtocol.schema.json.
  - Assert missing/corrupt values are rejected before model ingestion.

Gate 2 [ASO - AI Systems Orchestrator]:
  - Select optimal model: Gemini 3.8 Flash (speed) or Gemini 3.1 Pro (deep reasoning).
  - Inject verified context from SSOT Knowledge Graph.
  - Mark result strictly as CANDIDATE.

Gate 3 [AEGS - AI Ethics & Governance Strategist]:
  - Classify risk tier according to EU AI Act Annex III (Civil Engineering / Critical Infrastructure).
  - Verify continuous drift < 2.0%.
  - Attach transparency disclaimer.

Gate 4 [SIO - Structural Integrity Orchestrator]:
  - Execute deterministic Python kernel (Δ = 0.000000%).
  - If discrepancy > 1e-9, trigger SOVEREIGN VETO immediately.
  - If compliant, issue cryptographic SIO Audit Seal.`
  },
  {
    id: 'TEMPLATE-MCP-EUROCODE-TOOL-SCHEMA',
    title: 'MCP Tool Calling Schema for Eurocode Solvers',
    category: 'MCP_SCHEMAS',
    modelTarget: 'MCP Server Specification',
    description: 'JSON Schema declaration for Eurocode tool calling across local and remote MCP bridges.',
    templateContent: `{
  "name": "hbv.gamma_check",
  "description": "Computes composite floor effective stiffness according to CEN/TS 19103:2021 analytical gamma method.",
  "parameters": {
    "type": "object",
    "required": ["spanL", "b1", "h1", "beff", "h2", "Kser", "s"],
    "properties": {
      "spanL": { "type": "number", "description": "Beam span in meters" },
      "b1": { "type": "number", "description": "Timber beam width in mm" },
      "h1": { "type": "number", "description": "Timber beam depth in mm" },
      "beff": { "type": "number", "description": "Effective concrete flange width in mm" },
      "h2": { "type": "number", "description": "Concrete slab depth in mm" },
      "Kser": { "type": "number", "description": "Slip modulus per shear connector in N/mm" },
      "s": { "type": "number", "description": "Shear connector spacing in mm" }
    }
  }
}`
  }
];

export const LlmCookbookModule: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CookbookTemplate>(COOKBOOK_REGISTRY[0]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const filtered = COOKBOOK_REGISTRY.filter(t => {
    if (activeCategory === 'ALL') return true;
    return t.category === activeCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedTemplate.templateContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedTemplate.templateContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              FRONTIER-LLM-COOKBOOK // PROMPTS, AGENTS & SKILLS
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Production-grade prompt templates and agent constitutions for Gemini 3.8 Flash & Gemini 3.1 Pro Preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-pink-400" />
            EXPORT TEMPLATE
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
        {[
          { id: 'ALL', label: 'ALL TEMPLATES' },
          { id: 'AGENT_ROLES', label: 'AGENT ROLES (SIO/ASO)' },
          { id: 'WORKFLOWS', label: 'WORKFLOW CHAINS' },
          { id: 'PROMPTS', label: 'ANALYTICAL PROMPTS' },
          { id: 'MCP_SCHEMAS', label: 'MCP TOOL SCHEMAS' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded text-[11px] transition ${
              activeCategory === cat.id ? 'bg-pink-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid: Templates on Left, Content on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left (5 cols) */}
        <div className="md:col-span-5 space-y-2">
          {filtered.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                selectedTemplate.id === t.id
                  ? 'bg-pink-950/20 border-pink-500/80 text-pink-200 font-bold'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="truncate">{t.title}</span>
                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-pink-400 font-mono">
                  {t.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans line-clamp-2">{t.description}</p>
              <div className="text-[9px] text-slate-500 mt-2 font-mono">Target: {t.modelTarget}</div>
            </div>
          ))}
        </div>

        {/* Right (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-slate-200 text-xs">{selectedTemplate.title}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'PROMPT COPIED' : 'COPY PROMPT'}
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto h-64 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {selectedTemplate.templateContent}
            </pre>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>Model: {selectedTemplate.modelTarget}</span>
            <span>Category: {selectedTemplate.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
