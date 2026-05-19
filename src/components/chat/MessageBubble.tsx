import React from 'react';
import { Check } from 'lucide-react';
import { ChatMessage } from '../../types';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  message: ChatMessage;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

/**
 * Individual message bubble component with support for text and images.
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  copiedId,
  onCopy
}) => {
  return (
    <div className={`message-bubble ${message.sender} ${message.status === 'pending' ? 'pending' : ''}`}>
      {message.image && (
        <div className="message-image">
          <img
            src={message.image}
            alt="Attachment"
            onLoad={() => console.log(`[CHAT] Imagem carregada para msg: ${message.id}`)}
            onError={(e) => console.error(`[CHAT] Erro ao carregar imagem para msg: ${message.id}`, e)}
          />
        </div>
      )}
      
      <MessageContent text={message.text} />
      
      {message.sender === 'ia' && (
        <button 
          className="copy-btn" 
          onClick={() => onCopy(message.text, message.id)}
        >
          {copiedId === message.id ? <Check size={12} /> : <span className="copy-text">Copiar</span>}
        </button>
      )}
      
      {message.status === 'pending' && <div className="status-label pending">Pendente</div>}
    </div>
  );
};
