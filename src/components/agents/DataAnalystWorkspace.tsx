/**
 * NEXUS-4 Managed Agent: AI Data Analyst
 * CSV/XLSX/IFC Ingest with Schema Detection, Statistics Kernel & Chart.js Visualizations
 */

import React, { useState, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { computeSha256 } from '../../kernels/sha256';
import { GOLDEN_HBV_CSV } from '../../knowledge/goldenSet';
import { 
  FileSpreadsheet, 
  BarChart3, 
  LineChart as LineChartIcon, 
  ScatterChart, 
  AlertTriangle, 
  Upload, 
  CheckCircle2, 
  Cpu, 
  Fingerprint,
  RefreshCw
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

interface DataAnalystWorkspaceProps {
  onHandoffToDaa: (csvText: string, sha256: string, schema: any) => void;
}

export const DataAnalystWorkspace: React.FC<DataAnalystWorkspaceProps> = ({
  onHandoffToDaa
}) => {
  const [csvContent, setCsvContent] = useState<string>(GOLDEN_HBV_CSV);
  const [chartType, setChartType] = useState<'LINE' | 'BAR' | 'SCATTER'>('BAR');
  const [selectedColumn, setSelectedColumn] = useState<string>('load_gk_kn_m2');
  const [fingerprint, setFingerprint] = useState<string>('');
  const [zThreshold, setZThreshold] = useState<number>(2.0);

  // Ingestion & Parsing
  const parsedData = useMemo(() => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(l => {
      const parts = l.split(',').map(p => p.trim());
      const obj: Record<string, number | string> = {};
      headers.forEach((h, idx) => {
        const num = parseFloat(parts[idx]);
        obj[h] = isNaN(num) ? parts[idx] : num;
      });
      return obj;
    });

    return { headers, rows };
  }, [csvContent]);

  // Statistical Kernel (n, mean, median, sd, min, max)
  const stats = useMemo(() => {
    if (!parsedData || !selectedColumn) return null;
    const values = parsedData.rows
      .map(r => r[selectedColumn])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) return null;

    const n = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
      : sorted[Math.floor(n / 2)];

    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const sd = Math.sqrt(variance);

    // Anomaly detection: Z-Score > threshold
    const anomalies = values
      .map((val, idx) => ({ val, idx, z: sd > 0 ? Math.abs((val - mean) / sd) : 0 }))
      .filter(item => item.z > zThreshold);

    return { n, mean, median, sd, min, max, anomalies };
  }, [parsedData, selectedColumn, zThreshold]);

  // Fingerprint calculation
  const handleCalculateFingerprint = async () => {
    const hash = await computeSha256(csvContent);
    setFingerprint(hash);
  };

  const handleSendToDaa = async () => {
    const hash = await computeSha256(csvContent);
    setFingerprint(hash);
    onHandoffToDaa(csvContent, hash, parsedData?.headers);
  };

  // Chart configuration
  const chartData = useMemo(() => {
    if (!parsedData) return { labels: [], datasets: [] };

    const labels = parsedData.rows.map((_, i) => `Sample #${i + 1}`);
    const dataPoints = parsedData.rows.map(r => typeof r[selectedColumn] === 'number' ? (r[selectedColumn] as number) : 0);

    return {
      labels,
      datasets: [
        {
          label: selectedColumn,
          data: dataPoints,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.45)',
          pointBackgroundColor: '#38bdf8',
          pointRadius: 5
        }
      ]
    };
  }, [parsedData, selectedColumn]);

  const scatterChartData = useMemo(() => {
    if (!parsedData) return { datasets: [] };
    const points = parsedData.rows.map((r, i) => ({
      x: i + 1,
      y: typeof r[selectedColumn] === 'number' ? (r[selectedColumn] as number) : 0
    }));

    return {
      datasets: [
        {
          label: `${selectedColumn} distribution`,
          data: points,
          backgroundColor: '#38bdf8',
          pointRadius: 6
        }
      ]
    };
  }, [parsedData, selectedColumn]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-slate-100 text-sm">
                MANAGED AGENT 1: AI DATA ANALYST
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800 text-sky-300">
                CSV/IFC INGEST & STATS KERNEL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated Schema Inference, Statistical Moments & Chart.js Visualizations
            </p>
          </div>
        </div>

        <button
          onClick={handleSendToDaa}
          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-600/20"
        >
          <Cpu className="w-3.5 h-3.5" />
          FINGERPRINT & HANDOFF TO DAA
        </button>
      </div>

      {/* CSV Ingest Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            Raw Structural Specification CSV
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCsvContent(GOLDEN_HBV_CSV)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Load Golden HBV Dataset
            </button>
          </div>
        </div>

        <textarea
          value={csvContent}
          onChange={e => setCsvContent(e.target.value)}
          className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
          placeholder="Paste CSV with headers..."
        />
      </div>

      {/* Statistical Moments Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Count (n)</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{stats.n}</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Mean (μ)</div>
            <div className="text-sm font-bold text-sky-400 mt-0.5">{stats.mean.toFixed(2)}</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Median (x̃)</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{stats.median.toFixed(2)}</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Std. Dev (σ)</div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{stats.sd.toFixed(2)}</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Min / Max</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{stats.min.toFixed(1)} / {stats.max.toFixed(1)}</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase">Anomalies (z &gt; {zThreshold})</div>
            <div className={`text-sm font-bold mt-0.5 ${stats.anomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stats.anomalies.length} detected
            </div>
          </div>
        </div>
      )}

      {/* Chart.js Controls & Display */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Feature:</span>
            <select
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200"
            >
              {parsedData?.headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setChartType('BAR')}
              className={`p-1.5 rounded transition ${chartType === 'BAR' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('LINE')}
              className={`p-1.5 rounded transition ${chartType === 'LINE' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Line Chart"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('SCATTER')}
              className={`p-1.5 rounded transition ${chartType === 'SCATTER' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Scatter Chart"
            >
              <ScatterChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visual Chart Canvas */}
        <div className="h-48 bg-slate-950/80 border border-slate-800 rounded-lg p-3">
          {chartType === 'BAR' && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
              }}
            />
          )}
          {chartType === 'LINE' && (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
              }}
            />
          )}
          {chartType === 'SCATTER' && (
            <Scatter
              data={scatterChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
