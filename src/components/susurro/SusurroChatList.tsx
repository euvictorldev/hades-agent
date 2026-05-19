import React from 'react';
import { SusurroMessage } from '../../types';
import { MessageCard } from './MessageCard';

interface SusurroChatListProps {
  messages: SusurroMessage[];
  targetLanguageLabel: string;
  handleToggleMessageTranslation: (id: string) => void;
  copiedId: string | null;
  copyToClipboard: (id: string, text: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * SusurroChatList: Handles the rendering of the message list and auto-scrolling logic.
 * Extracted from Susurro.tsx to maintain the 300-line limit and improve readability.
 */
export const SusurroChatList: React.FC<SusurroChatListProps> = ({
  messages,
  targetLanguageLabel,
  handleToggleMessageTranslation,
  copiedId,
  copyToClipboard,
  chatEndRef,
  handleScroll
}) => {
  return (
    <div 
      className="susurro-content" 
      onScroll={handleScroll}
    >
      <div className="messages-container">
        {messages.map(msg => (
          <MessageCard 
            key={msg.id}
            msg={msg}
            targetLanguageLabel={targetLanguageLabel}
            handleToggleMessageTranslation={handleToggleMessageTranslation}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
