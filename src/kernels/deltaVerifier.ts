/**
 * NEXUS-4 Zero-Tolerance Delta Verifier
 * Evaluates candidate calculation values against ground-truth deterministic kernel.
 * Rejects any deviation greater than 1e-9 (0.000000%).
 */

export interface DeltaCheckReport {
  passed: boolean;
  maxDelta: number;
  tolerance: number;
  comparisons: {
    property: string;
    candidateValue: number;
    kernelValue: number;
    delta: number;
    status: 'MATCH' | 'MISMATCH';
  }[];
  timestamp: string;
  sioVetoTriggered: boolean;
  message: string;
}

export function performDeltaVerification(candidate: Record<string, any>, groundTruth: Record<string, any>, tolerance = 1e-9): DeltaCheckReport {
  const comparisons: DeltaCheckReport['comparisons'] = [];
  let maxDelta = 0;
  let passed = true;

  const numericKeys = Object.keys(groundTruth).filter(k => typeof groundTruth[k] === 'number');

  for (const key of numericKeys) {
    const kernelVal = groundTruth[key] as number;
    const candVal = typeof candidate[key] === 'number' ? candidate[key] : (typeof candidate[key] === 'string' ? parseFloat(candidate[key]) : NaN);

    if (isNaN(candVal)) {
      comparisons.push({
        property: key,
        candidateValue: NaN,
        kernelValue: kernelVal,
        delta: Infinity,
        status: 'MISMATCH'
      });
      passed = false;
      continue;
    }

    const delta = Math.abs(candVal - kernelVal);
    if (delta > maxDelta) {
      maxDelta = delta;
    }

    const matches = delta <= tolerance;
    if (!matches) {
      passed = false;
    }

    comparisons.push({
      property: key,
      candidateValue: candVal,
      kernelValue: kernelVal,
      delta,
      status: matches ? 'MATCH' : 'MISMATCH'
    });
  }

  return {
    passed,
    maxDelta,
    tolerance,
    comparisons,
    timestamp: new Date().toISOString(),
    sioVetoTriggered: !passed,
    message: passed 
      ? `SIO DELTA VERIFICATION PASSED: Candidate is strictly identical to deterministic kernel (max Δ = ${maxDelta.toExponential(4)} ≤ ${tolerance}).`
      : `SIO VETO TRIGGERED: Discrepancy detected (max Δ = ${maxDelta.toExponential(4)} > ${tolerance}). Candidate output rejected.`
  };
}
