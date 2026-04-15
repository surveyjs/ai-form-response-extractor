import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('detectUniqueId', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  it('detects a QR code from image data when sharp is available', async () => {
    // Create a mock that simulates jsQR finding a QR code.
    // We mock sharp to return known RGBA data and jsQR to return a result.
    const fakeRGBA = new Uint8ClampedArray(4 * 10 * 10); // 10x10 RGBA

    vi.doMock('sharp', () => ({
      default: () => ({
        ensureAlpha: () => ({
          raw: () => ({
            toBuffer: () =>
              Promise.resolve({
                data: Buffer.from(fakeRGBA.buffer),
                info: { width: 10, height: 10 },
              }),
          }),
        }),
      }),
    }));

    vi.doMock('jsqr', () => ({
      default: () => ({ data: 'QR-CODE-123' }),
    }));

    const { detectUniqueId: detect } = await import('../qr');
    const result = await detect(Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    expect(result).toEqual({
      id: 'QR-CODE-123',
      source: 'qr',
      confidence: 1.0,
    });

    vi.doUnmock('sharp');
    vi.doUnmock('jsqr');
  });

  it('returns null result when no QR code is found and no text ID', async () => {
    // sharp available but jsQR returns null, buffer has no text IDs
    vi.doMock('sharp', () => ({
      default: () => ({
        ensureAlpha: () => ({
          raw: () => ({
            toBuffer: () =>
              Promise.resolve({
                data: Buffer.from(new Uint8ClampedArray(4 * 10 * 10).buffer),
                info: { width: 10, height: 10 },
              }),
          }),
        }),
      }),
    }));

    vi.doMock('jsqr', () => ({
      default: () => null,
    }));

    const { detectUniqueId: detect } = await import('../qr');
    const result = await detect(Buffer.alloc(16)); // no text content

    expect(result).toEqual({
      id: null,
      source: null,
      confidence: 0,
    });

    vi.doUnmock('sharp');
    vi.doUnmock('jsqr');
  });

  it('detects UUID pattern from text in buffer', async () => {
    // sharp unavailable, falls past QR scanning to regex
    vi.doMock('sharp', () => {
      throw new Error('Cannot find module sharp');
    });

    // jsQR won't be reached since toRGBA returns null
    const { detectUniqueId: detect } = await import('../qr');

    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const buf = Buffer.from(`some header text ${uuid} trailing`);

    const result = await detect(buf);
    expect(result).toEqual({
      id: uuid,
      source: 'text',
      confidence: 0.7,
    });

    vi.doUnmock('sharp');
  });

  it('detects numeric ID pattern from text in buffer', async () => {
    vi.doMock('sharp', () => {
      throw new Error('Cannot find module sharp');
    });

    const { detectUniqueId: detect } = await import('../qr');

    const buf = Buffer.from('Form ID: 12345 submitted');
    const result = await detect(buf);

    expect(result).toEqual({
      id: '12345',
      source: 'text',
      confidence: 0.5,
    });

    vi.doUnmock('sharp');
  });

  it('detects REF numeric ID pattern', async () => {
    vi.doMock('sharp', () => {
      throw new Error('Cannot find module sharp');
    });

    const { detectUniqueId: detect } = await import('../qr');

    const buf = Buffer.from('Please reference REF:98765 in your response');
    const result = await detect(buf);

    expect(result).toEqual({
      id: '98765',
      source: 'text',
      confidence: 0.5,
    });

    vi.doUnmock('sharp');
  });
});
