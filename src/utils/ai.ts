import { ChatMessage } from '../types';

/**
 * Prepares the message payload for the Gemini API.
 */
export const prepareGeminiPayload = (systemPrompt: string, history: ChatMessage[]) => {
  return [
    { role: 'user', parts: [{ text: `System: ${systemPrompt}` }] },
    ...history.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [
        { text: m.text },
        ...(m.image ? [{ inline_data: { mime_type: "image/png", data: m.image.split(',')[1] } }] : [])
      ]
    }))
  ];
};

/**
 * Processes Gemini API response parts.
 */
export const processGeminiParts = (parts: any[]) => {
  const textContent = parts.map((p: any) => p.text).filter(Boolean).join('\n');
  const functionCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
  
  return { textContent, functionCalls };
};
