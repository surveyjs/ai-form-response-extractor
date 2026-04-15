import { describe, it, expect } from 'vitest';
import { createExtractor } from '../extractor';

describe('createExtractor', () => {
  it('returns an object with extractFromImage method', () => {
    const extractor = createExtractor({
      provider: {
        name: 'mock',
        model: 'mock-model',
        extractFromImage: async () => ({ content: '{}' }),
      },
      adapter: 'surveyjs',
    });

    expect(extractor).toBeDefined();
    expect(typeof extractor.extractFromImage).toBe('function');
  });
});
