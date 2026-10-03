/**
 * NEXUS-4 GitHub Sync Module
 * Personal Access Token (PAT) authentication, repository browsing,
 * structural design code pulling (Python/TS), and documentation syncing
 * directly into the NEXUS-4 SSOT Knowledge Graph.
 */

import React, { useState, useEffect } from 'react';
import { 
  gitHubSyncEngine, 
  GitHubUserProfile, 
  GitHubRepositoryItem, 
  RemoteKnowledgeNode,
  SyncResultReport
} from '../../services/githubSync';
import { mcpBridge } from '../../services/mcpBridge';
import { 
  Github, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  FileCode, 
  BookOpen, 
  Layers, 
  Terminal, 
  Lock, 
  Unlock, 
  ExternalLink,
  Cpu,
  FolderGit2
} from 'lucide-react';

interface GitHubSyncModuleProps {
  onKnowledgeUpdated?: () => void;
  systemParameters?: any;
  systemResult?: any;
}

export const GitHubSyncModule: React.FC<GitHubSyncModuleProps> = ({
  onKnowledgeUpdated,
  systemParameters,
  systemResult
}) => {
  // PAT & User Auth State
  const [patInput, setPatInput] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [userProfile, setUserProfile] = useState<GitHubUserProfile | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Repositories & Active Selection
  const [repositories, setRepositories] = useState<GitHubRepositoryItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('julianzotter/NEXUS-AI-AEC-ENGINEERIN-KNOWLEDGE-GRAPH');
  const [branch, setBranch] = useState<string>('main');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  // Files in selected repo
  const [files, setFiles] = useState<RemoteKnowledgeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<RemoteKnowledgeNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileFilter, setFileFilter] = useState<'ALL' | 'PY' | 'MD' | 'JSON'>('ALL');

  // Ingestion & Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    '[INIT] GitHub Sync Engine ready.',
    '[READY] Target: julianzotter/NEXUS-AI-AEC-ENGINEERIN-KNOWLEDGE-GRAPH'
  ]);
  const [lastSyncReport, setLastSyncReport] = useState<SyncResultReport | null>(null);

  // On mount, load initial repos & file tree
  useEffect(() => {
    loadRepoList();
    loadFiles(selectedRepo, branch);
  }, []);

  const loadRepoList = async () => {
    setIsLoadingRepos(true);
    try {
      const list = await gitHubSyncEngine.fetchRepositories();
      setRepositories(list);
    } catch (e: any) {
      console.warn('Failed to load repo list:', e);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const loadFiles = async (repoName: string, refBranch: string) => {
    setIsLoadingFiles(true);
    try {
      const items = await gitHubSyncEngine.fetchContents(repoName, '', refBranch);
      setFiles(items);
      if (items.length > 0) {
        handleSelectFile(items[0], repoName, refBranch);
      }
    } catch (e: any) {
      console.warn('Failed to fetch files:', e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleVerifyPat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;

    setIsVerifying(true);
    setAuthError(null);
    gitHubSyncEngine.setToken(patInput.trim());

    const result = await gitHubSyncEngine.verifyToken();
    setIsVerifying(false);

    if (result.valid && result.user) {
      const user = result.user;
      setUserProfile(user);
      setSyncLogs(prev => [
        `[AUTH] PAT Verified for user @${user.login} (Scopes: ${user.scopes || 'repo'})`,
        ...prev
      ]);
      loadRepoList();
      loadFiles(selectedRepo, branch);
    } else {
      setAuthError(result.error || 'Token verification failed');
      gitHubSyncEngine.setToken(null);
    }
  };

  const handleDisconnectPat = () => {
    gitHubSyncEngine.setToken(null);
    setUserProfile(null);
    setPatInput('');
    setSyncLogs(prev => ['[AUTH] Personal Access Token disconnected.', ...prev]);
  };

  const handleSelectFile = async (node: RemoteKnowledgeNode, repoName = selectedRepo, refBranch = branch) => {
    setSelectedFile(node);
    try {
      const { content } = await gitHubSyncEngine.pullFileContent(repoName, node.path, refBranch);
      setFileContent(content);
    } catch (e: any) {
      setFileContent(`// Error reading file: ${e.message}`);
    }
  };

  // Ingest selected file directly into NEXUS-4 SSOT Knowledge Graph
  const handleIngestSingleFile = async () => {
    if (!selectedFile) return;
    setIsSyncing(true);

    try {
      const report = await gitHubSyncEngine.syncFileToKnowledgeGraph(
        selectedRepo,
        selectedFile.path,
        fileContent,
        selectedFile.sha
      );

      setLastSyncReport(report);
      setSyncLogs(prev => [
        `[INGEST] Pulled & Registered: ${selectedFile.name} -> SSOT ID: ${report.registeredObject?.id}`,
        `[SHA256] Commit: ${selectedFile.sha} | Authority: GitHub ${selectedRepo}`,
        ...prev
      ]);

      if (onKnowledgeUpdated) onKnowledgeUpdated();
    } catch (err: any) {
      setSyncLogs(prev => [`[ERROR] Ingestion failed: ${err.message}`, ...prev]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Batch sync: Pull all design kernels and documentation into SSOT graph
  const handleBatchSyncAll = async () => {
    setIsSyncing(true);
    setSyncLogs(prev => [`[BATCH-SYNC] Starting sync for all files in ${selectedRepo}...`, ...prev]);

    let successCount = 0;
    for (const file of files) {
      try {
        const { content, sha } = await gitHubSyncEngine.pullFileContent(selectedRepo, file.path, branch);
        await gitHubSyncEngine.syncFileToKnowledgeGraph(selectedRepo, file.path, content, sha);
        successCount++;
        setSyncLogs(prev => [`[INGEST] Registered ${file.name} to SSOT Knowledge Graph`, ...prev]);
      } catch (e) {
        console.warn('Sync file error:', file.name, e);
      }
    }

    setIsSyncing(false);
    setSyncLogs(prev => [
      `[BATCH-SYNC COMPLETE] Successfully ingested ${successCount} design files & documentation into NEXUS-4 SSOT!`,
      ...prev
    ]);

    if (onKnowledgeUpdated) onKnowledgeUpdated();
  };

  // Export local backup snapshot bundle
  const handleDownloadBackupSnapshot = async () => {
    const payload = {
      source: 'NEXUS-4 Eurocode OS',
      repository: selectedRepo,
      branch,
      exportedAt: new Date().toISOString(),
      user: userProfile?.login || 'anonymous',
      registeredCustomKnowledge: mcpBridge.getRegisteredKnowledge(),
      activeFiles: files.map(f => f.path),
      systemParameters,
      systemResult
    };

    const bundle = await gitHubSyncEngine.createBackupBundle(payload);
    const blob = new Blob([bundle.jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = bundle.fileName;
    a.click();
    URL.revokeObjectURL(url);

    setSyncLogs(prev => [`[BACKUP] Generated GitHub Backup Archive: ${bundle.fileName}`, ...prev]);
  };

  const filteredFiles = files.filter(f => {
    if (fileFilter === 'PY') return f.name.endsWith('.py');
    if (fileFilter === 'MD') return f.name.endsWith('.md');
    if (fileFilter === 'JSON') return f.name.endsWith('.json');
    return true;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 1. PAT Authentication Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-100">GITHUB PERSONAL ACCESS TOKEN (PAT) AUTHENTICATION</span>
          </div>

          {userProfile ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AUTHENTICATED AS @{userProfile.login}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              UNAUTHENTICATED (PUBLIC REPO MODE)
            </span>
          )}
        </div>

        {userProfile ? (
          /* Logged in User Bar */
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2.5">
              <img src={userProfile.avatar_url} alt="GitHub Avatar" className="w-7 h-7 rounded-full border border-slate-700" />
              <div>
                <div className="font-bold text-slate-200">{userProfile.name} (@{userProfile.login})</div>
                <div className="text-[10px] text-slate-400">Scopes: {userProfile.scopes} • Public Repos: {userProfile.public_repos}</div>
              </div>
            </div>

            <button
              onClick={handleDisconnectPat}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
            >
              Disconnect Token
            </button>
          </div>
        ) : (
          /* PAT Input Form */
          <form onSubmit={handleVerifyPat} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPat ? 'text' : 'password'}
                  value={patInput}
                  onChange={e => setPatInput(e.target.value)}
                  placeholder="Paste GitHub Personal Access Token (ghp_... or github_pat_...)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPat(!showPat)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !patInput.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-1.5"
              >
                {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                AUTHENTICATE PAT
              </button>
            </div>

            {authError && (
              <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500">
              Token is kept purely in-memory and used to pull private structural code & update your Eurocode Knowledge Graph.
            </div>
          </form>
        )}
      </div>

      {/* 2. Repository & Branch Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <FolderGit2 className="w-3 h-3 text-purple-400" />
            Target Structural Knowledge Repository
          </label>
          <div className="flex gap-2">
            <select
              value={selectedRepo}
              onChange={e => {
                setSelectedRepo(e.target.value);
                loadFiles(e.target.value, branch);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
            >
              {repositories.map(r => (
                <option key={r.id} value={r.full_name}>
                  {r.full_name} {r.private ? '(Private)' : ''}
                </option>
              ))}
              {!repositories.some(r => r.full_name === selectedRepo) && (
                <option value={selectedRepo}>{selectedRepo}</option>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 uppercase">Git Branch</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
            />
            <button
              onClick={() => loadFiles(selectedRepo, branch)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Refresh Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: File Browser on Left, Code Inspector & Ingest on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left Column: Repository Files (5 cols) */}
        <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-900">
            <span className="font-bold text-slate-200 text-[11px] uppercase">Remote Design Code & Docs</span>
            <div className="flex items-center gap-1 text-[10px]">
              {(['ALL', 'PY', 'MD', 'JSON'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFileFilter(f)}
                  className={`px-1.5 py-0.5 rounded ${fileFilter === f ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filteredFiles.map(file => (
              <div
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className={`p-2 rounded cursor-pointer transition flex items-center justify-between text-[11px] ${
                  selectedFile?.path === file.path
                    ? 'bg-purple-950/40 border border-purple-800/80 text-purple-200 font-bold'
                    : 'bg-slate-900/60 border border-transparent hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
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

          {/* Batch Sync Button */}
          <button
            onClick={handleBatchSyncAll}
            disabled={isSyncing}
            className="w-full py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            SYNC ENTIRE REPO INTO KNOWLEDGE GRAPH
          </button>
        </div>

        {/* Right Column: Code Preview & Ingest Panel (7 cols) */}
        <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-200 text-xs">
                  {selectedFile ? selectedFile.name : 'Select a file to inspect'}
                </span>
              </div>
              {selectedFile && (
                <span className="text-[10px] text-purple-400 font-mono">
                  SHA: {selectedFile.sha}
                </span>
              )}
            </div>

            {/* Code / Markdown Content Box */}
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 font-mono overflow-x-auto h-52 overflow-y-auto leading-relaxed">
              {fileContent || '// Select a file from the repository to view its structural code...'}
            </pre>
          </div>

          {/* Ingest Single File Button */}
          <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-500">
              Target: <b className="text-slate-300">NEXUS-4 SSOT Graph</b>
            </div>

            <button
              onClick={handleIngestSingleFile}
              disabled={isSyncing || !selectedFile}
              className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition text-xs shadow-md shadow-sky-600/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              INGEST FILE INTO KNOWLEDGE GRAPH
            </button>
          </div>
        </div>
      </div>

      {/* 4. Terminal Ingestion Log & Snapshot Backup */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-900 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200">GITHUB SYNC & SSOT INGESTION TERMINAL STREAM</span>
          </div>

          <button
            onClick={handleDownloadBackupSnapshot}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] flex items-center gap-1 transition"
          >
            <Download className="w-3 h-3 text-purple-400" />
            EXPORT REPO BACKUP BUNDLE (JSON)
          </button>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900 max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-400 font-mono">
          {syncLogs.map((log, idx) => (
            <div key={idx} className="leading-tight">
              <span className="text-slate-600">[{new Date().toISOString().substring(11, 19)}]</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
