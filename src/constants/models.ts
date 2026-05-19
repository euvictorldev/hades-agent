/**
 * AI Model definitions and configuration.
 */

export const MODELS = [
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
] as const;

export const DEFAULT_MODEL = 'gemini-2.5-flash';

export type AIModel = (typeof MODELS)[number]['id'];
