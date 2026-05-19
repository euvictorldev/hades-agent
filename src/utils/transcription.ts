import { SusurroMessage } from '../types';

/**
 * Updates a message object with new transcription deltas.
 * Implements a stable concatenation strategy that respects the API's meticulous spacing.
 */
export const updateMessageWithDeltas = (
  messages: SusurroMessage[], 
  index: number, 
  deltas: { text: string, isFinal: boolean }[]
): SusurroMessage[] => {
  const newMessages = [...messages];
  let msg = { ...newMessages[index] };

  deltas.forEach(delta => {
    // The Gemini Live API sends text segments that include their own leading/trailing spaces.
    // We must concatenate them directly without adding extra spaces or aggressive trimming.
    const currentFullText = (msg.text || "") + (msg.pendingText || "");
    const updatedText = currentFullText + delta.text;

    if (delta.isFinal) {
      // Merge into final text and clear pending
      msg = { 
        ...msg, 
        text: updatedText,
        pendingText: "", 
        updateCount: msg.updateCount + 1 
      };
    } else {
      // For real-time updates, we keep the content in pendingText to show it immediately.
      // We avoid splitting by words here to preserve the exact character stream from the API.
      msg.text = "";
      msg.pendingText = updatedText;
      msg.updateCount += 1;
    }
  });

  newMessages[index] = msg;
  return newMessages;
};

/**
 * Calculates the total characters in a list of deltas.
 */
export const calculateDeltaLength = (deltas: { text: string, isFinal: boolean }[]) => {
  return deltas.reduce((acc, d) => acc + d.text.length, 0);
};
