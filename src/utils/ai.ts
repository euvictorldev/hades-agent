import { ChatMessage } from '../types';

/**
 * Prepares the message payload for the Gemini API.
 * Implements sliding window (keeps last 10 messages) to prevent context bloat.
 */
export const prepareGeminiPayload = (systemPrompt: string, history: ChatMessage[]) => {
  // Poda o histórico para evitar o efeito bola de neve (Phase 2 - Abstractive Compression/Sliding Window)
  const PRUNED_LIMIT = 10;
  const prunedHistory = history.length > PRUNED_LIMIT ? history.slice(-PRUNED_LIMIT) : history;

  return [
    { role: 'user', parts: [{ text: `System: ${systemPrompt}` }] },
    ...prunedHistory.map(m => {
      let messageText = m.text;
      
      // Aggressive truncation for long AI messages to save tokens (Phase 2)
      if (m.sender !== 'user' && messageText.length > 400) {
        messageText = messageText.substring(0, 400) + "\n...[Histórico truncado para economizar tokens]";
      }

      return {
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [
          { text: messageText },
          ...(m.image ? [{ inline_data: { mime_type: "image/png", data: m.image.split(',')[1] } }] : [])
        ]
      };
    })
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
