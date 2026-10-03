/**
 * NEXUS-4 Connectors & Open-Ecosystem Hub
 * Integrates:
 * 1. GitHub Connector: PAT & Repository URL input for fetching & syncing structural design code & docs
 * 2. Google Colab & Drive Ingestion: Notebook 1l3tCB3UTLFthvq6Jui7vOkdPCvz0kGP_ (Cell 7DhjHRQGKdhx, KB-001-HBV-GPT KlimAIthos)
 * 3. CAD/BIM Open-Standards Exporters: DXF for BricsCAD & OpenIFC IFC4 for FreeCAD BIM
 * 4. Google Tasks Integration: Task lists & SIO Design Verification Checklists
 * 5. Austrian National Annex (NAD-AT) Provisions
 */

import React, { useState, useEffect } from 'react';
import { HbvParameters, HbvCalculationResult } from '../../types/nexus';
import { generateDxfCrossSection, generateOpenIfc4Model } from '../../services/cadBimExport';
import { gitHubSyncEngine, RemoteKnowledgeNode, SyncResultReport } from '../../services/githubSync';
import { listTasks, createGoogleTask, completeGoogleTask, GoogleTaskItem } from '../../services/tasksService';
import { ColabDriveIngestionModule } from './ColabDriveIngestionModule';
import { mcpBridge } from '../../services/mcpBridge';
import { 
  Share2, 
  Download, 
  CheckSquare, 
  Github, 
  Layers, 
  Building2, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  Flag, 
  FileCode, 
  HardDrive, 
  Key, 
  Link2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Terminal, 
  AlertTriangle 
} from 'lucide-react';

export interface GitHubConnectorProps {
  onKnowledgeUpdated?: () => void;
  defaultRepoUrl?: string;
}

/**
 * GitHub Connector Component within ConnectorsWorkspace.tsx
 * Allows users to input their GitHub Personal Access Token and repository URL
 * to fetch and synchronize structural design code (Python/JS kernels) and documentation
 * updates directly into the local NEXUS knowledge graph.
 */
export const GitHubConnector: React.FC<GitHubConnectorProps> = ({
  onKnowledgeUpdated,
  defaultRepoUrl = 'https://github.com/julianzotter/NEXUS-AI-AEC-ENGINEERIN-KNOWLEDGE-GRAPH'
}) => {
  const [pat, setPat] = useState<string>('');
  const [showPat, setShowPat] = useState<boolean>(false);
  const [repoUrl, setRepoUrl] = useState<string>(defaultRepoUrl);
  const [branch, setBranch] = useState<string>('main');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [discoveredFiles, setDiscoveredFiles] = useState<RemoteKnowledgeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<RemoteKnowledgeNode | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [syncLogs, setSyncLogs] = useState<string[]>([
    '[INIT] GitHub Connector armed.',
    `[TARGET] Repo URL: ${defaultRepoUrl}`,
    '[INFO] Input your Personal Access Token (PAT) and click Fetch & Synchronize.'
  ]);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  // Helper to extract owner and repo name from URL or shorthand
  const parseRepoName = (input: string): string => {
    let clean = input.trim().replace(/\/$/, '');
    if (clean.includes('github.com/')) {
      const parts = clean.split('github.com/')[1].split('/');
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    }
    return clean;
  };

  const handleFetchAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const repoFullName = parseRepoName(repoUrl);
    if (!repoFullName) return;

    setIsSyncing(true);
    gitHubSyncEngine.setToken(pat.trim() || null);

    setSyncLogs(prev => [
      `[GITHUB] Connecting to repository: ${repoFullName} (branch: ${branch})...`,
      ...prev
    ]);

    try {
      // 1. If PAT is provided, verify credentials
      if (pat.trim()) {
        const verifyRes = await gitHubSyncEngine.verifyToken();
        if (verifyRes.valid && verifyRes.user) {
          setSyncLogs(prev => [
            `[AUTH SUCCESS] Authenticated as @${verifyRes.user?.login} (Scopes: ${verifyRes.user?.scopes})`,
            ...prev
          ]);
        } else {
          setSyncLogs(prev => [
            `[AUTH WARN] ${verifyRes.error || 'Token unverified, attempting public fetch'}`,
            ...prev
          ]);
        }
      }

      // 2. Fetch repository file structure
      const items = await gitHubSyncEngine.fetchContents(repoFullName, '', branch);
      setDiscoveredFiles(items);

      setSyncLogs(prev => [
        `[FETCH SUCCESS] Indexed ${items.length} structural design files & documentation nodes:`,
        `  -> ${items.map(i => i.name).slice(0, 5).join(', ')}${items.length > 5 ? '...' : ''}`,
        ...prev
      ]);

      if (items.length > 0) {
        setSelectedFile(items[0]);
        const preview = await gitHubSyncEngine.pullFileContent(repoFullName, items[0].path, branch);
        setFilePreview(preview.content);
      }

      // 3. Automatically pull & sync structural kernels & docs into the NEXUS Knowledge Graph
      let registered = 0;
      for (const item of items) {
        try {
          const { content, sha } = await gitHubSyncEngine.pullFileContent(repoFullName, item.path, branch);
          const report = await gitHubSyncEngine.syncFileToKnowledgeGraph(repoFullName, item.path, content, sha);
          registered++;
          setSyncLogs(prev => [
            `[SSOT INGEST] Ingested ${item.name} -> Knowledge ID [${report.registeredObject?.id}]`,
            ...prev
          ]);
        } catch (fileErr: any) {
          console.warn('File sync skip:', item.name, fileErr);
        }
      }

      setSyncedCount(registered);
      setSyncLogs(prev => [
        `[SYNC COMPLETE] ${registered} structural files synchronized into NEXUS Knowledge Graph!`,
        `[AUDIT SEAL] Zero-tolerance delta validation active for all ingested equations.`,
        ...prev
      ]);

      if (onKnowledgeUpdated) onKnowledgeUpdated();
    } catch (err: any) {
      setSyncLogs(prev => [`[ERROR] Synchronize failed: ${err.message}`, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectFilePreview = async (file: RemoteKnowledgeNode) => {
    setSelectedFile(file);
    const repoFullName = parseRepoName(repoUrl);
    try {
      const { content } = await gitHubSyncEngine.pullFileContent(repoFullName, file.path, branch);
      setFilePreview(content);
    } catch (e: any) {
      setFilePreview(`// Error pulling file content: ${e.message}`);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">GITHUB CONNECTOR // STRUCTURAL CODE & DOCS SYNC</h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Pull Python/JS calculation kernels and Eurocode documentation directly into NEXUS-4 SSOT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
            {syncedCount > 0 ? `${syncedCount} KERNELS SYNCED` : 'AWAITING SYNC'}
          </span>
        </div>
      </div>

      {/* Input Form for PAT & Repository URL */}
      <form onSubmit={handleFetchAndSync} className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* PAT Input */}
        <div className="md:col-span-6 space-y-1">
          <label className="text-[10px] text-slate-400 uppercase flex items-center gap-1 font-bold">
            <Key className="w-3 h-3 text-purple-400" />
            GitHub Personal Access Token (PAT)
          </label>
          <div className="relative">
            <input
              type={showPat ? 'text' : 'password'}
              value={pat}
              onChange={e => setPat(e.target.value)}
              placeholder="Paste token (ghp_... or fine-grained PAT)"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 pr-9 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPat(!showPat)}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              {showPat ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Repository URL Input */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[10px] text-slate-400 uppercase flex items-center gap-1 font-bold">
            <Link2 className="w-3 h-3 text-purple-400" />
            Repository URL
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            required
          />
        </div>

        {/* Branch Input & Sync Action */}
        <div className="md:col-span-2 space-y-1 flex flex-col justify-end">
          <button
            type="submit"
            disabled={isSyncing}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            FETCH & SYNC
          </button>
        </div>
      </form>

      {/* Quick Select Presets */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
        <span className="text-slate-500 text-[10px] uppercase">Quick Select:</span>
        <button
          type="button"
          onClick={() => setRepoUrl('https://github.com/julianzotter/NEXUS-AI-AEC-ENGINEERIN-KNOWLEDGE-GRAPH')}
          className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-0.5 rounded text-purple-300 transition"
        >
          julianzotter/NEXUS-AI-AEC-ENGINEERIN-KNOWLEDGE-GRAPH
        </button>
        <button
          type="button"
          onClick={() => setRepoUrl('https://github.com/julianzotter/CEN-TS-19103-TCC-Python-Kernel')}
          className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-0.5 rounded text-slate-300 transition"
        >
          julianzotter/CEN-TS-19103-TCC-Python-Kernel
        </button>
      </div>

      {/* Discovered Files & Code Preview Split View */}
      {discoveredFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-900">
          {/* File list (5 cols) */}
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Synchronized Remote Design Code</span>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {discoveredFiles.map(file => (
                <div
                  key={file.path}
                  onClick={() => handleSelectFilePreview(file)}
                  className={`p-2 rounded cursor-pointer transition flex items-center justify-between text-[11px] ${
                    selectedFile?.path === file.path
                      ? 'bg-purple-950/40 border border-purple-800 text-purple-200 font-bold'
                      : 'bg-slate-950 border border-transparent hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {file.name.endsWith('.py') ? (
                      <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : file.name.endsWith('.md') ? (
                      <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-1">
                    {file.sha.substring(0, 6)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Preview (7 cols) */}
          <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 truncate">{selectedFile?.name || 'Code Inspector'}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  INGESTED IN SSOT
                </span>
              </div>
              <pre className="mt-2 bg-slate-950 p-2.5 rounded text-[10px] text-slate-300 font-mono overflow-x-auto h-44 overflow-y-auto leading-relaxed">
                {filePreview || '// Select a file to view code snippet...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Sync Log */}
      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-400 font-mono">
        {syncLogs.map((log, i) => (
          <div key={i} className="leading-tight">
            <span className="text-slate-600">[{new Date().toISOString().substring(11, 19)}]</span> {log}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ConnectorsWorkspaceProps {
  params: HbvParameters;
  result: HbvCalculationResult;
  isGoogleAuthenticated: boolean;
  onAuthenticateGoogle: () => void;
  onKnowledgeUpdated?: () => void;
}

export const ConnectorsWorkspace: React.FC<ConnectorsWorkspaceProps> = ({
  params,
  result,
  isGoogleAuthenticated,
  onAuthenticateGoogle,
  onKnowledgeUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'GITHUB_CONNECTOR' | 'COLAB_INGESTION' | 'CAD_BIM' | 'GOOGLE_TASKS' | 'NAD_AT'>('GITHUB_CONNECTOR');

  // Google Tasks State
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([
    {
      id: 'local-1',
      title: 'SIO Abnahme: CEN/TS 19103 HBV-Decke Spannweite 6.2m',
      notes: `Verbundwirkungsgrad gamma2 = ${result.gamma2.toFixed(4)}. Biegung eta = ${(result.eta_M_timber * 100).toFixed(1)}%.`,
      status: 'needsAction',
      due: '2026-10-15T12:00:00.000Z'
    },
    {
      id: 'local-2',
      title: 'NAD-AT Schneelastannahme nach ÖNORM B 1991-1-3 (Zone 4)',
      notes: 'Schneelast sk für alpinen Standort 850m Seehöhe verifizieren.',
      status: 'completed',
      due: '2026-10-08T12:00:00.000Z'
    }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskStatusMsg, setTaskStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isGoogleAuthenticated) {
      loadRemoteTasks();
    }
  }, [isGoogleAuthenticated]);

  const loadRemoteTasks = async () => {
    try {
      const items = await listTasks();
      if (items && items.length > 0) {
        setTasks(items);
        setTaskStatusMsg('Synchronized with Google Tasks cloud');
      }
    } catch (e: any) {
      console.warn('Google Tasks load:', e.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskData = {
      title: newTaskTitle.trim(),
      notes: `Generated from NEXUS-4 Eurocode OS // Governing eta = ${(result.governingUtilization * 100).toFixed(1)}% (${result.status})`
    };

    if (isGoogleAuthenticated) {
      try {
        const created = await createGoogleTask('@default', taskData);
        setTasks(prev => [created, ...prev]);
        setTaskStatusMsg('Task created in Google Tasks!');
      } catch (err: any) {
        setTaskStatusMsg(`Google Tasks error: ${err.message}`);
      }
    } else {
      setTasks(prev => [{ ...taskData, status: 'needsAction', id: `local-${Date.now()}` }, ...prev]);
      setTaskStatusMsg('Task stored locally (Sign in to sync with Google Tasks)');
    }

    setNewTaskTitle('');
  };

  const handleToggleTask = async (task: GoogleTaskItem) => {
    if (task.status === 'completed') return;

    if (isGoogleAuthenticated && task.id && !task.id.startsWith('local-')) {
      try {
        await completeGoogleTask('@default', task.id);
        setTaskStatusMsg('Task marked completed in Google Tasks');
      } catch (e) {}
    }

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
  };

  // 1. Download DXF for BricsCAD / AutoCAD
  const handleDownloadDxf = () => {
    const dxfString = generateDxfCrossSection(params, result);
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS4_HBV_${params.spanL}m_BricsCAD.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Download OpenIFC (IFC4) for FreeCAD BIM & BricsCAD
  const handleDownloadIfc = () => {
    const ifcString = generateOpenIfc4Model(params, result);
    const blob = new Blob([ifcString], { type: 'application/x-step' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEXUS4_HBV_${params.spanL}m_FreeCAD.ifc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm">
                NEXUS-4 CONNECTORS & ECOSYSTEM HUB
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-bold">
                GITHUB • COLAB • BIM • GOOGLE
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              GitHub Connector • Colab Notebook Drive Ingest • DXF / OpenIFC • Google Tasks
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {!isGoogleAuthenticated && (
            <button
              onClick={onAuthenticateGoogle}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('GITHUB_CONNECTOR')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'GITHUB_CONNECTOR' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-3.5 h-3.5 text-purple-400" />
          GITHUB CONNECTOR
        </button>

        <button
          onClick={() => setActiveTab('COLAB_INGESTION')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'COLAB_INGESTION' ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          COLAB & DRIVE INGESTION (KB-001)
        </button>

        <button
          onClick={() => setActiveTab('CAD_BIM')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'CAD_BIM' ? 'border-sky-500 text-sky-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          CAD & BIM EXPORT (DXF / IFC4)
        </button>

        <button
          onClick={() => setActiveTab('GOOGLE_TASKS')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'GOOGLE_TASKS' ? 'border-sky-500 text-sky-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          GOOGLE TASKS REVIEW
        </button>

        <button
          onClick={() => setActiveTab('NAD_AT')}
          className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'NAD_AT' ? 'border-rose-500 text-rose-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-rose-400" />
          NAD-AT (AUSTRIA RULES)
        </button>
      </div>

      {/* TAB 1: GITHUB CONNECTOR */}
      {activeTab === 'GITHUB_CONNECTOR' && (
        <GitHubConnector onKnowledgeUpdated={onKnowledgeUpdated} />
      )}

      {/* TAB 2: COLAB & DRIVE INGESTION */}
      {activeTab === 'COLAB_INGESTION' && (
        <ColabDriveIngestionModule
          isGoogleAuthenticated={isGoogleAuthenticated}
          onAuthenticateGoogle={onAuthenticateGoogle}
          onKnowledgeUpdated={onKnowledgeUpdated}
        />
      )}

      {/* TAB 3: CAD & OPENIFC EXPORT */}
      {activeTab === 'CAD_BIM' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. DXF for BricsCAD */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  ASCII DXF // BRICSCAD & AUTOCAD
                </span>
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded font-bold">
                  2D CROSS-SECTION
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Generates layered 2D vector CAD drawing: timber girder ({params.b1}x{params.h1}mm), concrete topping ({params.beff}x{params.h2}mm), shear screws, and dimensional callouts.
              </p>
              <button
                onClick={handleDownloadDxf}
                className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD DXF (BRICSCAD READY)
              </button>
            </div>

            {/* 2. OpenIFC for FreeCAD BIM */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  OPENIFC (IFC4) // FREECAD BIM
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  3D SPATIAL MODEL
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Full IFC4 ISO 10303-21 STEP model with IfcBeam, IfcSlab, and attached Pset_NEXUS4_SIO_Validation structural verification properties.
              </p>
              <button
                onClick={handleDownloadIfc}
                className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD OPENIFC (FREECAD / BRICSCAD BIM)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GOOGLE TASKS */}
      {activeTab === 'GOOGLE_TASKS' && (
        <div className="space-y-3">
          {/* Add Task Form */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Add structural task / inspection checklist item..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD TASK
            </button>
          </form>

          {taskStatusMsg && (
            <div className="text-[10px] text-sky-400 bg-slate-950 p-2 rounded border border-slate-800">
              {taskStatusMsg}
            </div>
          )}

          {/* Task List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {tasks.map((task, idx) => (
              <div
                key={task.id || idx}
                onClick={() => handleToggleTask(task)}
                className={`p-2.5 rounded-lg border cursor-pointer transition flex items-start gap-2.5 ${
                  task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-900 text-slate-500 line-through'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  task.status === 'completed' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                }`}>
                  {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs">{task.title}</div>
                  {task.notes && <div className="text-[11px] text-slate-400 mt-0.5">{task.notes}</div>}
                  {task.due && <div className="text-[10px] text-slate-500 mt-1">Due: {task.due.substring(0, 10)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUSTRIAN NATIONAL ANNEX (NAD-AT) */}
      {activeTab === 'NAD_AT' && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇦🇹</span>
              <span className="font-bold text-slate-100">ÖNORM B 1995-1-1 & CEN/TS 19103 NAD-AT</span>
            </div>
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
              ACTIVE RULES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">ÖNORM B 1995-1-1 (Holzbau)</div>
              <p className="text-slate-400 text-[10px]">
                Teilsicherheitsbeiwert γM = 1.30 (Vollholz/BSH). Kriechbeiwert kdef = 0.60 für Nutzungsklasse 1.
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-sky-300">ÖNORM B 1992-1-1 (Betonbau)</div>
              <p className="text-slate-400 text-[10px]">
                Dauerstandsfaktor αcc = 0.85 für Druckzone. Rissbreitennachweis wk ≤ 0.3mm (Expositionsklasse XC3).
              </p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-300">CEN/TS 19103 NAD-AT (HBV)</div>
              <p className="text-slate-400 text-[10px]">
                Schraubverbindungsmittel nach ETA (z.B. Schmid Schrauben Hainfeld ASSY plus VG, TiComTec).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
