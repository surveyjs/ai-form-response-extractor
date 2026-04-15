import type { ImageInput } from '../core/types';

/**
 * Image preprocessing utilities.
 * Handles loading images from various sources and optional preprocessing
 * (resize, contrast, deskew) before sending to vision models.
 */

/** Normalize an image input to a base64 string */
export async function imageToBase64(_input: ImageInput): Promise<string> {
  // TODO: Handle Buffer, Uint8Array, file path, and URL inputs
  // Use sharp (optional peer dep) when available for preprocessing
  throw new Error('Image utilities not yet implemented');
}

/** Optional preprocessing: resize, enhance contrast */
export async function preprocessImage(_input: ImageInput): Promise<Buffer> {
  // TODO: Implement with sharp
  throw new Error('Image preprocessing not yet implemented');
}
