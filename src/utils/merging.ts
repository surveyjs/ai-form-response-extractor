import type { ExtractionResult, FieldConfidence } from '../core/types';

/**
 * Merge online responses with paper form extractions.
 * Deduplicates by unique ID.
 */

export interface MergeOptions {
  /** Strategy when same field exists in both sources */
  conflictResolution?: 'prefer-online' | 'prefer-paper' | 'highest-confidence';
}

export interface MergedRecord {
  [key: string]: unknown;
  _source: 'merged' | 'online' | 'paper';
  _uniqueId: string | null;
  _mergeDetails?: Record<string, 'online' | 'paper'>;
}

function getConfidenceForField(
  confidence: FieldConfidence[],
  fieldName: string
): number {
  const entry = confidence.find((c) => c.fieldName === fieldName);
  // `null` confidence means "no signal" — treat it as 0 for comparison so
  // online wins on the equal-confidence tiebreaker, matching the pre-existing
  // behavior for missing entries.
  return entry && entry.confidence !== null ? entry.confidence : 0;
}

function mergeFields(
  onlineRecord: Record<string, unknown>,
  paperData: Record<string, unknown>,
  paperConfidence: FieldConfidence[],
  strategy: 'prefer-online' | 'prefer-paper' | 'highest-confidence'
): { merged: Record<string, unknown>; details: Record<string, 'online' | 'paper'> } {
  const merged: Record<string, unknown> = {};
  const details: Record<string, 'online' | 'paper'> = {};

  const allKeys = new Set([
    ...Object.keys(onlineRecord).filter((k) => k !== 'uniqueId'),
    ...Object.keys(paperData),
  ]);

  for (const key of allKeys) {
    const inOnline = key in onlineRecord;
    const inPaper = key in paperData;

    if (inOnline && inPaper) {
      if (strategy === 'prefer-online') {
        merged[key] = onlineRecord[key];
        details[key] = 'online';
      } else if (strategy === 'prefer-paper') {
        merged[key] = paperData[key];
        details[key] = 'paper';
      } else {
        // highest-confidence
        const onlineConf = 1.0;
        const paperConf = getConfidenceForField(paperConfidence, key);
        if (paperConf > onlineConf) {
          merged[key] = paperData[key];
          details[key] = 'paper';
        } else {
          // equal or online higher → prefer online
          merged[key] = onlineRecord[key];
          details[key] = 'online';
        }
      }
    } else if (inOnline) {
      merged[key] = onlineRecord[key];
      details[key] = 'online';
    } else {
      merged[key] = paperData[key];
      details[key] = 'paper';
    }
  }

  return { merged, details };
}

/** A value carries no information for merging purposes. */
function isEmptyValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Sortable confidence — `null` (no signal) ranks below any real score. */
function confidenceRank(confidence: number | null): number {
  return confidence === null ? -1 : confidence;
}

/**
 * Merge per-page `ExtractionResult`s of the SAME form into one result.
 *
 * Use this only when a multi-page form must be extracted with one model call
 * per page (e.g. the combined request would exceed the token / `max_tokens`
 * budget). When the pages fit in a single request, prefer
 * `extractor.extractFromPages(...)`, which sends every page at once and needs
 * no merge.
 *
 * Merge rule: a non-empty value always beats an empty one regardless of
 * confidence — this is what prevents a page that lacks a section (and so
 * reports those fields as a high-confidence blank) from overwriting the real
 * value read from the page that did contain the section. Confidence only
 * breaks ties between two non-empty (or two empty) candidates; on an exact tie
 * the earlier page wins. Empty means `null | undefined | "" | []`.
 */
export function mergeExtractionResults(results: ExtractionResult[]): ExtractionResult {
  const winners = new Map<string, FieldConfidence>();
  const order: string[] = [];
  let uniqueId: string | null = null;

  for (const result of results) {
    if (uniqueId === null && result.uniqueId != null && result.uniqueId !== '') {
      uniqueId = result.uniqueId;
    }

    // Index this page's confidence entries so a field's value and its
    // confidence are considered together.
    const confidenceByField = new Map<string, FieldConfidence>();
    for (const fc of result.confidence) {
      confidenceByField.set(fc.fieldName, fc);
    }

    const fieldNames = new Set<string>([
      ...Object.keys(result.data),
      ...confidenceByField.keys(),
    ]);

    for (const fieldName of fieldNames) {
      const existingFc = confidenceByField.get(fieldName);
      const candidate: FieldConfidence = existingFc ?? {
        fieldName,
        value: result.data[fieldName] ?? null,
        confidence: null,
        flagged: false,
      };

      const current = winners.get(fieldName);
      if (current === undefined) {
        order.push(fieldName);
        winners.set(fieldName, candidate);
        continue;
      }

      const currentEmpty = isEmptyValue(current.value);
      const candidateEmpty = isEmptyValue(candidate.value);

      if (currentEmpty === candidateEmpty) {
        // Same emptiness category → break the tie on confidence.
        if (confidenceRank(candidate.confidence) > confidenceRank(current.confidence)) {
          winners.set(fieldName, candidate);
        }
      } else if (currentEmpty) {
        // Non-empty beats empty regardless of confidence.
        winners.set(fieldName, candidate);
      }
    }
  }

  const data: Record<string, unknown> = {};
  const confidence: FieldConfidence[] = [];
  for (const fieldName of order) {
    const winner = winners.get(fieldName)!;
    data[fieldName] = winner.value;
    confidence.push({ ...winner, fieldName });
  }

  return { data, uniqueId, confidence };
}

/**
 * Merge online and paper-extracted responses.
 * Matches records by unique ID and combines fields.
 */
export function mergeResponses(
  onlineData: Record<string, unknown>[],
  paperExtractions: ExtractionResult[],
  options?: MergeOptions
): MergedRecord[] {
  const strategy = options?.conflictResolution ?? 'prefer-online';
  const results: MergedRecord[] = [];

  // 1. Index online data by uniqueId
  const onlineByUniqueId = new Map<string, Record<string, unknown>>();
  const onlineWithoutId: Record<string, unknown>[] = [];
  const matchedOnlineIds = new Set<string>();

  for (const record of onlineData) {
    const uid = record.uniqueId;
    if (typeof uid === 'string' && uid) {
      onlineByUniqueId.set(uid, record);
    } else {
      onlineWithoutId.push(record);
    }
  }

  // 2. Process paper extractions
  // Group paper extractions by uniqueId for merging multiples with same ID
  const paperByUniqueId = new Map<string, ExtractionResult[]>();
  const paperWithoutId: ExtractionResult[] = [];

  for (const extraction of paperExtractions) {
    if (extraction.uniqueId != null && extraction.uniqueId !== '') {
      const existing = paperByUniqueId.get(extraction.uniqueId) ?? [];
      existing.push(extraction);
      paperByUniqueId.set(extraction.uniqueId, existing);
    } else {
      paperWithoutId.push(extraction);
    }
  }

  // Process matched paper extractions
  for (const [uid, extractions] of paperByUniqueId) {
    const onlineRecord = onlineByUniqueId.get(uid);

    if (onlineRecord) {
      matchedOnlineIds.add(uid);

      // Merge all paper extractions in order into a combined paper record
      let combinedPaperData: Record<string, unknown> = {};
      const combinedConfidenceByField = new Map<string, FieldConfidence>();

      for (const extraction of extractions) {
        combinedPaperData = { ...combinedPaperData, ...extraction.data };
        // Later extractions' confidence entries override earlier ones for same fields
        for (const fc of extraction.confidence) {
          combinedConfidenceByField.set(fc.fieldName, fc);
        }
      }

      const combinedConfidence = Array.from(combinedConfidenceByField.values());

      const { merged, details } = mergeFields(
        onlineRecord,
        combinedPaperData,
        combinedConfidence,
        strategy
      );

      results.push({
        ...merged,
        _source: 'merged',
        _uniqueId: uid,
        _mergeDetails: details,
      });
    } else {
      // No matching online record — merge paper extractions together
      let combinedData: Record<string, unknown> = {};
      for (const extraction of extractions) {
        combinedData = { ...combinedData, ...extraction.data };
      }

      results.push({
        ...combinedData,
        _source: 'paper',
        _uniqueId: uid,
      });
    }
  }

  // Unmatched paper extractions (null uniqueId)
  for (const extraction of paperWithoutId) {
    results.push({
      ...extraction.data,
      _source: 'paper',
      _uniqueId: null,
    });
  }

  // 3. Add unmatched online responses
  for (const [uid, record] of onlineByUniqueId) {
    if (!matchedOnlineIds.has(uid)) {
      const { uniqueId: _omit, ...rest } = record;
      void _omit;
      results.push({
        ...rest,
        _source: 'online',
        _uniqueId: uid,
      });
    }
  }

  for (const record of onlineWithoutId) {
    const { uniqueId: _omit2, ...rest } = record;
    void _omit2;
    results.push({
      ...rest,
      _source: 'online',
      _uniqueId: null,
    });
  }

  return results;
}
