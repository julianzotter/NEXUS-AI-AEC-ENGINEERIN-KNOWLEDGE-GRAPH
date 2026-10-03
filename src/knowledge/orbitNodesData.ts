/**
 * NEXUS-4 12 Orbit Nodes Definition
 * Geometries, Mission Statements, Relations & Contracts for the 3D-Orbit Control Plane
 */

import { OrbitNode } from '../types/nexus';

export const INITIAL_ORBIT_NODES: OrbitNode[] = [
  // 1. DAA (Data Advantage Architect)
  {
    id: 'node-daa',
    name: 'DAA // Data Advantage Architect',
    shortName: 'DAA',
    layer: 'DAA',
    category: 'GOVERNANCE',
    description: 'Guarantees raw data quality, SHA-256 fingerprinting, ETL pipeline integrity, and source provenance recording.',
    status: 'ACTIVE',
    runsCount: 42,
    driftLevel: 0.12,
    position: [-5.5, 0, 3.2],
    color: '#38bdf8', // Sky Blue
    mission: 'Ensure zero data pollution. Compute cryptographic SHA-256 digests on all incoming engineering files before pipeline handoff.',
    contracts: ['node-aso', 'node-agent-data', 'node-mcp-bridge'],
    clauses: ['ISO 8000 Data Quality', 'W3C PROV-DM Provenance Standard']
  },

  // 2. ASO (AI Systems Orchestrator)
  {
    id: 'node-aso',
    name: 'ASO // AI Systems Orchestrator',
    shortName: 'ASO',
    layer: 'ASO',
    category: 'GOVERNANCE',
    description: 'Orchestrates Gemini models, prompt controllers, CoT reasoning, and Managed Agent workflows. Produces Candidate results.',
    status: 'ACTIVE',
    runsCount: 39,
    driftLevel: 0.45,
    position: [-2.2, 0, -5.8],
    color: '#818cf8', // Indigo
    mission: 'Route intents to appropriate models and kernels. Label all outputs strictly as "KANDIDAT" until formal SIO approval.',
    contracts: ['node-aegs', 'node-agent-tickr', 'node-agent-radio', 'node-ssot'],
    clauses: ['PrompTLooP Specification v3.2', 'CoT Grounding Matrix']
  },

  // 3. AEGS (AI Ethics & Governance Strategist)
  {
    id: 'node-aegs',
    name: 'AEGS // AI Ethics & Governance',
    shortName: 'AEGS',
    layer: 'AEGS',
    category: 'GOVERNANCE',
    description: 'Enforces EU AI Act compliance (High-Risk Classification Annex III), transparency watermarking, and continuous drift monitoring.',
    status: 'ACTIVE',
    runsCount: 38,
    driftLevel: 0.88,
    position: [2.5, 0, -5.5],
    color: '#f59e0b', // Amber
    mission: 'Safeguard compliance with EU AI Act High-Risk standards. Trigger automatic SIO suspension if model drift exceeds 2.0%.',
    contracts: ['node-sio', 'node-aso'],
    clauses: ['EU AI Act Regulation (EU) 2024/1689 Annex III', 'IEEE 7000 Ethics Guideline']
  },

  // 4. SIO (Structural Integrity Orchestrator)
  {
    id: 'node-sio',
    name: 'SIO // Structural Integrity Orchestrator',
    shortName: 'SIO',
    layer: 'SIO',
    category: 'GOVERNANCE',
    description: 'Sovereign authority of NEXUS-4. Executes deterministic Eurocode verification and holds unchallengeable, irrevocable VETO power.',
    status: 'ACTIVE',
    runsCount: 36,
    driftLevel: 0.00,
    position: [5.8, 0, 2.5],
    color: '#ef4444', // Red Authority
    mission: 'Zero tolerance for arithmetic hallucination. Candidate results become certified only upon deterministic closed-form proof (Δ < 1e-9).',
    contracts: ['node-kernel-hbv', 'node-kernel-ec5', 'node-kernel-ec2', 'node-daa'],
    clauses: ['DIN EN 1990 Basis of Structural Design', 'CEN/TS 19103 Cl. 7', 'EN 1995-1-1 Cl. 6']
  },

  // 5. AI Data Analyst Agent
  {
    id: 'node-agent-data',
    name: 'Agent // AI Data Analyst',
    shortName: 'DATA-ANALYST',
    layer: 'AI_DATA_ANALYST',
    category: 'AGENT',
    description: 'Performs CSV/XLSX/IFC schema inference, statistical kernel computations (mean, median, sd), and Chart.js visualizations.',
    status: 'ACTIVE',
    runsCount: 28,
    driftLevel: 0.22,
    position: [-9.8, 1.2, 5.5],
    color: '#06b6d4', // Cyan
    mission: 'Ingest raw structural sensor streams and load schedules. Flag statistical anomalies before gate processing.',
    contracts: ['node-daa', 'node-mcp-bridge'],
    clauses: ['NIST Engineering Statistics Handbook', 'IQR Outlier Detection']
  },

  // 6. Financial Research Agent TICKR
  {
    id: 'node-agent-tickr',
    name: 'Agent // TICKR Financial Research',
    shortName: 'TICKR',
    layer: 'TICKR_FINANCE',
    category: 'AGENT',
    description: 'SEC EDGAR 10-K/10-Q balance sheet ingestion. Solves deterministic ledger identity Assets = Liabilities + Equity (Δ < 1e-9).',
    status: 'ACTIVE',
    runsCount: 19,
    driftLevel: 0.00,
    position: [-6.8, -1.5, -9.2],
    color: '#10b981', // Emerald
    mission: 'Verify financial viability of AEC mega-projects and joint ventures via deterministic SEC balance reconciliation. No investment advice.',
    contracts: ['node-aso', 'node-daa'],
    clauses: ['FASB ASC 210 Balance Sheet', 'SEC EDGAR XBRL Taxonomies']
  },

  // 7. AI Talk Radio Antigravity Agent
  {
    id: 'node-agent-radio',
    name: 'Agent // AI Talk Radio Antigravity',
    shortName: 'TALK-RADIO',
    layer: 'TALK_RADIO_ANTIGRAVITY',
    category: 'AGENT',
    description: 'Dual-Host audio discourse (Dr. Vance & Elena Rostova) with Web Audio Lyria-Soundbed in D-minor and synchronized Nanobanana slides.',
    status: 'ACTIVE',
    runsCount: 14,
    driftLevel: 0.30,
    position: [7.5, 1.8, -8.6],
    color: '#ec4899', // Pink
    mission: 'Synthesize complex AEC structural trade-offs into engaging, audible debate with real-time waveform visualization and technical slides.',
    contracts: ['node-aso'],
    clauses: ['AEC Debate Protocol v1.4', 'Web Audio Synth Standard']
  },

  // 8. HBV Gamma Solver Kernel (CEN/TS 19103)
  {
    id: 'node-kernel-hbv',
    name: 'Kernel // CEN/TS 19103 HBV γ-Solver',
    shortName: 'HBV-KERNEL',
    layer: 'SYSTEM',
    category: 'KERNEL',
    description: 'Deterministic solver for timber-concrete composite floors: γ-method, slip modulus Ku, (EI)eff, and long-term w_net,fin.',
    status: 'ACTIVE',
    runsCount: 52,
    driftLevel: 0.00,
    position: [14.2, 0, 7.5],
    color: '#22c55e', // Green
    mission: 'Calculate closed-form γ-values for semi-rigid connectors with mathematical exactness.',
    contracts: ['node-sio', 'node-ssot'],
    clauses: ['CEN/TS 19103:2021 § 7.1', 'CEN/TS 19103:2021 § 7.2']
  },

  // 9. EC5 Timber Beam Kernel
  {
    id: 'node-kernel-ec5',
    name: 'Kernel // EC5 Solid Timber Girder',
    shortName: 'EC5-KERNEL',
    layer: 'SYSTEM',
    category: 'KERNEL',
    description: 'Pure deterministic calculations for solid timber and glulam: Bending Cl. 6.1.6, Shear Cl. 6.1.7 (kcr = 0.67), and Deflection Cl. 7.2.',
    status: 'ACTIVE',
    runsCount: 31,
    driftLevel: 0.00,
    position: [10.5, 0, 12.5],
    color: '#16a34a',
    mission: 'Determine ULS and SLS compliance for timber members without approximation.',
    contracts: ['node-sio', 'node-ssot'],
    clauses: ['EN 1995-1-1:2004+A2:2014']
  },

  // 10. EC2 Concrete Slab Kernel
  {
    id: 'node-kernel-ec2',
    name: 'Kernel // EC2 Reinforced Concrete Slab',
    shortName: 'EC2-KERNEL',
    layer: 'SYSTEM',
    category: 'KERNEL',
    description: 'Deterministic reinforced concrete slab dimensioning: Flexure, dimensionless moment μEds, required steel as,req, and shear VRd,c.',
    status: 'ACTIVE',
    runsCount: 26,
    driftLevel: 0.00,
    position: [5.2, 0, 15.2],
    color: '#059669',
    mission: 'Verify concrete compressive zone and steel tensile strain deterministically.',
    contracts: ['node-sio', 'node-ssot'],
    clauses: ['EN 1992-1-1:2004 § 6.1', 'EN 1992-1-1:2004 § 6.2.2']
  },

  // 11. SSOT Knowledge Graph
  {
    id: 'node-ssot',
    name: 'SSOT // Knowledge Graph & Norms',
    shortName: 'SSOT-GRAPH',
    layer: 'SYSTEM',
    category: 'KNOWLEDGE',
    description: 'Single Source of Truth: Canonical graph linking Eurocode standards, clauses, formulas, material properties, and temporal validity.',
    status: 'ACTIVE',
    runsCount: 64,
    driftLevel: 0.00,
    position: [-13.5, 2.0, -9.5],
    color: '#a855f7', // Purple
    mission: 'Provide immutable reference bindings for all engineering formulas and cross-verify active validity periods.',
    contracts: ['node-aso', 'node-sio', 'node-kernel-hbv'],
    clauses: ['CEN Official Directive TC 250', 'DIN EN Guidelines']
  },

  // 12. Local MCP Bridge & Tool Router
  {
    id: 'node-mcp-bridge',
    name: 'MCP // Local Tool Bridge & Router',
    shortName: 'MCP-BRIDGE',
    layer: 'SYSTEM',
    category: 'INFRA',
    description: 'Self-hosted local MCP router exposing 10 access tools for engineering calculations, knowledge retrieval, and data ingestion.',
    status: 'ACTIVE',
    runsCount: 88,
    driftLevel: 0.00,
    position: [0, -2.5, 16.0],
    color: '#eab308', // Yellow
    mission: 'Route function calls between LLM agents and deterministic local compute kernels with sub-millisecond overhead.',
    contracts: ['node-daa', 'node-agent-data', 'node-kernel-hbv'],
    clauses: ['Model Context Protocol v1.0', 'FastMCP RPC Spec']
  }
];
