import type { FormAdapter } from './base';

/**
 * SurveyJS adapter — converts SurveyJS JSON form definitions
 * into descriptive LLM prompts and output schemas.
 */
export class SurveyJSAdapter implements FormAdapter {
  readonly name = 'surveyjs';

  toPrompt(_formDefinition: Record<string, unknown>): string {
    // TODO: Walk SurveyJS pages/panels/questions and build a prompt
    // describing each field's title, type, choices, validators, etc.
    throw new Error('SurveyJS adapter not yet implemented');
  }

  toOutputSchema(_formDefinition: Record<string, unknown>): Record<string, unknown> {
    // TODO: Build a Zod-compatible schema from SurveyJS question types
    throw new Error('SurveyJS adapter not yet implemented');
  }
}
