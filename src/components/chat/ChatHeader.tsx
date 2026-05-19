import React from 'react';
import { formatTime } from '../../utils/formatters';

interface ChatHeaderProps {
  timer: number;
  tokens: number;
  currentModel: string;
  isPinned: boolean;
  isSettingsOpen: boolean;
  togglePin: () => void;
  setIsSettingsOpen: (open: boolean) => void;
  onCloseSession: () => void;
  onMinimize: () => void;
}

/**
 * Header component for the MiniChat window.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  timer,
  tokens,
  currentModel,
  isPinned,
  isSettingsOpen,
  togglePin,
  setIsSettingsOpen,
  onCloseSession,
  onMinimize
}) => {
  return (
    <div className="chat-header">
      <div className="chat-title">
        <div className="title-with-timer">
          <h1 style={{ color: '#dc2626' }}>Conversation</h1>
          <span className="header-separator" />
          <span className="timer-dot" />
          <span className="chat-timer-text">{formatTime(timer)}</span>
        </div>
      </div>

      <div className="chat-actions">
        <div className="info-wrapper">
          <button className="action-btn info-btn" title="Uso do Modelo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </button>
          <div className="usage-popup">
            {currentModel.split('/')[1] || currentModel} • {tokens.toLocaleString()} tokens
          </div>
        </div>

        <button 
          className={`action-btn pin-btn ${isPinned ? 'active' : ''}`}
          onClick={togglePin}
          title={isPinned ? "Desafixar" : "Fixar no topo"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22"></line>
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.87l-1.78.89A2 2 0 0 0 5 15.24Z"></path>
          </svg>
        </button>

        <button 
          className={`action-btn settings-btn ${isSettingsOpen ? 'active' : ''}`}
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          title="Configurações"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <button 
          className="action-btn close-btn" 
          onClick={onMinimize}
          title="Minimizar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
