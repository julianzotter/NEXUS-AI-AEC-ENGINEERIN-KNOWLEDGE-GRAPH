/**
 * NEXUS-4 Search Grounding Modal
 * Real-time Eurocode amendments & technical literature retrieval using Gemini 3.5 Flash + googleSearch.
 */

import React, { useState } from 'react';
import { searchEurocodeGrounding } from '../../services/geminiClient';
import { Search, X, Globe, Sparkles, Loader2, BookOpen } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('CEN/TS 19103 Timber concrete composite slip modulus Kser');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const res = await searchEurocodeGrounding(query.trim());
    setIsLoading(false);

    if (res.success && res.data) {
      setResult(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
    } else {
      setError(res.error || 'Search query failed');
    }
  };

  const sampleQueries = [
    'CEN/TS 19103:2021 differences to Eurocode 5 Annex B',
    'DIN EN 1995-1-1 kmod modification factors for CLT',
    'Eurocode 2 crack width limit wk for exposure class XC3'
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full space-y-4 font-mono text-xs max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Globe className="w-5 h-5" />
            <span>EUROCODE SEARCH GROUNDING // GEMINI 3.5 FLASH</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Eurocode amendments, DIN standards, research papers..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 transition"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            SEARCH
          </button>
        </form>

        {/* Sample queries */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500">Suggestions:</span>
          {sampleQueries.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(q)}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-sans leading-relaxed text-xs">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              <span className="font-mono text-xs">Grounding search via Google Search tool...</span>
            </div>
          )}

          {error && (
            <div className="text-rose-400 font-mono text-xs bg-rose-950/30 p-3 rounded border border-rose-800">
              Error: {error}
            </div>
          )}

          {result && (
            <div className="space-y-2 whitespace-pre-wrap">
              <div className="font-mono text-[10px] text-sky-400 flex items-center gap-1 pb-1 border-b border-slate-800">
                <Sparkles className="w-3 h-3" />
                GROUNDED TECHNICAL BRIEFING
              </div>
              <p className="text-slate-200">{result}</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="text-slate-500 font-mono text-center py-12">
              Enter an engineering inquiry to pull verified Eurocode clauses and technical amendments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
