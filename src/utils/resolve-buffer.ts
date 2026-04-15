import { readFile } from 'node:fs/promises';
import type { ImageInput } from '../core/types';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_FETCH_BYTES = 10 * 1024 * 1024; // 10 MB

/** Resolve an ImageInput to a raw Buffer */
export async function resolveToBuffer(input: ImageInput): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(input, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength > MAX_FETCH_BYTES) {
          throw new Error(`Failed to fetch image: response too large (${buf.byteLength} bytes, max ${MAX_FETCH_BYTES})`);
        }
        return buf;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error(`Failed to fetch image: request timed out after ${FETCH_TIMEOUT_MS}ms`);
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    }
    return readFile(input);
  }
  throw new Error('Unsupported image input type');
}
