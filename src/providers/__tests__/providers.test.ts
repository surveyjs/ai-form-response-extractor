import { describe, it, expect } from 'vitest';
import { openai } from '../openai';
import { anthropic } from '../anthropic';
import { ollama } from '../ollama';

describe('Provider factories', () => {
  it('openai returns a provider with correct name and model', () => {
    const provider = openai('gpt-4o');
    expect(provider.name).toBe('openai');
    expect(provider.model).toBe('gpt-4o');
    expect(typeof provider.extractFromImage).toBe('function');
  });

  it('anthropic returns a provider with correct name and model', () => {
    const provider = anthropic('claude-4-sonnet');
    expect(provider.name).toBe('anthropic');
    expect(provider.model).toBe('claude-4-sonnet');
  });

  it('ollama returns a provider with correct name and model', () => {
    const provider = ollama('llama-3.2-vision');
    expect(provider.name).toBe('ollama');
    expect(provider.model).toBe('llama-3.2-vision');
  });
});
