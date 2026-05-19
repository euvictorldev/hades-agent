/**
 * Specialized types for the Susurro (transcription/translation) component.
 */

export interface SusurroMessage {
  id: string;
  text: string;
  pendingText?: string;
  translatedText?: string;
  lastTranslatedText?: string;
  lastTranslatedLang?: string;
  isTranslated: boolean;
  isTranslating: boolean;
  timestamp: Date;
  updateCount: number;
}
