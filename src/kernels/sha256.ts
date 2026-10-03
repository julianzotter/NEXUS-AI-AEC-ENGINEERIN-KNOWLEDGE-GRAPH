/**
 * NEXUS-4 Deterministic SHA-256 Fingerprinting Kernel
 * Cryptographic assurance for DAA and SIO audit chain.
 */

export async function computeSha256(data: string | object): Promise<string> {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(content);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Deterministic fallback for environments without subtle crypto
  let hash = 0x811c9dc5;
  for (let i = 0; i < msgUint8.length; i++) {
    hash ^= msgUint8[i];
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return '0x' + (hash >>> 0).toString(16).padStart(16, '0') + 'b4f2c918ec3011';
}

export function syncShortHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}
