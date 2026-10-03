/**
 * NEXUS-4 Local MCP Bridge Tool Console
 * Live execution console for the 10 MCP tools across Engineering, Knowledge & Data.
 */

import React, { useState } from 'react';
import { mcpBridge, McpToolCallResult } from '../../services/mcpBridge';
import { GOLDEN_HBV_PARAMETERS, GOLDEN_EC5_BEAM, GOLDEN_EC2_SLAB } from '../../knowledge/goldenSet';
import { Share2, Play, CheckCircle2, AlertOctagon, Terminal, ArrowRight, Fingerprint } from 'lucide-react';

export const McpBridgeView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('hbv.gamma_check');
  const [lastResult, setLastResult] = useState<McpToolCallResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const tools = [
    { id: 'hbv.gamma_check', name: 'hbv.gamma_check', category: 'Engineering', desc: 'HBV-Verbundberechnung nach CEN/TS 19103' },
    { id: 'ec5.beam_check', name: 'ec5.beam_check', category: 'Engineering', desc: 'Holzbalken-Nachweis nach EN 1995-1-1' },
    { id: 'ec2.slab_check', name: 'ec2.slab_check', category: 'Engineering', desc: 'Stahlbetonplatte nach EN 1992-1-1' },
    { id: 'verify.delta', name: 'verify.delta', category: 'Engineering', desc: 'Deterministische Delta-Abweichungsprüfung (1e-9)' },
    { id: 'knowledge.search', name: 'knowledge.search', category: 'Knowledge', desc: 'Retrieval über den Eurocode Knowledge-Graph' },
    { id: 'knowledge.resolve_authority', name: 'knowledge.resolve_authority', category: 'Knowledge', desc: 'Norm-Clause Binding & Legal Authority' },
    { id: 'knowledge.temporal_check', name: 'knowledge.temporal_check', category: 'Knowledge', desc: 'Gültigkeitsprüfung von Normen und Klauseln' },
    { id: 'data.fingerprint', name: 'data.fingerprint', category: 'Data', desc: 'Kryptographische SHA-256 Datenintegrität' },
    { id: 'data.ingest_csv', name: 'data.ingest_csv', category: 'Data', desc: 'ETL-Pipeline mit Schema-Erkennung' },
    { id: 'data.ingest_ifc', name: 'data.ingest_ifc', category: 'Data', desc: 'BIM-Modell-Ingestion für Träger und Decken' }
  ];

  const handleExecuteTool = async () => {
    setIsRunning(true);
    let res: McpToolCallResult;

    try {
      switch (selectedTool) {
        case 'hbv.gamma_check':
          res = await mcpBridge.callHbvGammaCheck(GOLDEN_HBV_PARAMETERS);
          break;
        case 'ec5.beam_check':
          res = await mcpBridge.callEc5BeamCheck(GOLDEN_EC5_BEAM);
          break;
        case 'ec2.slab_check':
          res = await mcpBridge.callEc2SlabCheck(GOLDEN_EC2_SLAB);
          break;
        case 'verify.delta':
          res = await mcpBridge.callVerifyDelta({ gamma2: 0.8197 }, { gamma2: 0.8197 });
          break;
        case 'knowledge.search':
          res = await mcpBridge.callKnowledgeSearch('CEN/TS 19103');
          break;
        case 'knowledge.resolve_authority':
          res = await mcpBridge.callKnowledgeResolveAuthority('CEN/TS 19103');
          break;
        case 'knowledge.temporal_check':
          res = await mcpBridge.callKnowledgeTemporalCheck('NORM-CEN-TS-19103');
          break;
        case 'data.fingerprint':
          res = await mcpBridge.callDataFingerprint('NEXUS-4-STRUCTURAL-RAW-DATA-STREAM');
          break;
        case 'data.ingest_csv':
          res = await mcpBridge.callDataIngestCsv('span_m,h1_mm,b1_mm\n6.2,280,160');
          break;
        case 'data.ingest_ifc':
          res = await mcpBridge.callDataIngestIfc('ISO-10303-21; #1=IFCBEAM("Beam-1",$,$,$); #2=IFCSLAB("Slab-1",$,$,$);');
          break;
        default:
          res = await mcpBridge.callDataFingerprint('NEXUS-4');
      }
      setLastResult(res);
    } catch (e: any) {
      setLastResult({
        tool: selectedTool,
        success: false,
        result: { error: e.message },
        executionTimeMs: 0,
        hash: 'ERROR'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm">LOCAL MCP BRIDGE & TOOL ROUTER</h2>
            <p className="text-slate-400 text-[11px]">10 Self-Hosted Access Tools for Engineering, Knowledge & ETL</p>
          </div>
        </div>

        <button
          onClick={handleExecuteTool}
          disabled={isRunning}
          className="px-3.5 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md shadow-yellow-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunning ? 'EXECUTING MCP TOOL...' : 'INVOKE SELECTED TOOL'}
        </button>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {tools.map(t => (
          <div
            key={t.id}
            onClick={() => setSelectedTool(t.id)}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTool === t.id
                ? 'border-yellow-500 bg-yellow-950/20'
                : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">{t.name}</span>
              <span className="text-[10px] text-yellow-400 bg-slate-900 px-1.5 py-0.5 rounded">
                {t.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Execution Output Stream */}
      {lastResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">MCP TOOL RESPONSE: {lastResult.tool}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span>Time: <b className="text-sky-300">{lastResult.executionTimeMs} ms</b></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Fingerprint className="w-3 h-3" /> {lastResult.hash.substring(0, 16)}...
              </span>
            </div>
          </div>

          <pre className="bg-slate-900/80 p-3 rounded text-[11px] text-slate-300 overflow-x-auto max-h-48">
            {JSON.stringify(lastResult.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
