import { createExtractor } from 'hybrid-form-ai';
import { ollama } from 'hybrid-form-ai/providers';
import type { FormAdapter } from 'hybrid-form-ai';

// Custom adapter for a simple field list format
const myAdapter: FormAdapter = {
  name: 'my-custom-adapter',

  toPrompt(formDefinition: Record<string, unknown>): string {
    const fields = formDefinition.fields as Array<{ name: string; label: string; type: string }>;
    const lines = fields.map(
      (f) => `- "${f.label}" (${f.type}): extract the value for field "${f.name}"`
    );
    return [
      'Extract the following fields from the form image:',
      ...lines,
      '',
      'Return a JSON object with field names as keys.',
    ].join('\n');
  },

  toOutputSchema(formDefinition: Record<string, unknown>): Record<string, unknown> {
    const fields = formDefinition.fields as Array<{ name: string; type: string }>;
    const properties: Record<string, unknown> = {};
    for (const f of fields) {
      properties[f.name] = { type: f.type === 'number' ? 'number' : 'string' };
    }
    return { type: 'object', properties };
  },
};

async function main() {
  const extractor = createExtractor({
    provider: ollama('llama-3.2-vision'),
    adapter: 'custom',
    customAdapter: myAdapter,
  });

  const formDefinition = {
    fields: [
      { name: 'patientName', label: 'Patient Name', type: 'text' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { name: 'temperature', label: 'Temperature (°F)', type: 'number' },
    ],
  };

  // In production, this would be a real scanned image
  const result = await extractor.extractFromImage({
    image: Buffer.from('placeholder'),
    formDefinition,
  });

  console.log(result.data);
}

main().catch(console.error);
