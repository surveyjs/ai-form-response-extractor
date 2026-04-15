# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-15

### Added

- **Core extraction pipeline** — `createExtractor()` with retry logic, schema validation, and structured output
- **SurveyJS adapter** — First-class support for SurveyJS JSON form definitions (`adapter: 'surveyjs'`)
- **JSON Schema adapter** — Standard JSON Schema support (`adapter: 'json-schema'`)
- **Custom adapter support** — Bring-your-own adapter via the `FormAdapter` interface (`adapter: 'custom'`)
- **OpenAI provider** — GPT-4o and other OpenAI vision models (`openai()`)
- **Anthropic provider** — Claude vision models (`anthropic()`)
- **Ollama provider** — Local vision models via Ollama (`ollama()`)
- **QR / unique ID detection** — Automatic form identification from QR codes together with UUID and numeric ID text pattern fallback
- **Response merging utility** — `mergeResponses()` placeholder for combining online + paper responses by unique ID
- **Confidence scoring** — Per-field confidence scores with configurable threshold and flagging
- **Cost tracking** — Optional token usage and cost metadata via `logCosts` option
- **Image preprocessing** — Optional resize and contrast normalization via sharp (when available)
- **Subpath exports** — `hybrid-form-ai/providers` for tree-shakeable provider imports
