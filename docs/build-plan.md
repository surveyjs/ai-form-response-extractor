# Build Plan

**Project:** hybrid-form-ai  
**Created:** April 15, 2026  
**Status:** Phase 1 — MVP

---

## Phase 1: MVP (Core Functionality)

### Milestone 1 — Project Scaffolding ✅
- [x] Initialize repo with LICENSE
- [x] Create SPEC.md
- [x] Create README.md
- [x] Set up package.json, tsconfig.json
- [x] Create directory structure with stubs

### Milestone 2 — Provider Layer
- [ ] Implement `providers/base.ts` interface (finalize)
- [ ] Implement OpenAI provider (`gpt-4o` vision API)
- [ ] Implement Anthropic provider (`claude-4-sonnet` vision API)
- [ ] Implement Ollama provider (local REST API)
- [ ] Unit tests for each provider (mocked API calls)
- [ ] Provider integration tests (optional, requires API keys)

**Key Decisions:**
- Use official SDKs (`openai`, `@anthropic-ai/sdk`) as optional peer dependencies
- Ollama uses plain `fetch` — no extra dependency
- Each provider normalizes response into `LLMResponse` shape

### Milestone 3 — Adapter Layer
- [ ] Implement SurveyJS adapter (prompt generation)
  - Parse pages, panels, questions
  - Map question types to human-readable descriptions
  - Include choices, validators, required constraints
- [ ] Implement SurveyJS adapter (output schema generation)
  - Map SurveyJS types to Zod schemas
- [ ] Implement JSON Schema adapter (basic)
- [ ] Unit tests with sample SurveyJS forms

**Key Decisions:**
- Prompts should include field names, types, options, and ordering
- Output schema must match the structure consumers expect from SurveyJS results

### Milestone 4 — Image Utilities
- [ ] Implement `imageToBase64()` — normalize Buffer/Uint8Array/path/URL
- [ ] Implement `preprocessImage()` — resize, contrast enhancement (sharp)
- [ ] Implement QR / barcode detection
- [ ] Implement fallback text-based ID detection (regex patterns)
- [ ] Unit tests for image utilities

**Key Decisions:**
- `sharp` is an optional peer dependency — graceful fallback without it
- QR detection: evaluate `jsQR` (pure JS) vs. delegating to LLM

### Milestone 5 — Core Extraction Pipeline
- [ ] Wire up `createExtractor()` end-to-end
  - Select adapter based on config
  - Preprocess image (optional)
  - Detect unique ID
  - Generate prompt via adapter
  - Call LLM provider
  - Parse JSON from LLM response
  - Validate with Zod schema from adapter
  - Compute per-field confidence scores
- [ ] Handle retries on malformed LLM output
- [ ] Cost tracking / usage metadata
- [ ] Integration tests with sample images + forms

### Milestone 6 — Response Merging
- [ ] Implement `mergeResponses()` with conflict resolution strategies
  - `prefer-online` (default)
  - `prefer-paper`
  - `highest-confidence`
- [ ] Unit tests for merge logic

### Milestone 7 — Build, Test, Publish
- [ ] Configure tsup for dual CJS/ESM output
- [ ] Configure vitest
- [ ] ESLint config
- [ ] CI pipeline (GitHub Actions)
- [ ] Write comprehensive tests (target 80%+ coverage)
- [ ] Publish to npm as `hybrid-form-ai@0.1.0`

---

## Phase 2: Enhancements

### Batch Processing
- [ ] `extractor.extractBatch()` for multiple images
- [ ] Concurrency control and rate limiting

### Additional Providers
- [ ] Google Gemini provider
- [ ] Mistral provider
- [ ] Grok (xAI) provider

### REST API Example
- [ ] Express/Fastify example server
- [ ] Dockerfile for self-hosting
- [ ] Docker Compose with Ollama

### Human-in-the-Loop
- [ ] Review interface stub / webhook
- [ ] Flag low-confidence results for manual review

### Performance
- [ ] Prompt caching for repeated form definitions
- [ ] Image preprocessing benchmarks
- [ ] Model comparison benchmarks (cost vs. accuracy)

---

## Dependency Summary

| Package | Type | Purpose |
|---------|------|---------|
| `zod` | dependency | Output validation |
| `openai` | optional peer | OpenAI SDK |
| `@anthropic-ai/sdk` | optional peer | Anthropic SDK |
| `sharp` | optional peer | Image preprocessing |
| `typescript` | dev | TypeScript compiler |
| `tsup` | dev | Build tool |
| `vitest` | dev | Testing |
| `eslint` | dev | Linting |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM output format inconsistency | High | Medium | Retry with stricter prompt; Zod validation |
| Handwriting recognition accuracy | Medium | High | Confidence scoring + human review fallback |
| QR code detection failures (crumpled/faded paper) | Medium | Medium | Multiple detection strategies; fallback to text ID |
| API cost overruns during development | Low | Low | Use `gpt-4o-mini` and Ollama for testing |
| Sharp installation issues on some platforms | Medium | Low | Make sharp optional with graceful fallback |
