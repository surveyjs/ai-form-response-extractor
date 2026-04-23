# Milestone 2 — Provider Layer

## Goal
Implement the LLM provider layer with OpenAI, Anthropic, and Ollama support.

## Instructions

Implement the LLM provider layer for `ai-form-response-extractor`.

### OpenAI Provider (`src/providers/openai.ts`)
Implement the `extractFromImage` method using the `openai` npm package:
- Send the image as a base64 data URL in a chat completion request using `client.chat.completions.create()`
- Use `response_format: { type: "json_object" }` to enforce JSON output
- Build the messages array with a system prompt and a user message containing both text (the prompt) and an image_url content part
- Read API key from `OPENAI_API_KEY` environment variable
- Return the content string and usage (promptTokens, completionTokens, totalTokens) in `LLMResponse` shape
- Handle API errors gracefully with descriptive error messages

### Anthropic Provider (`src/providers/anthropic.ts`)
Implement using `@anthropic-ai/sdk`:
- Use the messages API with an image content block (`type: "image"`, `source.type: "base64"`)
- Read API key from `ANTHROPIC_API_KEY` environment variable
- Normalize the response into `LLMResponse` shape
- Handle API errors gracefully

### Ollama Provider (`src/providers/ollama.ts`)
Implement using plain `fetch` against the Ollama REST API:
- POST to `${OLLAMA_BASE_URL}/api/chat` (default: `http://localhost:11434/api/chat`)
- Send the image as base64 in the `images` array of the message
- Read base URL from `OLLAMA_BASE_URL` environment variable
- Normalize the response into `LLMResponse` shape
- Handle connection errors gracefully (Ollama may not be running)

### Base Interface (`src/providers/base.ts`)
Finalize the `LLMProvider` and `LLMResponse` interfaces if changes are needed. Ensure the interface is clean and minimal.

### Unit Tests (`src/providers/__tests__/`)
- Add tests for each provider using `vi.mock()` to mock SDK calls
- Verify correct request shape sent to each API
- Verify response normalization into `LLMResponse`
- Test error handling (invalid API key, network errors, rate limits)
- Test that environment variables are read correctly

### Key Decisions
- Use official SDKs (`openai`, `@anthropic-ai/sdk`) as optional peer dependencies
- Ollama uses plain `fetch` — no extra dependency needed
- Each provider normalizes its response into the common `LLMResponse` shape
- API keys are read from environment variables, never hardcoded

### Files to Modify
- `src/providers/base.ts`
- `src/providers/openai.ts`
- `src/providers/anthropic.ts`
- `src/providers/ollama.ts`
- `src/providers/index.ts`
- `src/providers/__tests__/providers.test.ts` (expand existing)

### Acceptance Criteria
- All three providers implement `LLMProvider` interface
- `vi.mock()` tests pass for each provider
- Error cases are handled with clear messages
- `npm run test` passes
- `npm run typecheck` passes
- `npm run lint` passes
