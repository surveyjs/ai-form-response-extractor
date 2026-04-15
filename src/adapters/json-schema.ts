import type { FormAdapter } from './base';

/**
 * JSON Schema adapter — converts standard JSON Schema form definitions
 * into LLM prompts and output schemas.
 */
export class JsonSchemaAdapter implements FormAdapter {
  readonly name = 'json-schema';

  toPrompt(_formDefinition: Record<string, unknown>): string {
    // TODO: Convert JSON Schema properties into prompt descriptions
    throw new Error('JSON Schema adapter not yet implemented');
  }

  toOutputSchema(_formDefinition: Record<string, unknown>): Record<string, unknown> {
    // TODO: Map JSON Schema types to Zod schema
    throw new Error('JSON Schema adapter not yet implemented');
  }
}
