/**
 * Statiker-Cookbook, Technical Approvals (ETA) Catalog & System Constitutions
 * Curated step-by-step procedures according to Eurocode, ÖNORM B, and ETA approvals.
 */

export interface TechnicalApprovalItem {
  id: string;
  manufacturer: string;
  productName: string;
  category: 'THERMAL_BREAK' | 'CORBEL_CONNECTOR' | 'TIMBER_SCREW' | 'ANCHOR_CHANNEL' | 'PRESTRESSING' | 'CLT_TIMBER';
  approvalNumber: string; // ETA, DIBt, BTZ
  validUntil: string;
  designStandard: string;
  keyParameters: Record<string, string | number>;
  description: string;
  austrianAnnexApplicable: boolean;
}

export const TECHNICAL_APPROVALS_CATALOG: TechnicalApprovalItem[] = [
  // 1. Schöck Isokorb
  {
    id: 'ETA-SCHOECK-ISOKORB-KXT',
    manufacturer: 'Schöck Bauteile GmbH',
    productName: 'Schöck Isokorb® XT Typ K (KXT)',
    category: 'THERMAL_BREAK',
    approvalNumber: 'ETA-12/0456',
    validUntil: '2028-12-31',
    designStandard: 'ÖNORM B 1992-1-1 / EN 1992-1-1',
    keyParameters: {
      dämmstoffdicke_mm: 120,
      elementhöhe_mm: '160 - 250',
      zugstäbe_material: 'B500B Edelstahl (1.4571)',
      drucklager: 'HTE-Compact Drucklager'
    },
    description: 'Tragendes Wärmedämmelement für auskragende Balkone. Überträgt negative Biegemomente und Querkräfte.',
    austrianAnnexApplicable: true
  },
  {
    id: 'ETA-SCHOECK-ISOKORB-QXT',
    manufacturer: 'Schöck Bauteile GmbH',
    productName: 'Schöck Isokorb® XT Typ Q (QXT)',
    category: 'THERMAL_BREAK',
    approvalNumber: 'ETA-12/0456',
    validUntil: '2028-12-31',
    designStandard: 'ÖNORM B 1992-1-1 / EN 1992-1-1',
    keyParameters: {
      dämmstoffdicke_mm: 120,
      beanspruchung: 'Reine Querkraftübertragung',
      auflagerung: 'Gestützte Balkone / Loggien'
    },
    description: 'Querkraftübertragung bei gestützten Balkonplatten oder Laubengängen zur thermischen Trennung.',
    austrianAnnexApplicable: true
  },

  // 2. Peikko Konsolen & Auflager
  {
    id: 'ETA-PEIKKO-PBH',
    manufacturer: 'Peikko Group',
    productName: 'PBH® Verdeckte Konsole',
    category: 'CORBEL_CONNECTOR',
    approvalNumber: 'ETA-13/0789',
    validUntil: '2029-06-30',
    designStandard: 'EN 1992-1-1 / DIN EN 1993-1-8',
    keyParameters: {
      kapazität_VRd_kN: 'bis 250 kN',
      ausführung: 'Bündige verdeckte Deckenauflagerung',
      material: 'S355 Stahlkern'
    },
    description: 'Verdeckte Auflagerkonsole für Fertigteildecken und Unterzüge ohne störenden Deckenuntersichtsversatz.',
    austrianAnnexApplicable: true
  },
  {
    id: 'ETA-PEIKKO-PCS',
    manufacturer: 'Peikko Group',
    productName: 'PCs® Kragarmkonsole',
    category: 'CORBEL_CONNECTOR',
    approvalNumber: 'ETA-14/0567',
    validUntil: '2029-12-31',
    designStandard: 'EN 1992-1-1 & EN 1993-1-1',
    keyParameters: {
      stützenquerschnitt: 'Rechteckig oder rund',
      laststufe: 'PCs 2, PCs 3, PCs 5, PCs 7'
    },
    description: 'Modulare Konsolenlösung für Stahlbetonstützen mit hoher Montagegeschwindigkeit und justierbarer Ausrichtung.',
    austrianAnnexApplicable: true
  },

  // 3. Halfen Schienen & Anker
  {
    id: 'DIBT-HALFEN-HTA-HP',
    manufacturer: 'Leviat (Halfen)',
    productName: 'Halfenschiene HTA-CE / HTA-HP',
    category: 'ANCHOR_CHANNEL',
    approvalNumber: 'ETA-09/0339',
    validUntil: '2030-01-31',
    designStandard: 'EN 1992-4 (Bemessung von Verankerungen in Beton)',
    keyParameters: {
      profile: 'HTA 28/15 bis HTA 72/48',
      material: 'Feuerverzinkt oder Edelstahl A4'
    },
    description: 'Einbetonierte Ankerschienen für statische und dynamische Lasten im Betonbau ohne Bohren.',
    austrianAnnexApplicable: true
  },

  // 4. Schmid Schrauben Hainfeld (Holzbau & HBV)
  {
    id: 'ETA-SCHMID-ASSY-PLUS-VG',
    manufacturer: 'Schmid Schrauben Hainfeld GmbH',
    productName: 'RAPID® / ASSY® plus VG Vollgewindeschraube',
    category: 'TIMBER_SCREW',
    approvalNumber: 'ETA-11/0190',
    validUntil: '2030-08-31',
    designStandard: 'CEN/TS 19103 / ÖNORM B 1995-1-1',
    keyParameters: {
      durchmesser_d_mm: '6, 8, 10, 12',
      länge_L_mm: 'bis 600 mm',
      Kser_N_mm: '45000 - 60000',
      neigungswinkel: '45° oder 90° geneigt'
    },
    description: 'Europäisch zugelassenes Schubverbindungsmittel für Holz-Beton-Verbunddecken und Querdruckverstärkungen.',
    austrianAnnexApplicable: true
  },

  // 5. Rothoblaas & SFS
  {
    id: 'ETA-ROTHOBLAAS-VGS',
    manufacturer: 'Rothoblaas GmbH',
    productName: 'VGS Vollgewindeschraube Zylinderkopf',
    category: 'TIMBER_SCREW',
    approvalNumber: 'ETA-11/0030',
    validUntil: '2029-05-15',
    designStandard: 'ÖNORM EN 1995-1-1',
    keyParameters: {
      kopfform: 'Zylinderkopf tief versenkbar',
      stahlgüte: 'Hochfester Kohlenstoffstahl'
    },
    description: 'Schraubverbindung für Haupt- und Nebenträgeranschlüsse sowie HBV-Verbundkörper.',
    austrianAnnexApplicable: true
  },

  // 6. Brettsperrholz CLT
  {
    id: 'ETA-CLT-KLH-MM-STORA',
    manufacturer: 'KLH / Stora Enso / Mayr-Melnhof / Binderholz',
    productName: 'Cross Laminated Timber (CLT / BSP)',
    category: 'CLT_TIMBER',
    approvalNumber: 'ETA-06/0138 & ETA-14/0349',
    validUntil: '2030-12-31',
    designStandard: 'ÖNORM EN 1995-1-1 / ÖNORM B 1995-1-1 NAD-AT',
    keyParameters: {
      schichten: '3-lagig, 5-lagig, 7-lagig',
      laminendicke_mm: '20, 30, 40',
      rollschub_f_R_d: '1.25 N/mm²'
    },
    description: 'Massivholzplatten aus kreuzweise verklebten Lamellen für tragende Decken und Wandscheiben.',
    austrianAnnexApplicable: true
  }
];

export const STATIKER_COOKBOOK_MARKDOWN = `# NEXUS-4 Statiker-Cookbook: Eurocode & ÖNORM Bemessungspraxis

**Herausgeber:** NEXUS-4 Ziviltechniker & Structural Engineering Console  
**Geltungsbereich:** Österreich (NAD-AT), Deutschland, Schweiz, Europäische Union  
**Regelwerks-Stand:** CEN/TS 19103:2021, EN 1995-1-1 (EC5), EN 1992-1-1 (EC2), EN 1993-1-1 (EC3)

---

## 1. Holz-Beton-Verbunddecken (HBV) nach CEN/TS 19103 & ÖNORM B 1995-1-1

### 1.1 Schrittweiser Ablaufplan (Gamma-Verfahren)
1. **Lastannahmen erfassen:**
   - Eigenlast $g_k = g_{k,Holz} + g_{k,Beton} + g_{k,Aufbau}$ (typ. $2.5 - 3.5\\,\\text{kN/m}^2$)
   - Nutzlast $q_k$ nach ÖNORM B 1991-1-1 (Wohnung $2.0\\,\\text{kN/m}^2$, Büro $3.0\\,\\text{kN/m}^2$)
   - Bemessungslast ULS: $q_{Ed} = 1.35 g_k + 1.50 q_k$
2. **Kriech- und Deformationsbeiwerte festlegen (Nutzungsklasse 1):**
   - Beton: Kriechzahl $\\varphi = 2.0 - 2.5 \\rightarrow E_{c,eff} = \\frac{E_{cm}}{1 + \\varphi}$
   - Holz: $k_{def} = 0.60$ (ÖNORM B 1995-1-1, Teilsicherheitsbeiwert $\\gamma_M = 1.30$)
3. **Verbindungsmittelsteifigkeit berechnen:**
   - Schlupfmodul $K_{ser}$ aus ETA (z.B. Schmid ASSY plus VG $K_{ser} = 50000\\,\\text{N/mm}$)
   - Verschiebung im Grenzzustand: $K_u = \\frac{2}{3} K_{ser}$
4. **Gamma-Faktor $\\gamma_2$ nach Cl. 7.2 berechnen:**
   $$\\gamma_2 = \\left[ 1 + \\frac{\\pi^2 \\cdot E_{2,eff} \\cdot A_2 \\cdot s}{K_u \\cdot L^2} \\right]^{-1}$$
5. **Schwerachsenabstände und wirksame Biegesteifigkeit $(EI)_{eff}$:**
   $$a_2 = \\frac{\\gamma_1 E_1 A_1 d}{\\gamma_1 E_1 A_1 + \\gamma_2 E_{2,eff} A_2}, \\quad a_1 = d - a_2$$
   $$(EI)_{eff} = E_1 I_1 + E_{2,eff} I_2 + \\gamma_1 E_1 A_1 a_1^2 + \\gamma_2 E_{2,eff} A_2 a_2^2$$
6. **Nachweisführung:**
   - Biegung Holz Zugzone: $\\sigma_{t,d} \\le f_{m,d} = k_{mod} \\cdot \\frac{f_{m,k}}{\\gamma_M}$
   - Beton Druckspannung: $\\sigma_{c,d} \\le f_{c,d} = \\alpha_{cc} \\cdot \\frac{f_{c,k}}{\\gamma_C}$ (NAD-AT $\\alpha_{cc} = 0.85$)
   - Schwingungskriterium: Eigenfrequenz $f_1 = \\frac{\\pi}{2 L^2} \\sqrt{\\frac{(EI)_{eff}}{m}} \\ge 8.0\\,\\text{Hz}$

---

## 2. Stahlbeton-Flachdecke & Kragplatte nach EN 1992-1-1 (EC2)
1. **Biegebemessung Druckzone:**
   $$\\mu_{Eds} = \\frac{M_{Ed}}{b \\cdot d^2 \\cdot f_{cd}}$$
   Grenzwert $\\mu_{lim} = 0.296$ (ohne Druckbewehrung).
2. **Hebelarm und erforderliche Zugbewehrung:**
   $$\\zeta = \\frac{1}{2} \\left( 1 + \\sqrt{1 - 2 \\mu_{Eds}} \\right), \\quad z = \\zeta \\cdot d$$
   $$A_{s,req} = \\frac{M_{Ed}}{z \\cdot f_{yd}}$$
3. **Querkraft ohne Schubbewehrung:**
   $$V_{Rd,c} = \\left[ C_{Rd,c} \\cdot k \\cdot (100 \\rho_l f_{ck})^{1/3} \\right] b \\cdot d \\ge v_{min} \\cdot b \\cdot d$$

---

## 3. Holz-Biegeträger nach EN 1995-1-1 (EC5)
- Biegespannung: $\\sigma_{m,d} = \\frac{6 M_{Ed}}{b h^2} \\le f_{m,d}$
- Schubspannung mit Rissbeiwert $k_{cr} = 0.67$:
  $$\\tau_d = 1.5 \\cdot \\frac{V_{Ed}}{0.67 b h} \\le f_{v,d}$$

---

## 4. Sorgfaltspflicht vs. Ziviltechniker-Rundsiegel (§ 15 ZTG)
- **Arbeitsunterlage:** Vorbemessungen und parametrische Studien unterliegen der ingenieurmäßigen Sorgfaltspflicht (§ 24 ZTG), sind jedoch interne Vorentwürfe.
- **Offizielle ZT-Beurkundung:** Erfordert die qualifizierte elektronische Signatur (QES) oder den physischen Rundsiegel-Stempel des Ziviltechnikers zur Vorlage bei Baubehörden und Gerichten.
`;

export const NEXUS4_SYSTEM_CONSTITUTION = `# NEXUS-4 System-Verfassung & Governance Baseline

## I. Leitprinzip
Automatisierte KI-Berechnungen liefern **Kandidatenergebnisse**, niemals offizielle Freigaben.
Nur das menschliche Ingenieururteil (SIO-Gate) legitimiert Tragwerksdokumente.

## II. Nulltoleranz für stochastische Arithmetik
Kein LLM darf Zahlen durch Token-Generierung schätzen. Alle numerischen Nachweise
müssen aus geschlossenen Gleichungen deterministischer Rechenkerne (Pyodide WASM / FastMCP) stammen.
Zulässige Abweichung: $\\Delta = 0.000000\\%$ ($< 10^{-9}$).

## III. 4-Layer Governance Pipeline
1. **DAA (Data Advantage):** Verifiziert Datenintegrität, SHA-256 Fingerprint, Nullwertfreiheit.
2. **ASO (AI Systems):** Orchestriert Rechenmodelle, deklariert Ausgaben strikt als [KANDIDAT].
3. **AEGS (Ethics & Governance):** Überwacht EU AI Act Annex III Compliance; sperrt Pipeline bei Drift $> 2.0\\%$.
4. **SIO (Structural Integrity):** Führt deterministische Verifikation durch; besitzt unanfechtbares VETO-Recht.
`;
