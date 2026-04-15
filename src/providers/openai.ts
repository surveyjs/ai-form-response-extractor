import type { LLMProvider, ProviderFactory } from './base';

/**
 * OpenAI provider factory.
 *
 * @example
 * ```typescript
 * import { openai } from 'hybrid-form-ai/providers';
 * const provider = openai('gpt-4o');
 * ```
 */
export const openai: ProviderFactory = (model = 'gpt-4o', _options = {}) => {
  const provider: LLMProvider = {
    name: 'openai',
    model,
    async extractFromImage(_params) {
      // TODO: Implement using openai SDK
      throw new Error('OpenAI provider not yet implemented');
    },
  };
  return provider;
};
