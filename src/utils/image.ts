import { readFile } from 'node:fs/promises';
import type { ImageInput } from '../core/types';

/**
 * Image preprocessing utilities.
 * Handles loading images from various sources and optional preprocessing
 * (resize, contrast, deskew) before sending to vision models.
 */

/** Resolve an ImageInput to a raw Buffer */
async function resolveToBuffer(input: ImageInput): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const res = await fetch(input);
      if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    }
    return readFile(input);
  }
  throw new Error('Unsupported image input type');
}

/** Detect MIME type from magic bytes */
function detectMime(buf: Buffer): string {
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png';
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return 'image/gif';
  }
  throw new Error('Unsupported image format: could not detect MIME type from magic bytes');
}

/** Normalize an image input to a base64 data URL string */
export async function imageToBase64(input: ImageInput): Promise<string> {
  const buf = await resolveToBuffer(input);
  const mime = detectMime(buf);
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
}

/** Try to dynamically import sharp, returns null if unavailable */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryLoadSharp(): Promise<any> {
  try {
    const mod = await import('sharp');
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

const MAX_DIMENSION = 2048;

/** Optional preprocessing: resize, enhance contrast. Returns raw image buffer. */
export async function preprocessImage(input: ImageInput): Promise<Buffer> {
  const buf = await resolveToBuffer(input);
  const sharp = await tryLoadSharp();
  if (!sharp) return buf;

  let pipeline = sharp(buf);

  const metadata = await pipeline.metadata();
  const { width, height } = metadata;

  if (width && height && Math.max(width, height) > MAX_DIMENSION) {
    pipeline = width >= height
      ? pipeline.resize({ width: MAX_DIMENSION, withoutEnlargement: true })
      : pipeline.resize({ height: MAX_DIMENSION, withoutEnlargement: true });
  }

  pipeline = pipeline.normalize();

  return pipeline.png().toBuffer();
}
