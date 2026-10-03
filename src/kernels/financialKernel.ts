/**
 * NEXUS-4 Financial Research Kernel (TICKR)
 * Deterministic Balance Sheet Verification: Assets = Liabilities + Stockholders' Equity
 * Discrepancy Tolerance: |Assets - (Liabilities + Equity)| < 1e-9
 */

import { BalanceSheetData } from '../types/nexus';
import { syncShortHash } from './sha256';

export interface FinancialCheckResult {
  data: BalanceSheetData;
  identityHolds: boolean;
  deltaAbsolute: number;
  deltaPercentage: number;
  verificationHash: string;
  auditEvidence: string[];
}

export function verifyBalanceIdentity(data: BalanceSheetData): FinancialCheckResult {
  const sumLE = data.liabilities + data.equity;
  const delta = Math.abs(data.assets - sumLE);
  const deltaPercentage = data.assets > 0 ? (delta / data.assets) * 100 : 0;
  const identityHolds = delta < 1e-9;
  
  const auditEvidence = [
    `SEC EDGAR Form ${data.formType} Ingestion: ${data.company} (${data.ticker})`,
    `Reporting Period: ${data.period}, Filed on ${data.filingDate}`,
    `Total Assets: $${data.assets.toLocaleString()}`,
    `Total Liabilities: $${data.liabilities.toLocaleString()}`,
    `Stockholders' Equity: $${data.equity.toLocaleString()}`,
    `Equation Check: |${data.assets} - (${data.liabilities} + ${data.equity})| = ${delta.toExponential(4)}`,
    identityHolds 
      ? `VERIFIED: Deterministic Balance Identity Holds (Δ = 0.000000%)` 
      : `VETO: Balance Discrepancy of $${delta.toLocaleString()} detected (${deltaPercentage.toFixed(4)}%)`
  ];

  const verificationHash = `FIN-SHA256:0x${syncShortHash(`${data.ticker}-${data.period}-${data.assets}-${identityHolds}`)}`;

  return {
    data: {
      ...data,
      discrepancy: delta,
      verifiedIdentity: identityHolds
    },
    identityHolds,
    deltaAbsolute: delta,
    deltaPercentage,
    verificationHash,
    auditEvidence
  };
}
