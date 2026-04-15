import type { LLMProvider, ProviderFactory } from './base';

/**
 * Anthropic provider factory.
 *
 * @example
 * ```typescript
 * import { anthropic } from 'hybrid-form-ai/providers';
 * const provider = anthropic('claude-4-sonnet');
 * ```
 */
export const anthropic: ProviderFactory = (model = 'claude-4-sonnet', _options = {}) => {
  const provider: LLMProvider = {
    name: 'anthropic',
    model,
    async extractFromImage(_params) {
      // TODO: Implement using @anthropic-ai/sdk
      throw new Error('Anthropic provider not yet implemented');
    },
  };
  return provider;
};
