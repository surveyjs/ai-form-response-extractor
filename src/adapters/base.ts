/**
 * Common interface for form adapters.
 * Adapters convert a form definition into an LLM-friendly prompt.
 */
export interface FormAdapter {
  readonly name: string;

  /**
   * Convert a form definition object into a structured text prompt
   * describing the fields, types, choices, and constraints.
   */
  toPrompt(formDefinition: Record<string, unknown>): string;

  /**
   * Return a Zod-compatible schema description for validating LLM output.
   */
  toOutputSchema(formDefinition: Record<string, unknown>): Record<string, unknown>;
}
