# AI Form Response Extractor by SurveyJS

[![CI](https://github.com/surveyjs/ai-form-response-extractor/actions/workflows/ci.yml/badge.svg)](https://github.com/surveyjs/ai-form-response-extractor/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ai-form-response-extractor.svg)](https://www.npmjs.com/package/ai-form-response-extractor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Extract structured survey responses from paper forms, PDFs, and images using multimodal LLMs.**

This library enables hybrid paper + digital form workflows in your application. You define a form once as a JSON schema, collect responses online and on paper, and then extract structured data from scanned or photographed paper forms (or digital PDFs) using AI. The extracted answers are mapped back to the original form structure, producing a unified response object that can be stored and processed alongside online submissions.

This approach is designed as a lightweight, open-source alternative to enterprise IDP solutions like Rossum, ABBYY FlexiCapture, and Hyperscience.

## Features

- **SurveyJS-first** — First-class adapter for SurveyJS JSON form definitions
- **Multi-provider LLMs** — OpenAI, Anthropic, Ollama (local models) out of the box
- **Intelligent extraction** — Text, checkboxes, tables, handwriting from scanned forms
- **Multi-page extraction** — Pass a PDF document or an ordered array of page images for multi-page paper forms
- **Native PDF extraction** — Pass digital PDFs or scanned-image PDFs directly to providers that support document inputs
- **QR / unique ID detection** — Automatic form identification from images
- **Confidence scoring** — Flag low-confidence fields for human review
- **Response merging** — Combine online + paper responses by unique ID
- **Schema-aware prompting** — LLM outputs validated against your form schema with Zod

## Installation

```bash
npm install ai-form-response-extractor
```

## Quick Start

```typescript
import { createExtractor } from 'ai-form-response-extractor';
import { openai } from 'ai-form-response-extractor/providers';
import { readFileSync } from 'fs';

// 1. Create an extractor with your preferred LLM provider
const extractor = createExtractor({
  provider: openai('gpt-4o'),
  adapter: 'surveyjs',
  options: {
    confidenceThreshold: 0.75,
    maxRetries: 2,
  }
});

// 2. Load your form input (scanned image(s) or native PDF) and form definition
const image = [
  readFileSync('./scanned-form-page-1.png'),
  readFileSync('./scanned-form-page-2.png'),
];
const formDefinition = JSON.parse(readFileSync('./survey.json', 'utf-8'));

// 3. Extract structured data from the provided form input
const result = await extractor.extractFromImage({
  image,
  formDefinition,
});

console.log(result.data);          // Structured responses matching schema
console.log(result.uniqueId);      // Detected QR / barcode ID
console.log(result.confidence);    // Per-field confidence scores

// Single-page forms are also supported:
// image: readFileSync('./scanned-form.png')

// Native PDF is also supported for providers with document input support:
// image: readFileSync('./digital-form.pdf')   // text-based (digital) PDF
// image: readFileSync('./scanned-form.pdf')   // PDF containing scanned page images
```

## PDF Provider Notes

Both **digital PDFs** (text/vector content) and **scanned-image PDFs** (pages stored as raster images inside a PDF container) are accepted. Pass either as a `Buffer` via `readFileSync()` — the library forwards the raw PDF bytes to the provider without rasterizing.

- OpenAI provider: supports native PDF input (digital and scanned-image PDFs).
- Anthropic provider: supports native PDF input (digital and scanned-image PDFs).
- Ollama provider: current API path is image-only and does not accept native PDF input.

## Switching Providers

```typescript
import { openai, anthropic, ollama } from 'ai-form-response-extractor/providers';

// OpenAI
createExtractor({ provider: openai('gpt-4o') });

// Anthropic
createExtractor({ provider: anthropic('claude-4-sonnet') });

// Local with Ollama (no API key needed)
createExtractor({ provider: ollama('llama-3.2-vision') });
```

## Standalone Utilities

```typescript
import { detectUniqueId, mergeResponses } from 'ai-form-response-extractor';

// Detect QR code or unique ID from an image
const id = await detectUniqueId(imageBuffer);

// Merge online and paper responses
const merged = mergeResponses(onlineResponses, paperExtractions);
```

## Adapters

| Adapter | Description |
|---------|-------------|
| `surveyjs` | Converts SurveyJS JSON into optimized LLM prompts |
| `json-schema` | Standard JSON Schema support |
| `custom` | Bring your own adapter via a simple interface |

## Per-field AI extraction hints

Add an optional `aiHint` to any field in your form definition to give the LLM per-field extraction guidance. The hint is appended to the generated prompt for that field and is **not** shown to end users (unlike `description`, which SurveyJS renders in the form UI).

```json
{
  "type": "radiogroup",
  "name": "insurance_type",
  "title": "1. MEDICARE / MEDICAID / TRICARE / CHAMPVA / GROUP HEALTH PLAN / FECA BLK LUNG / OTHER",
  "aiHint": "Box 1 has 7 small checkboxes in a single row. Each checkbox sits immediately to the LEFT of its label. Find the box containing an X or check mark and return the label printed directly to its right.",
  "choices": [
    { "value": "medicare", "text": "Medicare" },
    { "value": "medicaid", "text": "Medicaid" }
  ]
}
```

The SurveyJS adapter emits the hint as an extra `Hint:` line in the prompt. The JSON Schema adapter accepts `aiHint` on any property and prefers it over `description` when both are present.

You can also set `aiHint` at the **survey / schema root** for document-wide guidance that applies to every field — e.g., "This is a CMS-1500 paper form; all checkboxes are filled with X marks." It is rendered as a top-level `Hint:` line above the `Fields:` block.

```json
{
  "aiHint": "This is a CMS-1500 paper form; all checkboxes are filled with X marks.",
  "pages": [ ... ]
}
```

## Confidence Scores

Every extraction returns `result.confidence`, a `FieldConfidence[]` with one entry per schema field:

```ts
interface FieldConfidence {
  fieldName: string;
  value: unknown;
  confidence: number | null;   // null = "no signal" (see below)
  flagged: boolean;
}
```

- A **number in `[0, 1]`** — either reported by the LLM in its `_confidence` block, or `1.0` when the model returned a non-null value but no confidence for it.
- **`null`** — "no signal." The model returned the field as `null` (or omitted it) and did not report a confidence value for it. A `null` value usually means the model determined the field is blank on the form, *not* that it is uncertain — so the library does **not** fabricate a 0% score in this case.

Fields with `confidence === null` are never `flagged`, regardless of `confidenceThreshold`.

### Recommended consumer pattern

When aggregating confidence across many fields (e.g., an overall-confidence metric, or a "low-confidence fields" review list), exclude `null` confidences:

```ts
const scored = result.confidence.filter(c => c.confidence !== null);

const overallConfidence =
  scored.length === 0
    ? null
    : scored.reduce((sum, c) => sum + (c.confidence as number), 0) / scored.length;

const lowConfidenceFields = result.confidence.filter(c => c.flagged);
```

This keeps correctly-blank optional fields from dragging down the overall metric on forms with many optional or conditional fields (e.g., CMS-1500 claims, where ~30 of ~95 fields are legitimately blank on any given form).

The library nudges the model — via the system prompt — to report a confidence value even for `null` fields (use a high confidence when sure the field is blank, a low one when uncertain). When the model complies, the `null` confidence fallback rarely fires.

## Limitations

- Signature fields are not extracted as structured data because they represent a visual verification element rather than a semantically structured answer. In most survey workflows, signatures are treated as document evidence rather than data fields.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434`) |

## Demo

See the [ai-form-response-extractor-demo](https://github.com/surveyjs/ai-form-response-extractor-demo) repository for a full working demo.

## Documentation

- [SPEC.md](./SPEC.md) — Full project specification
- [npm](https://www.npmjs.com/package/ai-form-response-extractor)
- [docs/build-plan.md](./docs/build-plan.md) — Build plan and milestones
- [docs/architecture.md](./docs/architecture.md) — Architecture details
- [examples/](./examples/) — Working examples

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Contributing

Contributions are welcome! Please read the spec and build plan before starting work.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE)
