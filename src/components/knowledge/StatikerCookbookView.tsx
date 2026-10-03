/**
 * Statiker-Cookbook & Technical Approvals (ETA) View
 * Curated step-by-step procedures according to Eurocode & Austrian Annex (NAD-AT)
 * Includes Technical Approvals Catalog (Schöck, Peikko, Halfen, H-Bau, DYWIDAG, Rothoblaas, CLT)
 * and Downloadable Markdown & System Constitutions.
 */

import React, { useState } from 'react';
import { 
  TECHNICAL_APPROVALS_CATALOG, 
  STATIKER_COOKBOOK_MARKDOWN, 
  NEXUS4_SYSTEM_CONSTITUTION, 
  TechnicalApprovalItem 
} from '../../knowledge/statikerCookbook';
import { 
  BookOpen, 
  Download, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';

export const StatikerCookbookView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'COOKBOOK' | 'APPROVALS' | 'CONSTITUTION'>('COOKBOOK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredApprovals = TECHNICAL_APPROVALS_CATALOG.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.approvalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownloadMarkdown = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm">
                STATIKER-COOKBOOK &amp; ZULASSUNGSKATALOG (ETA / DIBt)
              </h2>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                EUROCODE &amp; NAD-AT
              </span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans mt-0.5">
              Handlungsanweisungen, Rechenrezepte und europäische Zulassungen für HBV, Holz-, Beton- und Stahlbau.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('COOKBOOK')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'COOKBOOK' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            1. Statiker-Cookbook (.md)
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'APPROVALS' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            2. Zulassungskatalog (ETA / DIBt)
          </button>

          <button
            onClick={() => setActiveTab('CONSTITUTION')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'CONSTITUTION' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            3. System-Verfassung
          </button>
        </div>
      </div>

      {/* TAB 1: Statiker Cookbook */}
      {activeTab === 'COOKBOOK' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-slate-300 font-bold">Eurocode Schritt-für-Schritt Rechenrezepte</span>
            <button
              onClick={() => handleDownloadMarkdown('NEXUS4_Statiker_Cookbook.md', STATIKER_COOKBOOK_MARKDOWN)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              DOWNLOAD COOKBOOK (.MD)
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[520px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {STATIKER_COOKBOOK_MARKDOWN}
          </pre>
        </div>
      )}

      {/* TAB 2: Technical Approvals Catalog (ETA / DIBt / BTZ) */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-3">
          {/* Search & Category Filter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Suche Hersteller (Schöck, Peikko, Halfen, H-Bau, Schmid...), ETA-Nummer oder Produkt..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
              >
                <option value="ALL">Alle Kategorien</option>
                <option value="THERMAL_BREAK">Wärmetrennung (Isokorb)</option>
                <option value="CORBEL_CONNECTOR">Konsolen &amp; Auflager (Peikko)</option>
                <option value="TIMBER_SCREW">Holzbauschrauben &amp; HBV (Schmid)</option>
                <option value="ANCHOR_CHANNEL">Ankerschienen (Halfen)</option>
                <option value="CLT_TIMBER">Brettsperrholz (CLT / BSP)</option>
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredApprovals.map(item => (
              <div key={item.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-900">
                    <span className="font-bold text-amber-300 text-xs truncate">{item.productName}</span>
                    <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                      {item.approvalNumber}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-bold mt-1">{item.manufacturer}</div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <div className="text-[10px] text-slate-500">
                    Normbasis: <b className="text-slate-300">{item.designStandard}</b> (Gültig bis {item.validUntil})
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] bg-slate-900/60 p-2 rounded">
                    {Object.entries(item.keyParameters).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-slate-500">{k}: </span>
                        <span className="text-sky-300 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: System-Verfassung & ZT Sorgfaltspflicht */}
      {activeTab === 'CONSTITUTION' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-slate-300 font-bold">NEXUS-4 Verfassungsgrundsätze &amp; ZT-Sorgfaltspflicht</span>
            <button
              onClick={() => handleDownloadMarkdown('NEXUS4_System_Constitution.md', NEXUS4_SYSTEM_CONSTITUTION)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              DOWNLOAD VERFASSUNG (.MD)
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[520px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {NEXUS4_SYSTEM_CONSTITUTION}
          </pre>
        </div>
      )}
    </div>
  );
};
