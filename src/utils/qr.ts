import type { ImageInput } from '../core/types';

/**
 * QR code and unique ID detection from form images.
 */

/** Result of unique ID detection */
export interface UniqueIdResult {
  id: string | null;
  source: 'qr' | 'barcode' | 'text' | null;
  confidence: number;
}

/**
 * Detect a unique ID from a scanned form image.
 * Tries QR code detection first, then falls back to barcode and text patterns.
 */
export async function detectUniqueId(_image: ImageInput): Promise<UniqueIdResult> {
  // TODO: Implement QR / barcode detection
  // Consider: jsQR, zbar-wasm, or delegating to the LLM
  throw new Error('QR / unique ID detection not yet implemented');
}
