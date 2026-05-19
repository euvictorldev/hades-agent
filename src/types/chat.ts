/**
 * Unified types for chat and persona management.
 */

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
}

/**
 * Message structure for the MiniChat component.
 */
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ia';
  timestamp: Date;
  status?: 'sent' | 'pending' | 'error';
  image?: string;
}

export type MenuView = 'main' | 'personas' | 'volume' | 'language' | 'models';
