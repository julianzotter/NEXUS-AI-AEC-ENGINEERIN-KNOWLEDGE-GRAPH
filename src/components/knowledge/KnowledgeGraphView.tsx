/**
 * NEXUS-4 SSOT Knowledge Graph & Standards Explorer
 * Interactively browse CEN/TS 19103, EC5, EC2, clauses, formulas, materials, and cookbooks.
 */

import React, { useState } from 'react';
import { SSOT_DATABASE, MATERIAL_CATALOG, KnowledgeObject } from '../../knowledge/ssotKnowledgeBase';
import { BookOpen, Search, ShieldCheck, CheckCircle2, FileText, Layers, ExternalLink } from 'lucide-react';

export const KnowledgeGraphView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeObject, setActiveObject] = useState<KnowledgeObject | null>(SSOT_DATABASE[0]);

  const filtered = SSOT_DATABASE.filter(item => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesQuery = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">SSOT KNOWLEDGE GRAPH & NORMS DIRECTORY</h2>
            <p className="text-slate-400 text-[11px]">CEN/TS 19103 • EN 1995-1-1 • EN 1992-1-1 • Temporal Validity</p>
          </div>
        </div>

        <span className="text-[10px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
          CANONICAL AUTHORITY
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {['ALL', 'STANDARD', 'CLAUSE', 'COOKBOOK'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                selectedType === type ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clause, formula..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Split View: List on left, details on right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objects List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map(obj => (
            <div
              key={obj.id}
              onClick={() => setActiveObject(obj)}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                activeObject?.id === obj.id
                  ? 'border-purple-500 bg-purple-950/30'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200">{obj.code}</span>
                <span className="text-[10px] text-purple-400 bg-slate-900 px-1.5 py-0.5 rounded">
                  {obj.type}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-sans line-clamp-1">{obj.title}</div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Authority: {obj.authority}</span>
                <span className="text-emerald-400">Valid to {obj.validUntil}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Object Detail Card */}
        {activeObject && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-purple-400 uppercase tracking-wider">{activeObject.type}</span>
                <h3 className="font-bold text-slate-100 text-sm mt-0.5">{activeObject.code}</h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                {activeObject.status}
              </span>
            </div>

            <div className="text-slate-300 font-sans text-xs leading-relaxed">
              {activeObject.description}
            </div>

            {activeObject.formulaLatex && (
              <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Governing Closed-Form Formula</span>
                <div className="text-sky-300 font-bold text-xs">{activeObject.formulaLatex}</div>
              </div>
            )}

            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-900 pt-2">
              <div>Authority: <b className="text-slate-200">{activeObject.authority}</b></div>
              <div>Validity Range: <b className="text-slate-200">{activeObject.validFrom} bis {activeObject.validUntil}</b></div>
              <div>Connected Relations: <b className="text-sky-400">{activeObject.relations.join(', ')}</b></div>
            </div>
          </div>
        )}
      </div>

      {/* Materials Quick Matrix */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <span className="text-slate-500 text-[10px] uppercase font-bold">Standardized Material Catalog (Eurocode SSOT)</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MATERIAL_CATALOG.timber.map(t => (
            <div key={t.name} className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-bold text-amber-300">{t.name}</div>
              <div className="text-slate-400 text-[10px]">fmk: {t.fmk} MPa | E0: {t.E0mean} MPa</div>
            </div>
          ))}
          {MATERIAL_CATALOG.concrete.map(c => (
            <div key={c.name} className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-bold text-purple-300">{c.name}</div>
              <div className="text-slate-400 text-[10px]">fck: {c.fck} MPa | Ecm: {c.Ecm} MPa</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
