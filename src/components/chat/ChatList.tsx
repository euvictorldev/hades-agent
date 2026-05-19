import React from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '../../types';

interface ChatListProps {
  messages: ChatMessage[];
  pendingMessages: ChatMessage[];
  isThinking: boolean;
  activeTool: string | null;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Component to render the list of chat messages, including thinking state and pending messages.
 */
export const ChatList: React.FC<ChatListProps> = ({
  messages,
  pendingMessages,
  isThinking,
  activeTool,
  copiedId,
  onCopy,
  chatEndRef
}) => {
  return (
    <div className="chat-content">
      {messages.length === 0 && pendingMessages.length === 0 ? (
        <div className="empty-state">Nenhuma mensagem ativa...</div>
      ) : (
        <div className="messages-list">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              copiedId={copiedId} 
              onCopy={onCopy} 
            />
          ))}

          {isThinking && (
            <ThinkingIndicator activeTool={activeTool} />
          )}

          {pendingMessages.map(pm => (
            <MessageBubble 
              key={pm.id} 
              message={pm} 
              copiedId={copiedId} 
              onCopy={onCopy} 
            />
          ))}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
};

/**
 * Sub-component for the AI thinking animation and tool usage info.
 */
const ThinkingIndicator: React.FC<{ activeTool: string | null }> = ({ activeTool }) => (
  <div className="message-bubble ia thinking-indicator">
    <div className="flex items-center gap-2 text-red-500">
      <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      {activeTool ? (
        <span className="glint-text text-red-500">Usando: <code className="text-red-400 bg-red-400/10 px-1 rounded" style={{ WebkitTextFillColor: 'initial' }}>{activeTool}</code></span>
      ) : (
        <span className="glint-text text-red-500">Pensando...</span>
      )}
    </div>
  </div>
);

