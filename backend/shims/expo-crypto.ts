/**
 * Backend-safe shim for expo-crypto
 * 
 * Provides Node.js compatible implementations using the crypto module.
 */

import * as crypto from 'crypto';

export const CryptoDigestAlgorithm = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
  MD5: 'MD5',
  MD4: 'MD4',
  MD2: 'MD2',
};

export const CryptoEncoding = {
  HEX: 'hex',
  BASE64: 'base64',
};

export async function digestStringAsync(
  algorithm: string,
  data: string,
  options?: { encoding?: string }
): Promise<string> {
  const encoding = options?.encoding || CryptoEncoding.HEX;
  
  // Map Expo algorithm names to Node crypto names
  const algoMap: Record<string, string> = {
    'SHA-1': 'sha1',
    'SHA-256': 'sha256',
    'SHA-384': 'sha384',
    'SHA-512': 'sha512',
    'MD5': 'md5',
    'MD4': 'md4',
    'MD2': 'md2',
  };
  
  const nodeAlgo = algoMap[algorithm] || algorithm.toLowerCase();
  const hash = crypto.createHash(nodeAlgo);
  hash.update(data);
  
  return hash.digest(encoding as any);
}

export function getRandomBytes(byteCount: number): Uint8Array {
  return new Uint8Array(crypto.randomBytes(byteCount));
}

export async function getRandomBytesAsync(byteCount: number): Promise<Uint8Array> {
  return getRandomBytes(byteCount);
}

export function randomUUID(): string {
  return crypto.randomUUID();
}
