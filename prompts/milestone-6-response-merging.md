# Milestone 6 — Response Merging

## Goal
Implement the response merging utility that combines online and paper-extracted responses.

## Instructions

### Merge Utility (`src/utils/merging.ts`)

**`mergeResponses(onlineData, paperExtractions, options?)` function:**

**Input:**
- `onlineData`: array of online response objects, each with a `uniqueId` field and form field values
- `paperExtractions`: array of `ExtractionResult` objects from paper form extraction
- `options.conflictResolution`: strategy when same field exists in both sources (default: `'prefer-online'`)

**Algorithm:**
1. **Index online data** — Create a Map keyed by `uniqueId` from online responses
2. **Process paper extractions** — For each paper `ExtractionResult`:
   - Look up matching online response by `result.uniqueId`
   - If match found: merge fields using conflict resolution strategy
   - If no match: convert to plain data object, tag with `_source: 'paper'`
3. **Add unmatched online responses** — Any online response without a matching paper extraction passes through unchanged, tagged with `_source: 'online'`
4. **Return merged array**

**Conflict Resolution Strategies:**
- `prefer-online`: When a field exists in both online and paper, keep the online value
- `prefer-paper`: When a field exists in both, keep the paper-extracted value
- `highest-confidence`: When a field exists in both, pick the one with higher confidence score
  - Online responses are assumed confidence 1.0 (user-entered)
  - Paper extractions use their per-field confidence from `ExtractionResult.confidence`
  - If confidence is equal, prefer online

**Edge Cases:**
- Paper extraction with `uniqueId: null` — include as unmatched paper record
- Multiple paper extractions with the same uniqueId — merge them in order (later overwrites earlier for same fields, respecting conflict strategy)
- Online response with no uniqueId field — include as unmatched online record
- Empty arrays — return empty result

**Output:**
- Each merged record includes:
  - All merged field values
  - `_source`: `'merged'` | `'online'` | `'paper'`
  - `_uniqueId`: the matched unique ID
  - `_mergeDetails`: object noting which fields came from which source (optional, for debugging)

### Unit Tests (`src/utils/__tests__/merging.test.ts`)

Test cases:
1. **Basic match** — One online + one paper with same uniqueId → merged result
2. **prefer-online strategy** — Conflicting field values, online wins
3. **prefer-paper strategy** — Conflicting field values, paper wins
4. **highest-confidence strategy** — Pick by confidence score
5. **Unmatched online** — Online response with no paper match → passes through with `_source: 'online'`
6. **Unmatched paper** — Paper extraction with no online match → included with `_source: 'paper'`
7. **Null uniqueId on paper** — Treated as unmatched
8. **Multiple paper extractions same ID** — Merged in order
9. **Empty inputs** — Both empty arrays → empty result
10. **Non-overlapping fields** — Online has field A, paper has field B → merged has both

### Files to Modify
- `src/utils/merging.ts`
- `src/utils/index.ts` (update exports if needed)
- Create `src/utils/__tests__/merging.test.ts`

### Acceptance Criteria
- All three conflict resolution strategies work correctly
- Unmatched records from both sides are included with correct `_source` tag
- Edge cases (null IDs, duplicates, empty arrays) handled
- `npm run test` passes
- `npm run typecheck` passes
- `npm run lint` passes
