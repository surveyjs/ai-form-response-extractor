# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Subpath exports** — `hybrid-form-ai/providers` for tree-shakeable provider imports
- **Dual CJS/ESM build** — Full CommonJS, ES Module, and TypeScript declaration output
