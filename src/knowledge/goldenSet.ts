/**
 * NEXUS-4 Benchmark Collection & Golden Slices
 * Used by ASO / SIO Eval-Harness for deterministic validation
 */

import { HbvParameters, Ec5BeamParameters, Ec2SlabParameters, BalanceSheetData } from '../types/nexus';

export const GOLDEN_HBV_PARAMETERS: HbvParameters = {
  spanL: 6.2, // 6.2 m span
  beamSpacingB: 0.8, // 0.8 m spacing
  b1: 160, // 160 mm width
  h1: 280, // 280 mm height
  E1: 11000, // C24 E-Modul (N/mm²)
  fm_k: 24.0, // C24 bending (N/mm²)
  fv_k: 4.0, // C24 shear (N/mm²)
  beff: 800, // 800 mm effective concrete flange
  h2: 90, // 90 mm slab thickness
  Ecm: 33000, // C30/37 E-Modul
  fck: 30.0, // C30/37 compressive strength
  phiCreep: 2.2, // concrete creep factor
  kdef: 0.6, // timber creep factor
  Kser: 50000, // 50 kN/mm connector slip stiffness
  spacingS: 180, // 180 mm connector pitch
  gk: 2.4, // kN/m² permanent load
  qk: 3.0, // kN/m² variable office load (Cat B)
  kmod: 0.8, // Medium term load duration
  gammaM_timber: 1.3,
  gammaM_concrete: 1.5,
  gammaG: 1.35,
  gammaQ: 1.50
};

export const GOLDEN_HBV_CSV = `span_m,beam_spacing_m,timber_b_mm,timber_h_mm,timber_E_mpa,timber_fmk_mpa,timber_fvk_mpa,concrete_beff_mm,concrete_h_mm,concrete_Ecm_mpa,concrete_fck_mpa,creep_phi,timber_kdef,connector_Kser_n_mm,connector_pitch_s_mm,load_gk_kn_m2,load_qk_kn_m2
6.2,0.8,160,280,11000,24.0,4.0,800,90,33000,30.0,2.2,0.6,50000,180,2.4,3.0`;

export const GOLDEN_EC5_BEAM: Ec5BeamParameters = {
  spanL: 5.5,
  b: 140,
  h: 260,
  woodClass: 'C24',
  fmk: 24,
  fvk: 4.0,
  E0mean: 11000,
  kmod: 0.8,
  gammaM: 1.3,
  gk: 2.2,
  qk: 2.5,
  kdef: 0.6
};

export const GOLDEN_EC2_SLAB: Ec2SlabParameters = {
  spanL: 4.8,
  h: 180,
  concreteClass: 'C25/30',
  fck: 25,
  coverC: 30,
  barDiameter: 12,
  barSpacing: 150, // Ø12 / 150 mm = 754 mm²/m
  fyk: 500,
  gk: 5.5,
  qk: 3.0
};

export const GOLDEN_FINANCIAL_SHEETS: BalanceSheetData[] = [
  {
    company: 'Apple Inc.',
    ticker: 'AAPL',
    filingDate: '2024-11-01',
    formType: '10-K',
    period: 'FY 2024',
    assets: 364980000000,
    liabilities: 308030000000,
    equity: 56950000000,
    discrepancy: 0,
    verifiedIdentity: true,
    citations: [
      'SEC EDGAR CIK 0000320193',
      'Consolidated Balance Sheets p. 48',
      'FASB ASC 210 Balance Sheet Master Identity'
    ]
  },
  {
    company: 'Microsoft Corp.',
    ticker: 'MSFT',
    filingDate: '2024-07-30',
    formType: '10-K',
    period: 'FY 2024',
    assets: 512163000000,
    liabilities: 243686000000,
    equity: 268477000000,
    discrepancy: 0,
    verifiedIdentity: true,
    citations: [
      'SEC EDGAR CIK 0000789019',
      'Item 8 Financial Statements p. 64',
      'Deterministic Ledger Reconciliation Kernel'
    ]
  },
  {
    company: 'Anomalous Corp (Simulated Fraud / Drift)',
    ticker: 'ANOM-DRIFT',
    filingDate: '2025-01-15',
    formType: '10-Q',
    period: 'Q3 2024',
    assets: 100000000,
    liabilities: 70000000,
    equity: 25000000, // Discrepancy of 5,000,000!
    discrepancy: 5000000,
    verifiedIdentity: false,
    citations: [
      'SEC Test Feed Anomalies',
      'SIO Veto Trigger Test Set'
    ]
  }
];
