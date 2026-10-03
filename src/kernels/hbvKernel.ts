/**
 * NEXUS-4 Deterministic Engineering Calculation Kernel
 * CEN/TS 19103 & EC5 Annex B: Holz-Beton-Verbund (HBV) γ-Verfahren
 * 
 * STRICT DETERMINISM GUARANTEE:
 * - Analytical closed-form equations only.
 * - Zero stochastic or heuristic steps.
 * - Deterministic output hash generated from raw calculation values.
 */

import { HbvParameters, HbvCalculationResult } from '../types/nexus';
import { syncShortHash } from './sha256';

export const SOLVER_VERSION = 'NEXUS4-HBV-CENTS19103-v2.4.0';

export function calculateHbvGamma(params: HbvParameters): HbvCalculationResult {
  const L_mm = params.spanL * 1000;
  const b1 = params.b1;
  const h1 = params.h1;
  const E1 = params.E1;
  const beff = params.beff;
  const h2 = params.h2;
  const Ecm = params.Ecm;
  const phi = params.phiCreep;
  const Kser = params.Kser;
  const s = params.spacingS;
  
  // 1. Cross-sectional geometry
  const A1 = b1 * h1; // mm²
  const I1 = (b1 * Math.pow(h1, 3)) / 12; // mm⁴
  
  const A2 = beff * h2; // mm²
  const I2 = (beff * Math.pow(h2, 3)) / 12; // mm⁴
  
  // Effective concrete E-Modulus considering creep for long-term state
  const E2_eff = Ecm / (1 + phi);
  
  // 2. Slip factor γ according to CEN/TS 19103 / EC5 Annex B
  // For ULS, Ku = 2/3 * Kser
  const Ku = (2 / 3) * Kser;
  const gamma1 = 1.0; // Reference timber layer
  
  // gamma2 = [1 + (pi^2 * E2 * A2 * s) / (Ku * L^2)]^-1
  const denomPart = (Math.PI * Math.PI * E2_eff * A2 * s) / (Ku * L_mm * L_mm);
  const gamma2 = 1.0 / (1.0 + denomPart);
  
  // 3. Neutral axis position
  // Distance from timber centroid to concrete centroid
  const d_centroids = (h1 + h2) / 2.0;
  
  // a2 = (gamma1 * E1 * A1 * d_centroids) / (gamma1 * E1 * A1 + gamma2 * E2_eff * A2)
  const numerator_a2 = gamma1 * E1 * A1 * d_centroids;
  const denominator_stiffness = gamma1 * E1 * A1 + gamma2 * E2_eff * A2;
  const a2 = numerator_a2 / denominator_stiffness;
  const a1 = d_centroids - a2;
  
  // 4. Effective bending stiffness (EI)_eff
  const EI_eff = (E1 * I1) + (E2_eff * I2) + (gamma1 * E1 * A1 * a1 * a1) + (gamma2 * E2_eff * A2 * a2 * a2);
  
  // 5. Load combinations (ULS & SLS)
  const beamSpacingM = params.beamSpacingB;
  const q_gk = params.gk * beamSpacingM; // kN/m
  const q_qk = params.qk * beamSpacingM; // kN/m
  const q_Ed_kNm = (params.gammaG * q_gk) + (params.gammaQ * q_qk); // kN/m
  const q_Ed_Nmm = q_Ed_kNm; // 1 kN/m = 1 N/mm
  
  const M_Ed_kNm = (q_Ed_kNm * params.spanL * params.spanL) / 8.0; // kNm
  const M_Ed_Nmm = M_Ed_kNm * 1e6; // N*mm
  const V_Ed_kN = (q_Ed_kNm * params.spanL) / 2.0; // kN
  
  // 6. Stresses in timber (bottom edge tension) and concrete (top edge compression)
  // sigma_m_timber = (M_Ed / EI_eff) * (gamma1 * E1 * a1 + 0.5 * E1 * h1)
  const sigma_m_timber = (M_Ed_Nmm / EI_eff) * ((gamma1 * E1 * a1) + (0.5 * E1 * h1));
  
  // sigma_c_concrete = (M_Ed / EI_eff) * (gamma2 * E2_eff * a2 + 0.5 * E2_eff * h2)
  const sigma_c_concrete = (M_Ed_Nmm / EI_eff) * ((gamma2 * E2_eff * a2) + (0.5 * E2_eff * h2));
  
  // Design resistances
  const f_m_d = (params.kmod * params.fm_k) / params.gammaM_timber;
  const f_c_d = (0.85 * params.fck) / params.gammaM_concrete;
  
  const eta_M_timber = sigma_m_timber / f_m_d;
  const eta_c_concrete = sigma_c_concrete / f_c_d;
  
  // 7. Deflection (SLS)
  const q_SLS_kNm = q_gk + q_qk; // kN/m
  const q_SLS_Nmm = q_SLS_kNm;
  
  // Short-term stiffness for instantaneous deflection
  const gamma2_ser = 1.0 / (1.0 + ((Math.PI * Math.PI * Ecm * A2 * s) / (Kser * L_mm * L_mm)));
  const a2_ser = (gamma1 * E1 * A1 * d_centroids) / (gamma1 * E1 * A1 + gamma2_ser * Ecm * A2);
  const a1_ser = d_centroids - a2_ser;
  const EI_eff_ser = (E1 * I1) + (Ecm * I2) + (gamma1 * E1 * A1 * a1_ser * a1_ser) + (gamma2_ser * Ecm * A2 * a2_ser * a2_ser);
  
  const w_inst = (5.0 * q_SLS_Nmm * Math.pow(L_mm, 4)) / (384.0 * EI_eff_ser);
  const w_net_fin = w_inst * (1.0 + params.kdef);
  const w_limit = L_mm / 300.0;
  const eta_deflection = w_net_fin / w_limit;
  
  const governingUtilization = Math.max(eta_M_timber, eta_c_concrete, eta_deflection);
  const status = governingUtilization <= 1.0 ? 'COMPLIANT' : 'NON_COMPLIANT';
  
  const rawSum = gamma1 + gamma2 + a1 + a2 + EI_eff + M_Ed_kNm + sigma_m_timber + sigma_c_concrete + w_net_fin;
  const calculationHash = `SHA256:0x${syncShortHash(rawSum.toFixed(8) + SOLVER_VERSION)}`;

  const equations = [
    {
      name: 'Verbundbeiwert γ₂ (CEN/TS 19103, Gl. 7.1)',
      formula: 'γ₂ = [1 + (π² · E₂,eff · A₂ · s) / (Kᵤ · L²)]⁻¹',
      substituted: `γ₂ = [1 + (π² · ${E2_eff.toFixed(0)} · ${A2} · ${s}) / (${Ku.toFixed(0)} · ${L_mm}²)]⁻¹`,
      result: `${gamma2.toFixed(4)}`
    },
    {
      name: 'Schwerpunktabstand a₂ (Beton Centroid)',
      formula: 'a₂ = (γ₁ · E₁ · A₁ · d) / (γ₁ · E₁ · A₁ + γ₂ · E₂,eff · A₂)',
      substituted: `a₂ = (1.0 · ${E1} · ${A1} · ${d_centroids}) / (${(gamma1 * E1 * A1).toFixed(0)} + ${(gamma2 * E2_eff * A2).toFixed(0)})`,
      result: `${a2.toFixed(2)} mm`
    },
    {
      name: 'Biegesteifigkeit (EI)eff (CEN/TS 19103)',
      formula: '(EI)eff = E₁I₁ + E₂,effI₂ + γ₁E₁A₁a₁² + γ₂E₂,effA₂a₂²',
      substituted: `(EI)eff = ${(E1*I1).toExponential(3)} + ${(E2_eff*I2).toExponential(3)} + ${(gamma1*E1*A1*a1*a1).toExponential(3)} + ${(gamma2*E2_eff*A2*a2*a2).toExponential(3)}`,
      result: `${(EI_eff / 1e9).toFixed(2)} kN·m²`
    },
    {
      name: 'Bemessungsbiegemoment MEd',
      formula: 'MEd = qEd · L² / 8',
      substituted: `MEd = ${q_Ed_kNm.toFixed(2)} kN/m · (${params.spanL} m)² / 8`,
      result: `${M_Ed_kNm.toFixed(2)} kNm`
    },
    {
      name: 'Holzbiegespannung σm,d vs fm,d (EC5 Gl. 6.11)',
      formula: 'σm,d = (MEd / (EI)eff) · (γ₁E₁a₁ + 0.5 E₁h₁)',
      substituted: `σm,d = ${sigma_m_timber.toFixed(2)} N/mm²  |  fm,d = ${f_m_d.toFixed(2)} N/mm²`,
      result: `η = ${(eta_M_timber * 100).toFixed(1)}%`
    },
    {
      name: 'Betondruckspannung σc,d vs fcd (EC2/CEN 19103)',
      formula: 'σc,d = (MEd / (EI)eff) · (γ₂E₂,effa₂ + 0.5 E₂,effh₂)',
      substituted: `σc,d = ${sigma_c_concrete.toFixed(2)} N/mm²  |  fcd = ${f_c_d.toFixed(2)} N/mm²`,
      result: `η = ${(eta_c_concrete * 100).toFixed(1)}%`
    },
    {
      name: 'Enddurchbiegung wnet,fin (SLS EC5/CEN 19103)',
      formula: 'wnet,fin = winst · (1 + kdef) ≤ L / 300',
      substituted: `wnet,fin = ${w_inst.toFixed(2)} mm · (1 + ${params.kdef}) = ${w_net_fin.toFixed(2)} mm  |  Limit: ${w_limit.toFixed(2)} mm`,
      result: `η = ${(eta_deflection * 100).toFixed(1)}%`
    }
  ];

  return {
    gamma1,
    gamma2,
    a1,
    a2,
    EI_eff,
    q_Ed: q_Ed_kNm,
    M_Ed: M_Ed_kNm,
    V_Ed: V_Ed_kN,
    sigma_m_timber,
    f_m_d,
    eta_M_timber,
    sigma_c_concrete,
    f_c_d,
    eta_c_concrete,
    w_inst,
    w_net_fin,
    w_limit,
    eta_deflection,
    governingUtilization,
    status,
    calculationHash,
    solverVersion: SOLVER_VERSION,
    equations
  };
}
