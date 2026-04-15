import type { LLMProvider, ProviderFactory } from './base';

/**
 * Ollama provider factory (local vision models).
 *
 * @example
 * ```typescript
 * import { ollama } from 'hybrid-form-ai/providers';
 * const provider = ollama('llama-3.2-vision');
 * ```
 */
export const ollama: ProviderFactory = (model = 'llama-3.2-vision', _options = {}) => {
  const provider: LLMProvider = {
    name: 'ollama',
    model,
    async extractFromImage(_params) {
      // TODO: Implement using Ollama REST API
      throw new Error('Ollama provider not yet implemented');
    },
  };
  return provider;
};
