/**
 * NEXUS-4 Local MCP Bridge (Self-hosted MCP Access Tools)
 * Provides unified interface for Engineering, Knowledge, and Data tools.
 */

import { calculateHbvGamma } from '../kernels/hbvKernel';
import { calculateEc5Beam } from '../kernels/ec5Kernel';
import { calculateEc2Slab } from '../kernels/ec2Kernel';
import { performDeltaVerification } from '../kernels/deltaVerifier';
import { computeSha256 } from '../kernels/sha256';
import { SSOT_DATABASE, KnowledgeObject } from '../knowledge/ssotKnowledgeBase';
import { HbvParameters, Ec5BeamParameters, Ec2SlabParameters } from '../types/nexus';

export interface McpToolCallResult {
  tool: string;
  success: boolean;
  result: any;
  executionTimeMs: number;
  hash: string;
}

export class McpBridge {
  private customKnowledge: KnowledgeObject[] = [];

  // Engineering Tools
  public async callHbvGammaCheck(params: HbvParameters): Promise<McpToolCallResult> {
    const start = performance.now();
    const result = calculateHbvGamma(params);
    const time = performance.now() - start;
    const hash = await computeSha256(result);
    return {
      tool: 'hbv.gamma_check',
      success: true,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callEc5BeamCheck(params: Ec5BeamParameters): Promise<McpToolCallResult> {
    const start = performance.now();
    const result = calculateEc5Beam(params);
    const time = performance.now() - start;
    const hash = await computeSha256(result);
    return {
      tool: 'ec5.beam_check',
      success: true,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callEc2SlabCheck(params: Ec2SlabParameters): Promise<McpToolCallResult> {
    const start = performance.now();
    const result = calculateEc2Slab(params);
    const time = performance.now() - start;
    const hash = await computeSha256(result);
    return {
      tool: 'ec2.slab_check',
      success: true,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callVerifyDelta(candidate: any, groundTruth: any, tolerance = 1e-9): Promise<McpToolCallResult> {
    const start = performance.now();
    const result = performDeltaVerification(candidate, groundTruth, tolerance);
    const time = performance.now() - start;
    const hash = await computeSha256(result);
    return {
      tool: 'verify.delta',
      success: result.passed,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  // Knowledge Tools
  public async callKnowledgeSearch(query: string): Promise<McpToolCallResult> {
    const start = performance.now();
    const q = query.toLowerCase();
    const all = [...SSOT_DATABASE, ...this.customKnowledge];
    const results = all.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
    const time = performance.now() - start;
    const hash = await computeSha256(results);
    return {
      tool: 'knowledge.search',
      success: true,
      result: results,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callKnowledgeResolveAuthority(clauseCode: string): Promise<McpToolCallResult> {
    const start = performance.now();
    const item = [...SSOT_DATABASE, ...this.customKnowledge].find(k => k.code.toLowerCase().includes(clauseCode.toLowerCase()) || k.id.toLowerCase() === clauseCode.toLowerCase());
    const time = performance.now() - start;
    const success = !!item;
    const result = item ? {
      code: item.code,
      authority: item.authority,
      validity: { from: item.validFrom, until: item.validUntil, status: item.status },
      binding: 'OFFICIAL_CEN_DIRECTIVE'
    } : { error: `Clause ${clauseCode} not found in SSOT` };
    const hash = await computeSha256(result);
    return {
      tool: 'knowledge.resolve_authority',
      success,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callKnowledgeTemporalCheck(clauseOrNormId: string): Promise<McpToolCallResult> {
    const start = performance.now();
    const item = [...SSOT_DATABASE, ...this.customKnowledge].find(k => k.id === clauseOrNormId || k.code === clauseOrNormId);
    const today = '2026-10-03';
    let valid = false;
    let message = 'Object not found';

    if (item) {
      valid = today >= item.validFrom && today <= item.validUntil;
      message = valid 
        ? `VALID: Standard ${item.code} is active (Valid from ${item.validFrom} until ${item.validUntil}).`
        : `EXPIRED/FUTURE: Standard ${item.code} out of validity window (${item.validFrom} to ${item.validUntil}).`;
    }

    const time = performance.now() - start;
    const result = { valid, item, message };
    const hash = await computeSha256(result);
    return {
      tool: 'knowledge.temporal_check',
      success: valid,
      result,
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callKnowledgeRegisterObject(obj: KnowledgeObject): Promise<McpToolCallResult> {
    const start = performance.now();
    this.customKnowledge.push(obj);
    const time = performance.now() - start;
    const hash = await computeSha256(obj);
    return {
      tool: 'knowledge.register_object',
      success: true,
      result: { registeredId: obj.id, totalObjects: SSOT_DATABASE.length + this.customKnowledge.length },
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  // Data Tools
  public async callDataFingerprint(data: string | object): Promise<McpToolCallResult> {
    const start = performance.now();
    const hash = await computeSha256(data);
    const time = performance.now() - start;
    return {
      tool: 'data.fingerprint',
      success: true,
      result: { sha256: hash, byteLength: typeof data === 'string' ? data.length : JSON.stringify(data).length },
      executionTimeMs: Math.round(time * 100) / 100,
      hash
    };
  }

  public async callDataIngestCsv(csvText: string): Promise<McpToolCallResult> {
    const start = performance.now();
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain a header line and at least one data row');
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const rowObj: Record<string, number | string> = {};
      headers.forEach((h, idx) => {
        const num = parseFloat(vals[idx]);
        rowObj[h] = isNaN(num) ? vals[idx] : num;
      });
      return rowObj;
    });

    const time = performance.now() - start;
    const fingerprint = await computeSha256(csvText);
    return {
      tool: 'data.ingest_csv',
      success: true,
      result: {
        rowCount: rows.length,
        columnCount: headers.length,
        headers,
        rows,
        fingerprint
      },
      executionTimeMs: Math.round(time * 100) / 100,
      hash: fingerprint
    };
  }

  public async callDataIngestIfc(ifcContent: string): Promise<McpToolCallResult> {
    const start = performance.now();
    // Deterministic parsing of IFC beam / slab geometry entities
    const beamMatches = ifcContent.match(/IFCBEAM/gi) || [];
    const slabMatches = ifcContent.match(/IFCSLAB/gi) || [];
    const materialMatches = ifcContent.match(/IFCMATERIAL/gi) || [];

    const fingerprint = await computeSha256(ifcContent);
    const time = performance.now() - start;

    return {
      tool: 'data.ingest_ifc',
      success: true,
      result: {
        format: 'IFC4 / ISO 16739',
        detectedElements: {
          beams: beamMatches.length,
          slabs: slabMatches.length,
          materials: materialMatches.length
        },
        fingerprint
      },
      executionTimeMs: Math.round(time * 100) / 100,
      hash: fingerprint
    };
  }
}

export const mcpBridge = new McpBridge();
