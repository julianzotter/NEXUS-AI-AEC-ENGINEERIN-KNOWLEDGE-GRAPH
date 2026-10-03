/**
 * NEXUS-4 Knowledge Infrastructure & SSOT (Single Source of Truth)
 * Graph linking Standards → Clauses → Formulas → Applications
 * Includes Temporal Validity & Authority verification
 */

export interface KnowledgeObject {
  id: string;
  type: 'STANDARD' | 'CLAUSE' | 'FORMULA' | 'MATERIAL' | 'COOKBOOK';
  title: string;
  code: string;
  authority: string; // e.g. "CEN (Comité Européen de Normalisation)", "DIN", "ISO"
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  description: string;
  formulaLatex?: string;
  parameters?: string[];
  relations: string[]; // referenced IDs
}

export const SSOT_DATABASE: KnowledgeObject[] = [
  {
    id: 'NORM-CEN-TS-19103',
    type: 'STANDARD',
    title: 'Design of Timber-Concrete Composite Structures - Common rules and rules for buildings',
    code: 'CEN/TS 19103:2021',
    authority: 'CEN TC 250 / SC 5',
    validFrom: '2021-11-01',
    validUntil: '2030-12-31',
    status: 'ACTIVE',
    description: 'European Technical Specification for the design of timber-concrete composite structures applying the γ-method for semi-rigid shear connectors.',
    relations: ['CLAUSE-CEN-19103-7-1', 'CLAUSE-CEN-19103-7-2', 'COOKBOOK-HBV-GOLDEN']
  },
  {
    id: 'NORM-EN-1995-1-1',
    type: 'STANDARD',
    title: 'Eurocode 5: Design of timber structures - Part 1-1: General - Common rules and rules for buildings',
    code: 'EN 1995-1-1:2004+A1:2008+A2:2014',
    authority: 'CEN TC 250 / SC 5',
    validFrom: '2014-05-01',
    validUntil: '2027-12-31',
    status: 'ACTIVE',
    description: 'Core European standard for timber engineering including Annex B mechanically jointed beams.',
    relations: ['CLAUSE-EC5-6-1-6', 'CLAUSE-EC5-6-1-7', 'CLAUSE-EC5-7-2', 'COOKBOOK-EC5-BEAM']
  },
  {
    id: 'NORM-EN-1992-1-1',
    type: 'STANDARD',
    title: 'Eurocode 2: Design of concrete structures - Part 1-1: General rules and rules for buildings',
    code: 'EN 1992-1-1:2004+AC:2010',
    authority: 'CEN TC 250 / SC 2',
    validFrom: '2010-11-01',
    validUntil: '2027-12-31',
    status: 'ACTIVE',
    description: 'Eurocode governing reinforced concrete design, bending, shear, crack control, and bond.',
    relations: ['CLAUSE-EC2-6-1', 'CLAUSE-EC2-6-2-2', 'COOKBOOK-EC2-SLAB']
  },
  {
    id: 'CLAUSE-CEN-19103-7-1',
    type: 'CLAUSE',
    title: 'CEN/TS 19103 Cl. 7.1: Effective Bending Stiffness (EI)eff',
    code: 'CEN/TS 19103 § 7.1',
    authority: 'CEN TC 250 / SC 5',
    validFrom: '2021-11-01',
    validUntil: '2030-12-31',
    status: 'ACTIVE',
    description: 'Determines the composite bending stiffness using the gamma factor for flexible shear connection.',
    formulaLatex: '(EI)_{eff} = E_1 I_1 + E_2 I_2 + \\gamma_1 E_1 A_1 a_1^2 + \\gamma_2 E_2 A_2 a_2^2',
    parameters: ['E1', 'I1', 'E2_eff', 'I2', 'gamma1', 'gamma2', 'a1', 'a2'],
    relations: ['NORM-CEN-TS-19103', 'CLAUSE-CEN-19103-7-2']
  },
  {
    id: 'CLAUSE-CEN-19103-7-2',
    type: 'CLAUSE',
    title: 'CEN/TS 19103 Cl. 7.2: Connection Flexibility Factor γ₂',
    code: 'CEN/TS 19103 § 7.2',
    authority: 'CEN TC 250 / SC 5',
    validFrom: '2021-11-01',
    validUntil: '2030-12-31',
    status: 'ACTIVE',
    description: 'Calculates the shear connection efficiency factor γ₂ based on slip modulus K_u and connector pitch s.',
    formulaLatex: '\\gamma_2 = \\left[ 1 + \\frac{\\pi^2 E_2 A_2 s}{K_u L^2} \\right]^{-1}',
    parameters: ['E2_eff', 'A2', 's', 'Ku', 'L'],
    relations: ['NORM-CEN-TS-19103']
  },
  {
    id: 'CLAUSE-EC5-6-1-6',
    type: 'CLAUSE',
    title: 'EN 1995-1-1 Cl. 6.1.6: Bending Resistance of Solid Timber',
    code: 'EN 1995-1-1 § 6.1.6',
    authority: 'CEN TC 250 / SC 5',
    validFrom: '2014-05-01',
    validUntil: '2027-12-31',
    status: 'ACTIVE',
    description: 'Cross-sectional bending stress condition σm,d ≤ fm,d.',
    formulaLatex: '\\sigma_{m,d} = \\frac{M_{Ed}}{W} \\le f_{m,d} = k_{mod} \\frac{f_{m,k}}{\\gamma_M}',
    relations: ['NORM-EN-1995-1-1']
  },
  {
    id: 'CLAUSE-EC2-6-2-2',
    type: 'CLAUSE',
    title: 'EN 1992-1-1 Cl. 6.2.2: Shear capacity without shear reinforcement VRd,c',
    code: 'EN 1992-1-1 § 6.2.2',
    authority: 'CEN TC 250 / SC 2',
    validFrom: '2010-11-01',
    validUntil: '2027-12-31',
    status: 'ACTIVE',
    description: 'Calculates the design shear resistance for slabs without shear links.',
    formulaLatex: 'V_{Rd,c} = [C_{Rd,c} k (100 \\rho_l f_{ck})^{1/3} + k_1 \\sigma_{cp}] b_w d \\ge v_{min} b_w d',
    relations: ['NORM-EN-1992-1-1']
  },
  {
    id: 'COOKBOOK-HBV-GOLDEN',
    type: 'COOKBOOK',
    title: 'Golden Slice Playbook: Holz-Beton-Verbunddecke CEN/TS 19103',
    code: 'PLAYBOOK-CEN-19103-SLAB',
    authority: 'NEXUS-4 SIO Authority Board',
    validFrom: '2024-01-01',
    validUntil: '2030-12-31',
    status: 'ACTIVE',
    description: 'Step 1: DAA Ingest & SHA-256 fingerprint. Step 2: ASO candidate model synthesis. Step 3: AEGS EU AI Act High-Risk safety tagging. Step 4: SIO deterministic γ-Verfahren execution and Delta test. Step 5: SIO signature seal.',
    relations: ['NORM-CEN-TS-19103']
  }
];

export const MATERIAL_CATALOG = {
  timber: [
    { name: 'C24 (Solid Timber)', fmk: 24, fvk: 4.0, E0mean: 11000, density: 350 },
    { name: 'GL24h (Glued Laminated)', fmk: 24, fvk: 3.5, E0mean: 11500, density: 385 },
    { name: 'GL28c (Combined Glulam)', fmk: 28, fvk: 3.5, E0mean: 12500, density: 410 },
    { name: 'C30 (High Grade Solid)', fmk: 30, fvk: 4.0, E0mean: 12000, density: 380 }
  ],
  concrete: [
    { name: 'C20/25', fck: 20, Ecm: 30000, fctm: 2.2 },
    { name: 'C25/30', fck: 25, Ecm: 31000, fctm: 2.6 },
    { name: 'C30/37', fck: 30, Ecm: 33000, fctm: 2.9 },
    { name: 'C35/45', fck: 35, Ecm: 34000, fctm: 3.2 }
  ],
  steel: [
    { name: 'B500B (High Ductility)', fyk: 500, Es: 200000 },
    { name: 'B500A (Normal Ductility)', fyk: 500, Es: 200000 }
  ]
};
