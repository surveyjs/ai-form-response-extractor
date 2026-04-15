import type { ExtractionResult } from '../core/types';

/**
 * Merge online responses with paper form extractions.
 * Deduplicates by unique ID.
 */

export interface MergeOptions {
  /** Strategy when same field exists in both sources */
  conflictResolution?: 'prefer-online' | 'prefer-paper' | 'highest-confidence';
}

/**
 * Merge online and paper-extracted responses.
 * Matches records by unique ID and combines fields.
 */
export function mergeResponses(
  _onlineData: Record<string, unknown>[],
  _paperExtractions: ExtractionResult[],
  _options?: MergeOptions
): Record<string, unknown>[] {
  // TODO: Implement merging logic
  // 1. Index online data by uniqueId
  // 2. Match paper extractions by uniqueId
  // 3. Merge fields using conflict resolution strategy
  throw new Error('Response merging not yet implemented');
}
