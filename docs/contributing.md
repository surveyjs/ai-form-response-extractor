# Contributing Guide

**Project:** ai-form-response-extractor

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/my-feature`

## Development Workflow

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint
```

## Project Structure

```
src/
├── core/         # Extraction engine and types
├── providers/    # LLM provider implementations
├── adapters/     # Form definition adapters
├── utils/        # Image, QR, and merging utilities
└── index.ts      # Public API exports
```

## Adding a New LLM Provider

1. Create `src/providers/your-provider.ts`
2. Implement the `LLMProvider` interface from `./base.ts`
3. Export a factory function matching the `ProviderFactory` type
4. Add the export to `src/providers/index.ts`
5. Add tests in `src/providers/__tests__/your-provider.test.ts`
6. Document any required environment variables in README.md

## Adding a New Adapter

1. Create `src/adapters/your-adapter.ts`
2. Implement the `FormAdapter` interface from `./base.ts`
3. Implement `toPrompt()` and `toOutputSchema()`
4. Add the export to `src/adapters/index.ts`
5. Add tests with sample form definitions

## Testing

- Use `vitest` for all tests
- Mock external API calls (LLM providers)
- Include sample form definitions and expected outputs
- Target 80%+ code coverage

## Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Maintenance

## Pull Requests

- Reference related issues
- Include tests for new functionality
- Update documentation as needed
- Ensure CI passes before requesting review
