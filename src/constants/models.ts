/**
 * AI Model definitions and configuration.
 */

export const MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'NEW' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', tag: 'Thinking' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', tag: 'Fast' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'Thinking' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast' }
] as const;

export const DEFAULT_MODEL = 'gemini-2.5-flash';

export type AIModel = (typeof MODELS)[number]['id'];

/**
 * Maps frontend-friendly model IDs to actual Google Generative AI API models.
 * With the official 2026 models natively supported, this returns the ID directly.
 */
export const mapModelIdToApiName = (modelId: string): string => {
  return modelId;
};
