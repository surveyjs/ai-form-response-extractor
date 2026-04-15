import { describe, it, expect } from 'vitest';
import { mergeResponses } from '../merging';

describe('mergeResponses', () => {
  it('throws "not yet implemented" error', () => {
    expect(() => mergeResponses([], [])).toThrow('Response merging not yet implemented');
  });

  it('throws with options provided', () => {
    expect(() =>
      mergeResponses(
        [{ id: '1', name: 'John' }],
        [],
        { conflictResolution: 'prefer-online' },
      ),
    ).toThrow('Response merging not yet implemented');
  });
});
