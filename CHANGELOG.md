# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.9] - 2026-05-28

### Changed

- **Date field extraction (SurveyJS adapter)** — Text fields with `inputType: "date"` now generate a stronger prompt instruction that tells the model to convert any handwritten or printed date format (e.g. "March 14, 1992", "14/03/1992") to ISO `YYYY-MM-DD`, and to always return a visible date rather than leaving it blank because of its formatting. Previously the terse `(YYYY-MM-DD)` hint led some models to drop long-form handwritten dates, requiring a per-field `aiHint` as a workaround.

- **Confidence scoring for null values** — When the model returns a field as `null` and does **not** report a confidence value for it, `FieldConfidence.confidence` is now `null` ("no signal") instead of `0`. This stops correctly-blank fields from being scored as 0% confident and from being marked as `flagged`. Fields with `confidence === null` are never flagged regardless of `confidenceThreshold`. The system prompt has also been strengthened to ask the model to report a confidence value for every field — including null values — so the fallback rarely fires in practice.

  **Minor breaking change** — `FieldConfidence.confidence` is now typed `number | null` instead of `number`. Consumers that compute aggregate confidence metrics or build "low confidence fields" review lists should filter out entries where `confidence === null` rather than treating them as `0`. See the README "Confidence Scores" section for the recommended pattern.

## [0.1.0] - 2026-04-15

### Added

- **Core extraction pipeline** — `createExtractor()` with schema-aware prompting, structured JSON output parsing, retry logic, and confidence scoring
- **SurveyJS adapter** — First-class conversion of SurveyJS JSON form definitions into optimized LLM prompts with Zod output validation
- **JSON Schema adapter** — Standard JSON Schema support for prompt generation and output validation
- **Custom adapter support** — Simple `FormAdapter` interface for user-defined mappings
- **OpenAI provider** — `openai()` factory supporting GPT-4o and other vision models
- **Anthropic provider** — `anthropic()` factory supporting Claude 4 Sonnet and other models
- **Ollama provider** — `ollama()` factory for local vision models (llama-3.2-vision, qwen2-vl, etc.)
- **QR / unique ID detection** — `detectUniqueId()` standalone utility using jsQR
- **Response merging** — `mergeResponses()` utility to combine online and paper-extracted responses with configurable conflict resolution (prefer-online, prefer-paper, highest-confidence)
- **Confidence scoring** — Per-field confidence values with configurable threshold and automatic flagging of low-confidence fields
- **Cost tracking** — Optional token usage and cost metadata in extraction results
- **Image preprocessing** — Optional resize and normalize via sharp (graceful fallback when unavailable)
- **Multi-format image input** — Support for Buffer, Uint8Array, file paths, HTTP URLs, and base64 data URLs
- **Subpath exports** — `ai-form-response-extractor/providers` for tree-shakeable provider imports
- **Dual CJS/ESM build** — Full CommonJS, ES Module, and TypeScript declaration output
