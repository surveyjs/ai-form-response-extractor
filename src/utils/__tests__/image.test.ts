import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageToBase64, preprocessImage } from '../image';

// Minimal valid 1x1 PNG (transparent pixel)
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Minimal JPEG (starts with FF D8 FF)
const MINIMAL_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

describe('imageToBase64', () => {
  it('converts a Buffer PNG to a data URL', async () => {
    const result = await imageToBase64(MINIMAL_PNG);
    expect(result).toMatch(/^data:image\/png;base64,/);
    // Round-trip: the base64 portion should decode back to the same bytes
    const b64 = result.split(',')[1];
    expect(Buffer.from(b64, 'base64').equals(MINIMAL_PNG)).toBe(true);
  });

  it('converts a Uint8Array PNG to a data URL', async () => {
    const uint8 = new Uint8Array(MINIMAL_PNG);
    const result = await imageToBase64(uint8);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('detects JPEG MIME type', async () => {
    const result = await imageToBase64(MINIMAL_JPEG);
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('detects WebP MIME type', async () => {
    // Minimal WebP-like magic bytes: RIFF....WEBP
    const webpBuf = Buffer.alloc(16);
    webpBuf.write('RIFF', 0);
    webpBuf.writeUInt32LE(8, 4); // file size placeholder
    webpBuf.write('WEBP', 8);
    const result = await imageToBase64(webpBuf);
    expect(result).toMatch(/^data:image\/webp;base64,/);
  });

  it('detects GIF MIME type', async () => {
    const gifBuf = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
    const result = await imageToBase64(gifBuf);
    expect(result).toMatch(/^data:image\/gif;base64,/);
  });

  it('throws on unsupported format', async () => {
    const garbage = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    await expect(imageToBase64(garbage)).rejects.toThrow('Unsupported image format');
  });
});

describe('preprocessImage', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns processed PNG buffer when sharp is available', async () => {
    const result = await preprocessImage(MINIMAL_PNG);
    expect(Buffer.isBuffer(result)).toBe(true);
    // Should be a valid PNG (starts with PNG magic bytes)
    expect(result[0]).toBe(0x89);
    expect(result[1]).toBe(0x50);
    expect(result[2]).toBe(0x4e);
    expect(result[3]).toBe(0x47);
  });

  it('returns raw buffer unchanged when sharp is unavailable', async () => {
    // Mock sharp to be unavailable
    vi.doMock('sharp', () => {
      throw new Error('Cannot find module sharp');
    });

    // Re-import to pick up the mock
    const { preprocessImage: preprocessNoSharp } = await import('../image');
    const result = await preprocessNoSharp(MINIMAL_PNG);
    expect(result.equals(MINIMAL_PNG)).toBe(true);

    vi.doUnmock('sharp');
  });
});
