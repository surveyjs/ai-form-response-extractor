import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveToBuffer } from '../resolve-buffer';
import { readFile } from 'node:fs/promises';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('resolveToBuffer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a Buffer unchanged', async () => {
    const buf = Buffer.from('hello');
    const result = await resolveToBuffer(buf);
    expect(result).toBe(buf);
  });

  it('converts Uint8Array to Buffer', async () => {
    const arr = new Uint8Array([1, 2, 3]);
    const result = await resolveToBuffer(arr);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(Buffer.from([1, 2, 3]));
  });

  it('fetches from HTTP URL', async () => {
    const fakeData = Buffer.from('image-data');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakeData.buffer.slice(fakeData.byteOffset, fakeData.byteOffset + fakeData.byteLength),
    }) as unknown as typeof fetch;

    const result = await resolveToBuffer('https://example.com/image.png');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/image.png',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('throws on non-OK HTTP response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }) as unknown as typeof fetch;

    await expect(resolveToBuffer('https://example.com/missing.png'))
      .rejects.toThrow('Failed to fetch image: 404 Not Found');
  });

  it('throws on response too large', async () => {
    const bigBuf = Buffer.alloc(11 * 1024 * 1024); // 11 MB
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => bigBuf.buffer,
    }) as unknown as typeof fetch;

    await expect(resolveToBuffer('https://example.com/big.png'))
      .rejects.toThrow('response too large');
  });

  it('throws on fetch timeout (AbortError)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    globalThis.fetch = vi.fn().mockRejectedValue(abortError) as unknown as typeof fetch;

    await expect(resolveToBuffer('http://example.com/slow.png'))
      .rejects.toThrow('request timed out');
  });

  it('reads file path from disk', async () => {
    const mockContent = Buffer.from('file-content');
    vi.mocked(readFile).mockResolvedValue(mockContent);

    const result = await resolveToBuffer('/path/to/image.png');
    expect(result).toBe(mockContent);
    expect(readFile).toHaveBeenCalledWith('/path/to/image.png');
  });

  it('throws on unsupported input type', async () => {
    await expect(resolveToBuffer(42 as unknown as string))
      .rejects.toThrow('Unsupported image input type');
  });
});
