/**
 * NEXUS-4: Deterministic AI-AEC Structural Engineering Operating System
 * Core Domain Types & Governance Interfaces
 */

export type GovernanceRole = 'DAA' | 'ASO' | 'AEGS' | 'SIO';

export type AgentRole = 'AI_DATA_ANALYST' | 'TICKR_FINANCE' | 'TALK_RADIO_ANTIGRAVITY';

export type NodeCategory = 'GOVERNANCE' | 'AGENT' | 'KERNEL' | 'KNOWLEDGE' | 'INFRA';

export interface OrbitNode {
  id: string;
  name: string;
  shortName: string;
  layer: GovernanceRole | AgentRole | 'SYSTEM';
  category: NodeCategory;
  description: string;
  status: 'ACTIVE' | 'PROCESSING' | 'SUSPENDED' | 'VETOED';
  runsCount: number;
  driftLevel: number; // percentage, e.g. 0.35%
  position: [number, number, number]; // 3D coordinates in orbit
  color: string;
  mission: string;
  contracts: string[]; // Connected node IDs
  clauses: string[];
}

export type GateStatus = 'IDLE' | 'PROCESSING' | 'PASSED' | 'VETOED' | 'REFINING';

export interface GateStage {
  role: GovernanceRole;
  name: string;
  status: GateStatus;
  startedAt?: string;
  completedAt?: string;
  hash?: string;
  evidence: string[];
  metrics?: {
    accuracy?: number;
    confidence?: number;
    latencyMs?: number;
    robustness?: number;
  };
  notes?: string;
}

export interface VetoRecord {
  id: string;
  runId: string;
  role: GovernanceRole;
  reason: string;
  timestamp: string;
  delta?: number;
  threshold?: number;
  resolved: boolean;
  signature: string;
}

export interface RunEnvelope {
  id: string;
  intent: string;
  targetStandard: 'CEN/TS 19103' | 'EC5' | 'EC2' | 'SEC_BALANCE';
  inputDataRaw: string;
  dataFingerprintSha256: string;
  status: 'KANDIDAT' | 'SIO_VERIFIED' | 'VETOED' | 'RUNNING';
  createdAt: string;
  completedAt?: string;
  gateChain: {
    DAA: GateStage;
    ASO: GateStage;
    AEGS: GateStage;
    SIO: GateStage;
  };
  candidateResult?: any;
  verifiedResult?: any;
  deltaPercentage: number;
  tolerance: number; // 1e-9
  refinementCycles: number;
  sioSignature?: string;
  auditHash: string;
}

// CEN/TS 19103 HBV-Verbund Parameter
export interface HbvParameters {
  spanL: number; // m, e.g. 6.0
  beamSpacingB: number; // m, e.g. 0.8
  b1: number; // mm, timber beam width, e.g. 160
  h1: number; // mm, timber beam height, e.g. 280
  E1: number; // N/mm², timber E-Modul, e.g. 11000 (C24)
  fm_k: number; // N/mm², bending strength C24 = 24
  fv_k: number; // N/mm², shear strength C24 = 4.0
  beff: number; // mm, effective concrete slab width, e.g. 800
  h2: number; // mm, concrete slab thickness, e.g. 100
  Ecm: number; // N/mm², concrete E-Modul, e.g. 33000 (C30/37)
  fck: number; // N/mm², concrete compressive strength, e.g. 30
  phiCreep: number; // creep coefficient φ, e.g. 2.0
  kdef: number; // timber creep k_def, e.g. 0.6
  Kser: number; // N/mm, slip modulus per connector, e.g. 45000
  spacingS: number; // mm, connector spacing, e.g. 200
  gk: number; // kN/m², dead load including self weight, e.g. 2.5
  qk: number; // kN/m², live load, e.g. 3.0
  kmod: number; // e.g. 0.8
  gammaM_timber: number; // 1.3
  gammaM_concrete: number; // 1.5
  gammaG: number; // 1.35
  gammaQ: number; // 1.50
}

export interface HbvCalculationResult {
  gamma1: number;
  gamma2: number;
  a1: number; // mm
  a2: number; // mm
  EI_eff: number; // N*mm²
  q_Ed: number; // kN/m (design line load)
  M_Ed: number; // kNm
  V_Ed: number; // kN
  sigma_m_timber: number; // N/mm²
  f_m_d: number; // N/mm²
  eta_M_timber: number; // Ausnutzung Biegung Holz
  sigma_c_concrete: number; // N/mm²
  f_c_d: number; // N/mm²
  eta_c_concrete: number; // Ausnutzung Beton Druck
  w_inst: number; // mm
  w_net_fin: number; // mm
  w_limit: number; // mm (L / 300)
  eta_deflection: number; // Ausnutzung Durchbiegung
  governingUtilization: number;
  status: 'COMPLIANT' | 'NON_COMPLIANT';
  calculationHash: string;
  solverVersion: string;
  equations: {
    name: string;
    formula: string;
    substituted: string;
    result: string;
  }[];
}

// EC5 Timber Beam Parameter
export interface Ec5BeamParameters {
  spanL: number; // m
  b: number; // mm
  h: number; // mm
  woodClass: 'C24' | 'GL24h' | 'GL28c' | 'C30';
  fmk: number;
  fvk: number;
  E0mean: number;
  kmod: number;
  gammaM: number;
  gk: number; // kN/m line load
  qk: number; // kN/m line load
  kdef: number;
}

// EC2 Concrete Slab Parameter
export interface Ec2SlabParameters {
  spanL: number; // m
  h: number; // mm (thickness)
  concreteClass: 'C20/25' | 'C25/30' | 'C30/37' | 'C35/45';
  fck: number;
  coverC: number; // mm
  barDiameter: number; // mm
  barSpacing: number; // mm
  fyk: number; // 500 MPa
  gk: number; // kN/m²
  qk: number; // kN/m²
}

// Financial Research
export interface BalanceSheetData {
  company: string;
  ticker: string;
  filingDate: string;
  formType: '10-K' | '10-Q';
  period: string;
  assets: number;
  liabilities: number;
  equity: number;
  discrepancy: number; // assets - (liabilities + equity)
  verifiedIdentity: boolean;
  citations: string[];
}

export type DossierTab = 'OVERVIEW' | 'WORKSPACE' | 'RELATIONS' | 'AUDIT' | 'MISSION';
