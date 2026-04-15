# Milestone 4 — Image Utilities

## Goal
Implement image loading, preprocessing, and QR/unique ID detection utilities.

## Instructions

### Image Utilities (`src/utils/image.ts`)

**`imageToBase64(input)` method:**
- Accept `Buffer`, `Uint8Array`, file path (string), or URL (string starting with `http://` or `https://`)
- For Buffer/Uint8Array: convert directly to base64
- For file path: read with `fs.readFile` and convert to base64
- For URL: fetch with `fetch()` and convert response buffer to base64
- Detect MIME type from the first bytes (magic numbers):
  - PNG: `\x89PNG`
  - JPEG: `\xFF\xD8\xFF`
  - WebP: `RIFF....WEBP`
  - GIF: `GIF8`
- Return a data URL string: `data:{mime};base64,{data}`
- Throw descriptive error for unsupported formats

**`preprocessImage(input)` method:**
- Try to dynamically import `sharp` (`await import('sharp')`)
- If sharp is not available, return the raw image buffer unchanged (graceful fallback)
- If sharp is available:
  - Resize images over 2048px on the longest side (preserving aspect ratio)
  - Normalize/enhance contrast for better LLM readability
  - Convert to PNG output
  - Return the processed buffer
- Accept the same input types as `imageToBase64()`

### QR / Unique ID Detection (`src/utils/qr.ts`)

**`detectUniqueId(image)` method:**
- Install and use `jsqr` package for QR code detection
- Convert the input image to raw RGBA pixel data (use sharp if available, or a lightweight fallback)
- Pass pixel data to jsQR for QR code scanning
- If QR code found: return `{ id: decodedText, source: 'qr', confidence: 1.0 }`
- If no QR code found, try regex patterns for common ID formats in any detected text:
  - UUID pattern: `/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i`
  - Numeric ID: `/\b(?:ID|REF|#)\s*:?\s*(\d{4,})\b/i`
- If nothing found: return `{ id: null, source: null, confidence: 0 }`

### Dependencies
- Add `jsqr` as a regular dependency in package.json
- `sharp` remains an optional peer dependency

### Unit Tests (`src/utils/__tests__/`)
- `image.test.ts`:
  - Test `imageToBase64()` with Buffer input (create a minimal valid PNG in code)
  - Test `imageToBase64()` with Uint8Array input
  - Test MIME type detection for PNG, JPEG
  - Test error on unsupported format
  - Test `preprocessImage()` graceful fallback when sharp is unavailable (mock dynamic import to reject)
- `qr.test.ts`:
  - Test `detectUniqueId()` with a QR code image fixture (or mock jsQR)
  - Test fallback to null when no QR found
  - Test regex ID detection patterns

### Files to Modify
- `src/utils/image.ts`
- `src/utils/qr.ts`
- `src/utils/index.ts`
- `package.json` (add `jsqr` dependency)
- Create `src/utils/__tests__/image.test.ts`
- Create `src/utils/__tests__/qr.test.ts`

### Acceptance Criteria
- `imageToBase64()` handles all four input types correctly
- MIME detection works for PNG, JPEG, WebP, GIF
- `preprocessImage()` works with sharp and degrades gracefully without it
- `detectUniqueId()` detects QR codes from images
- `npm run test` passes
- `npm run typecheck` passes
- `npm run lint` passes
