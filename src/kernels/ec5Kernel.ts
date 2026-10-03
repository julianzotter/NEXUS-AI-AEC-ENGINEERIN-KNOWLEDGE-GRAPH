/**
 * NEXUS-4 Deterministic Engineering Calculation Kernel
 * Eurocode 5: EN 1995-1-1 (Holzbalken Biegung, Schub, Durchbiegung)
 */

import { Ec5BeamParameters } from '../types/nexus';
import { syncShortHash } from './sha256';

export const EC5_SOLVER_VERSION = 'NEXUS4-EC5-EN1995-1-1-v2.1.0';

export interface Ec5CalculationResult {
  M_Ed: number; // kNm
  V_Ed: number; // kN
  sigma_m_d: number; // N/mm²
  f_m_d: number; // N/mm²
  eta_M: number;
  tau_d: number; // N/mm²
  f_v_d: number; // N/mm²
  eta_V: number;
  w_inst: number; // mm
  w_fin: number; // mm
  w_limit: number; // mm (L/300)
  eta_w: number;
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

export function calculateEc5Beam(params: Ec5BeamParameters): Ec5CalculationResult {
  const L_mm = params.spanL * 1000;
  const b = params.b;
  const h = params.h;
  
  // Cross section properties
  const W = (b * h * h) / 6.0; // mm³
  const I = (b * Math.pow(h, 3)) / 12.0; // mm⁴
  const A = b * h; // mm²
  
  // Design strength values
  const f_m_d = (params.kmod * params.fmk) / params.gammaM;
  const f_v_d = (params.kmod * params.fvk) / params.gammaM;
  
  // Load design (ULS: 1.35 * gk + 1.50 * qk)
  const q_Ed = (1.35 * params.gk) + (1.50 * params.qk); // kN/m = N/mm
  const M_Ed_kNm = (q_Ed * params.spanL * params.spanL) / 8.0;
  const M_Ed_Nmm = M_Ed_kNm * 1e6;
  const V_Ed_kN = (q_Ed * params.spanL) / 2.0;
  const V_Ed_N = V_Ed_kN * 1e3;
  
  // 1. Bending verification (EN 1995-1-1 Cl. 6.1.6)
  const sigma_m_d = M_Ed_Nmm / W;
  const eta_M = sigma_m_d / f_m_d;
  
  // 2. Shear verification (EN 1995-1-1 Cl. 6.1.7)
  const k_cr = 0.67; // Crack factor for solid timber
  const b_eff = b * k_cr;
  const tau_d = 1.5 * (V_Ed_N / (b_eff * h));
  const eta_V = tau_d / f_v_d;
  
  // 3. Deflection verification (SLS, EN 1995-1-1 Cl. 7.2)
  const q_SLS = params.gk + params.qk; // N/mm
  const w_inst = (5.0 * q_SLS * Math.pow(L_mm, 4)) / (384.0 * params.E0mean * I);
  const w_fin = w_inst * (1.0 + params.kdef);
  const w_limit = L_mm / 300.0;
  const eta_w = w_fin / w_limit;
  
  const governingUtilization = Math.max(eta_M, eta_V, eta_w);
  const status = governingUtilization <= 1.0 ? 'COMPLIANT' : 'NON_COMPLIANT';
  
  const rawSum = M_Ed_kNm + V_Ed_kN + sigma_m_d + tau_d + w_fin;
  const calculationHash = `SHA256:0x${syncShortHash(rawSum.toFixed(8) + EC5_SOLVER_VERSION)}`;
  
  const equations = [
    {
      name: 'Biegebemessungsmoment MEd (EC5)',
      formula: 'MEd = qEd · L² / 8',
      substituted: `MEd = ${q_Ed.toFixed(2)} kN/m · (${params.spanL} m)² / 8`,
      result: `${M_Ed_kNm.toFixed(2)} kNm`
    },
    {
      name: 'Biegespannungsnachweis σm,d ≤ fm,d (EC5 Cl. 6.1.6)',
      formula: 'σm,d = MEd / W ≤ fm,d = kmod · fmk / γM',
      substituted: `${sigma_m_d.toFixed(2)} N/mm² ≤ ${(params.kmod * params.fmk / params.gammaM).toFixed(2)} N/mm²`,
      result: `η = ${(eta_M * 100).toFixed(1)}%`
    },
    {
      name: 'Schubspannungsnachweis τd ≤ fv,d mit kcr (EC5 Cl. 6.1.7)',
      formula: 'τd = 1.5 · VEd / (kcr · b · h) ≤ fv,d',
      substituted: `1.5 · ${(V_Ed_N).toFixed(0)} N / (${k_cr} · ${b} · ${h}) = ${tau_d.toFixed(2)} N/mm²  |  fv,d = ${f_v_d.toFixed(2)} N/mm²`,
      result: `η = ${(eta_V * 100).toFixed(1)}%`
    },
    {
      name: 'Enddurchbiegung wfin ≤ L / 300 (EC5 Cl. 7.2)',
      formula: 'wfin = winst · (1 + kdef) ≤ L / 300',
      substituted: `${w_inst.toFixed(2)} mm · (1 + ${params.kdef}) = ${w_fin.toFixed(2)} mm  |  Limit: ${w_limit.toFixed(2)} mm`,
      result: `η = ${(eta_w * 100).toFixed(1)}%`
    }
  ];

  return {
    M_Ed: M_Ed_kNm,
    V_Ed: V_Ed_kN,
    sigma_m_d,
    f_m_d,
    eta_M,
    tau_d,
    f_v_d,
    eta_V,
    w_inst,
    w_fin,
    w_limit,
    eta_w,
    governingUtilization,
    status,
    calculationHash,
    solverVersion: EC5_SOLVER_VERSION,
    equations
  };
}
