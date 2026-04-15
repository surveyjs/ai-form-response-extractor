# Milestone 7 — Finalize Build, Test, Publish

## Goal
Finalize the project for the v0.1.0 npm release.

## Instructions

### Test Coverage
- Review all source files and identify untested code paths
- Add missing edge-case tests to reach 80%+ coverage across all files
- Run `npm run test -- --coverage` and verify coverage thresholds:
  - Statements: ≥ 80%
  - Branches: ≥ 75%
  - Functions: ≥ 80%
  - Lines: ≥ 80%

### Build Verification
- Run `npm run build` and verify output:
  - `dist/index.js` (CJS) exists and is valid
  - `dist/index.mjs` (ESM) exists and is valid
  - `dist/index.d.ts` (types) exists
  - `dist/providers/index.js`, `dist/providers/index.mjs`, `dist/providers/index.d.ts` exist
- Verify exports work:
  - `const { createExtractor } = require('hybrid-form-ai')` — CJS
  - `import { createExtractor } from 'hybrid-form-ai'` — ESM
  - `import { openai } from 'hybrid-form-ai/providers'` — subpath export
- Verify TypeScript types resolve correctly for consumers

### Pre-publish Checklist
- [ ] All tests pass: `npm run test`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Coverage ≥ 80%: `npm run test -- --coverage`
- [ ] `package.json` version is `0.1.0`
- [ ] `package.json` `files` field includes only `dist`, `README.md`, `LICENSE`
- [ ] README.md has accurate installation and usage examples
- [ ] No secrets or API keys in committed code
- [ ] `.gitignore` excludes `node_modules/`, `dist/`, `.env`

### CHANGELOG
- Create `CHANGELOG.md` with the v0.1.0 entry listing all features:
  - Core extraction pipeline
  - SurveyJS adapter
  - JSON Schema adapter
  - Custom adapter support
  - OpenAI, Anthropic, Ollama providers
  - QR / unique ID detection
  - Response merging utility
  - Confidence scoring
  - Cost tracking

### CI Validation
- Push to a branch and verify the GitHub Actions CI pipeline:
  - Lint & typecheck job passes
  - Test job passes on Node 18, 20, 22
  - Build job passes and verifies dist output
  - Coverage artifact is uploaded

### Files to Create/Modify
- Create `CHANGELOG.md`
- Update `vitest.config.ts` with coverage thresholds if desired
- Fix any failing tests or type errors found during review
- Update `README.md` if any API changes were made during implementation

### Acceptance Criteria
- All CI jobs green
- Coverage ≥ 80%
- Build produces valid CJS + ESM + types output
- Package is ready for `npm publish`
