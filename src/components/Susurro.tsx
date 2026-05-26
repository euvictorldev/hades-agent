import React, { useCallback } from 'react';
import { Activity, Maximize2, GripHorizontal, Languages, Minus, Plus, Type, Pin, PinOff, Mic, Square, FilePlus } from 'lucide-react';
import { SusurroChatList } from './susurro/SusurroChatList';
import { SusurroHeader } from './susurro/SusurroHeader';
import { useSusurro } from '../hooks/useSusurro';
import { electronService } from '../services/electron';

interface SusurroProps {
  activeMode?: 'chat' | 'susurro';
  onSwitchMode?: (mode: 'chat' | 'susurro') => void;
}

/**
 * Susurro: Real-time transcription and translation component.
 * Orchestrates audio capture, AI-driven transcription deltas, and multi-language translation.
 * Refactored for modularity and maintainability.
 */
const Susurro: React.FC<SusurroProps> = ({ activeMode = 'susurro', onSwitchMode }) => {
  const s = useSusurro(activeMode === 'susurro');


  /** Drag-to-resize handler — rAF throttled + fire-and-forget IPC. */
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.screenX;
    const startY = e.screenY;
    const startW = window.outerWidth;
    const startH = window.outerHeight;
    const MIN_W = 360;
    const MIN_H = 300;
    let rafId: number;

    const onMove = (ev: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newW = Math.max(MIN_W, startW + (ev.screenX - startX));
        const newH = Math.max(MIN_H, startH + (ev.screenY - startY));
        electronService.resizeWindowFast(Math.round(newW), Math.round(newH));
      });
    };

    const onUp = () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);



  React.useEffect(() => {
    if (activeMode !== 'susurro') {
      if (s.isTranscribing || s.isConnecting) {
        s.stopTranscriptionHades();
      }
    }
  }, [activeMode, s.isTranscribing, s.isConnecting, s.stopTranscriptionHades]);

  return (
    <div 
      className="app-container chat-mode susurro-mode glassmorphic-susurro"
    >
      {/* Status Bar / Header */}
      <SusurroHeader
          timer={s.timer}
          tokens={s.tokens}
          isTranscribing={s.isTranscribing}
          isConnecting={s.isConnecting}
          isGlobalTranslationEnabled={s.isGlobalTranslationEnabled}
          targetLanguage={s.targetLanguage}
          targetLanguageLabel={s.targetLanguageLabel}
          isSettingsOpen={s.isSettingsOpen}
          setIsSettingsOpen={s.setIsSettingsOpen}
          menuView={s.menuView}
          setMenuView={s.setMenuView}
          setTargetLanguage={s.setTargetLanguage}
          setTargetLanguageLabel={s.setTargetLanguageLabel}
          handleMinimize={s.handleMinimize}
          handleToggleGlobalTranslation={s.handleToggleGlobalTranslation}
          isSuggestionsEnabled={s.isSuggestionsEnabled}
          setIsSuggestionsEnabled={s.setIsSuggestionsEnabled}
          selectedPersona={s.selectedPersona}
          setSelectedPersona={s.setSelectedPersona}
          personas={s.personas}
          isCreatingPersona={s.isCreatingPersona}
          setIsCreatingPersona={s.setIsCreatingPersona}
          newPersonaName={s.newPersonaName}
          setNewPersonaName={s.setNewPersonaName}
          newPersonaPrompt={s.newPersonaPrompt}
          setNewPersonaPrompt={s.setNewPersonaPrompt}
          handleSavePersona={s.handleSavePersona}
          handleDeletePersona={s.handleDeletePersona}
          fontSize={s.fontSize}
          increaseFontSize={s.increaseFontSize}
          decreaseFontSize={s.decreaseFontSize}
          onCloseSession={s.onCloseSession}
          activeMode={activeMode}
          onSwitchMode={onSwitchMode}
          currentSessionId={s.currentSessionId}
          isClosingSession={s.isClosingSession}
        />

      {/* Main Chat Area */}
      <SusurroChatList
        messages={s.messages}
        targetLanguageLabel={s.targetLanguageLabel}
        handleToggleMessageTranslation={s.handleToggleMessageTranslation}
        copiedId={s.copiedId}
        copyToClipboard={s.copyToClipboard}
        chatEndRef={s.chatEndRef}
        handleScroll={s.handleScroll}
      />

      {/* Footer Controls */}
        <div className="susurro-footer">
          <button
            className={`mic-trigger ${s.isTranscribing || s.isConnecting ? 'active' : ''} ${s.isConnecting ? 'connecting' : ''}`}
            onClick={!s.susurroPushToTalk ? s.toggleTranscriptionHades : undefined}
            onMouseDown={(e) => {
              if (s.susurroPushToTalk && !s.isTranscribing && !s.isConnecting) {
                s.startTranscriptionHades();
              }
            }}
            onMouseUp={s.susurroPushToTalk ? s.stopTranscriptionHades : undefined}
            onMouseLeave={s.susurroPushToTalk ? s.stopTranscriptionHades : undefined}
            disabled={s.isConnecting}
            title={s.susurroPushToTalk 
              ? (s.isTranscribing ? "Solte para enviar" : "Segure para falar")
              : (s.isTranscribing ? "Parar Gravação" : "Iniciar Gravação")
            }
          >
            <div className="mic-ring" />
            <div className="mic-ring-outer" />
            <div className="mic-icon-box">
              <Activity size={24} className={s.isTranscribing || s.isConnecting ? 'visible' : 'hidden'} />
              <div className={`mic-dot ${s.isTranscribing || s.isConnecting ? 'hidden' : 'visible'}`} />
            </div>
          </button>
        </div>

      <div
        className="resize-handle"
        role="separator"
        aria-label="Drag to resize window"
        tabIndex={0}
        onMouseDown={handleResizeMouseDown}
      >
        <div className="resize-square" />
      </div>
    </div>
  );
};

export default Susurro;
