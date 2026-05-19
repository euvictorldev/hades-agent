import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Languages, Copy, Check } from 'lucide-react';
import { SusurroMessage } from '../../types';

interface MessageCardProps {
  msg: SusurroMessage;
  targetLanguageLabel: string;
  handleToggleMessageTranslation: (id: string) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

const MarkdownComponents = {
  p: ({ children }: any) => <span className="md-p">{children}</span>,
  div: ({ children }: any) => <span className="md-div">{children}</span>
};

/**
 * A fast typewriter hook to smooth out text arrival and scroll jumps.
 */
const useTypewriter = (text: string, active: boolean, speed = 10) => {
  const [visibleText, setVisibleText] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setVisibleText(text);
      return;
    }

    if (text === visibleText) return;

    // If text is shorter or significantly different, jump to it to avoid lag
    if (text.length < visibleText.length || !text.startsWith(visibleText.slice(0, Math.min(visibleText.length, 10)))) {
      setVisibleText(text);
      return;
    }

    // Type forward in small chunks for smoothness
    const timer = setTimeout(() => {
      const charsToAdd = Math.max(1, Math.ceil((text.length - visibleText.length) / 4));
      setVisibleText(text.slice(0, visibleText.length + charsToAdd));
    }, speed);

    return () => clearTimeout(timer);
  }, [text, visibleText, active, speed]);

  return visibleText;
};

/**
 * Component for displaying a single transcription/translation message card.
 */
export const MessageCard = React.memo(({ 
  msg, 
  targetLanguageLabel, 
  handleToggleMessageTranslation, 
  copiedId, 
  onCopy 
}: MessageCardProps) => {
  // When translated, we ONLY show the translatedText. 
  // If translatedText isn't ready yet, we show a subtle placeholder instead of English.
  const currentText = msg.isTranslated ? msg.translatedText : msg.text;
  const textToCopy = msg.isTranslated ? (msg.translatedText || "") : msg.text;
  
  const fallbackText = msg.pendingText ? "" : "...";
  const displayText = currentText || (msg.isTranslated ? (msg.isTranslating ? "Traduzindo..." : "") : fallbackText);

  const animatedText = useTypewriter(displayText, msg.isTranslated, 8);
  
  // Determine if we need a space before pending text
  const needsSpace = currentText && !currentText.endsWith(" ");

  return (
    <div className="message-bubble ia susurro-card">
      <div className="bubble-header">
        <div className="msg-time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="card-actions">
          <button
            className={`card-translate-btn ${msg.isTranslated ? 'active' : ''} ${msg.isTranslating ? 'loading' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleToggleMessageTranslation(msg.id); }}
            title={msg.isTranslated ? "Mostrar Original" : "Traduzir"}
          >
            <Languages size={14} />
          </button>
          <button
            className="card-copy-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(textToCopy, msg.id);
            }}
            title="Copiar texto"
          >
            {copiedId === msg.id ? <Check size={14} color="var(--accent-light)" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="bubble-text-content">
        <div className={`bubble-text-main ${msg.isTranslated ? 'translation-mode' : ''}`}>
          <div className="text-flow">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {animatedText}
            </ReactMarkdown>
            
            {/* 
              Only show deltas if NOT in translation mode. 
              The user wants to see only the translation when active.
            */}
            {!msg.isTranslated && msg.pendingText && (
              <span className="live-text">
                {needsSpace ? " " : ""}
                {msg.pendingText.split(/(\s+)/).filter(Boolean).map((segment, i) => (
                  /\s+/.test(segment) ? segment : <span key={`${msg.id}-delta-${i}`} className="delta-flash">{segment}</span>
                ))}
              </span>
            )}
          </div>
        </div>

        {msg.isTranslated && (
          <div className="translation-tag">
            {msg.isTranslating && <span className="translating-dot" />}
            Traduzido para {targetLanguageLabel}
          </div>
        )}
      </div>
    </div>
  );
});

MessageCard.displayName = 'MessageCard';
