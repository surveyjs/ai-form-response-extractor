import { createExtractor } from 'ai-form-response-extractor';
import { openai } from 'ai-form-response-extractor/providers';
import { readFileSync } from 'fs';

// Sample SurveyJS form definition
const surveyJson = {
  title: 'Customer Feedback',
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'fullName',
          title: 'Full Name',
          isRequired: true,
        },
        {
          type: 'text',
          name: 'email',
          title: 'Email Address',
          inputType: 'email',
        },
        {
          type: 'rating',
          name: 'satisfaction',
          title: 'How satisfied are you with our service?',
          rateMin: 1,
          rateMax: 5,
        },
        {
          type: 'radiogroup',
          name: 'recommend',
          title: 'Would you recommend us?',
          choices: ['Yes', 'No', 'Maybe'],
        },
        {
          type: 'comment',
          name: 'feedback',
          title: 'Additional comments',
        },
      ],
    },
  ],
};

async function main() {
  const extractor = createExtractor({
    provider: openai('gpt-4o'),
    adapter: 'surveyjs',
    options: {
      confidenceThreshold: 0.75,
      logCosts: true,
    },
  });

  // Load a scanned form image
  const image = readFileSync('./scanned-form.png');

  const result = await extractor.extractFromImage({
    image,
    formDefinition: surveyJson,
  });

  console.log('Extracted data:', JSON.stringify(result.data, null, 2));
  console.log('Unique ID:', result.uniqueId);
  console.log('Confidence:', result.confidence);

  if (result.usage) {
    console.log('Usage:', result.usage);
  }
}

main().catch(console.error);
