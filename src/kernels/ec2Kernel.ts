/**
 * NEXUS-4 Deterministic Engineering Calculation Kernel
 * Eurocode 2: EN 1992-1-1 (Stahlbetonplatte Biegung und Querkraft)
 */

import { Ec2SlabParameters } from '../types/nexus';
import { syncShortHash } from './sha256';

export const EC2_SOLVER_VERSION = 'NEXUS4-EC2-EN1992-1-1-v2.0.0';

export interface Ec2CalculationResult {
  d: number; // mm
  q_Ed: number; // kN/m²
  M_Ed: number; // kNm/m
  V_Ed: number; // kN/m
  f_cd: number; // N/mm²
  f_yd: number; // N/mm²
  mu_Eds: number;
  z: number; // mm
  as_req: number; // mm²/m
  as_prov: number; // mm²/m
  eta_M: number;
  V_Rdc: number; // kN/m
  eta_V: number;
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

export function calculateEc2Slab(params: Ec2SlabParameters): Ec2CalculationResult {
  const b = 1000; // mm (per meter strip)
  const h = params.h;
  const d = h - params.coverC - (params.barDiameter / 2.0); // mm
  
  // Materials
  const f_cd = (0.85 * params.fck) / 1.5; // N/mm²
  const f_yd = params.fyk / 1.15; // 434.78 N/mm²
  
  // Loads (ULS per meter)
  const q_Ed = (1.35 * params.gk) + (1.50 * params.qk); // kN/m²
  const M_Ed_kNm = (q_Ed * params.spanL * params.spanL) / 8.0; // kNm/m
  const M_Ed_Nmm = M_Ed_kNm * 1e6;
  const V_Ed_kN = (q_Ed * params.spanL) / 2.0; // kN/m
  const V_Ed_N = V_Ed_kN * 1e3;
  
  // Dimensionless moment mu_Eds
  const mu_Eds = M_Ed_Nmm / (b * d * d * f_cd);
  
  // Lever arm z
  let z = d;
  if (mu_Eds <= 0.296) { // Balance limit
    const term = Math.max(0, 1.0 - (2.0 * mu_Eds));
    z = d * 0.5 * (1.0 + Math.sqrt(term));
  } else {
    z = d * 0.8; // Compressed zone limitation
  }
  
  // Required reinforcement as_req
  const as_req = M_Ed_Nmm / (z * f_yd); // mm²/m
  
  // Provided reinforcement as_prov
  const barArea = Math.PI * Math.pow(params.barDiameter / 2.0, 2);
  const barsPerMeter = 1000.0 / params.barSpacing;
  const as_prov = barsPerMeter * barArea; // mm²/m
  
  const eta_M = as_req / as_prov;
  
  // Shear capacity without shear reinforcement VRd,c (EC2 Cl. 6.2.2)
  const CRd_c = 0.18 / 1.5;
  const k = Math.min(2.0, 1.0 + Math.sqrt(200.0 / d));
  const rho_l = Math.min(0.02, as_prov / (b * d));
  const v_min = 0.035 * Math.pow(k, 1.5) * Math.sqrt(params.fck);
  const VRdc_calc = (CRd_c * k * Math.cbrt(100.0 * rho_l * params.fck)) * b * d; // N
  const VRdc_min = v_min * b * d; // N
  const V_Rdc_N = Math.max(VRdc_calc, VRdc_min);
  const V_Rdc_kN = V_Rdc_N / 1e3;
  
  const eta_V = V_Ed_kN / V_Rdc_kN;
  
  const governingUtilization = Math.max(eta_M, eta_V);
  const status = governingUtilization <= 1.0 ? 'COMPLIANT' : 'NON_COMPLIANT';
  
  const rawSum = M_Ed_kNm + as_req + as_prov + V_Rdc_kN;
  const calculationHash = `SHA256:0x${syncShortHash(rawSum.toFixed(8) + EC2_SOLVER_VERSION)}`;
  
  const equations = [
    {
      name: 'Bemessungsmoment MEd (EC2 Cl. 5.3)',
      formula: 'MEd = qEd · L² / 8',
      substituted: `MEd = ${q_Ed.toFixed(2)} kN/m² · (${params.spanL} m)² / 8`,
      result: `${M_Ed_kNm.toFixed(2)} kNm/m`
    },
    {
      name: 'Entdimensioniertes Moment μEds',
      formula: 'μEds = MEd / (b · d² · fcd)',
      substituted: `μEds = ${(M_Ed_Nmm).toFixed(0)} / (1000 · ${d.toFixed(1)}² · ${f_cd.toFixed(2)})`,
      result: `${mu_Eds.toFixed(4)}`
    },
    {
      name: 'Erforderliche Zugbewehrung as,req',
      formula: 'as,req = MEd / (z · fyd)',
      substituted: `as,req = ${(M_Ed_Nmm).toFixed(0)} / (${z.toFixed(1)} · ${f_yd.toFixed(1)})`,
      result: `${as_req.toFixed(1)} mm²/m (Vorh: ${as_prov.toFixed(1)} mm²/m, η = ${(eta_M * 100).toFixed(1)}%)`
    },
    {
      name: 'Querkrafttragfähigkeit VRd,c (EC2 Cl. 6.2.2)',
      formula: 'VRd,c = [CRd,c · k · (100 · ρl · fck)^(1/3)] · b · d ≥ vmin · b · d',
      substituted: `VRd,c = [${CRd_c.toFixed(3)} · ${k.toFixed(2)} · (100 · ${(rho_l*100).toFixed(2)}% · ${params.fck})^(1/3)] · 1000 · ${d.toFixed(1)}`,
      result: `${V_Rdc_kN.toFixed(2)} kN/m (Einwirkung VEd = ${V_Ed_kN.toFixed(2)} kN/m, η = ${(eta_V * 100).toFixed(1)}%)`
    }
  ];

  return {
    d,
    q_Ed,
    M_Ed: M_Ed_kNm,
    V_Ed: V_Ed_kN,
    f_cd,
    f_yd,
    mu_Eds,
    z,
    as_req,
    as_prov,
    eta_M,
    V_Rdc: V_Rdc_kN,
    eta_V,
    governingUtilization,
    status,
    calculationHash,
    solverVersion: EC2_SOLVER_VERSION,
    equations
  };
}
