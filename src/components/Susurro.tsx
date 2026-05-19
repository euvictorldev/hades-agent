import React from 'react';
import { Activity } from 'lucide-react';
import { SusurroChatList } from './susurro/SusurroChatList';
import { SusurroHeader } from './susurro/SusurroHeader';
import { useSusurro } from '../hooks/useSusurro';

/**
 * Susurro: Real-time transcription and translation component.
 * Orchestrates audio capture, AI-driven transcription deltas, and multi-language translation.
 * Refactored for modularity and maintainability.
 */
const Susurro: React.FC = () => {
  const s = useSusurro();

  return (
    <div className={`app-container susurro-mode ${s.isResizing ? 'resizing' : ''}`}>
      {/* Status Bar / Header */}
      <SusurroHeader
        timer={s.timer}
        tokens={s.tokens}
        isTranscribing={s.isTranscribing}
        isConnecting={s.isConnecting}
        isPinned={s.isPinned}
        isGlobalTranslationEnabled={s.isGlobalTranslationEnabled}
        targetLanguage={s.targetLanguage}
        targetLanguageLabel={s.targetLanguageLabel}
        isSettingsOpen={s.isSettingsOpen}
        setIsSettingsOpen={s.setIsSettingsOpen}
        menuView={s.menuView}
        setMenuView={s.setMenuView}
        targetLanguage={s.targetLanguage}
        setTargetLanguage={s.setTargetLanguage}
        setTargetLanguageLabel={s.setTargetLanguageLabel}
        togglePin={s.togglePin}
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
          onClick={s.startTranscriptionHades}
          disabled={s.isConnecting}
        >
          <div className="mic-ring" />
          <div className="mic-ring-outer" />
          <div className="mic-icon-box">
            <Activity size={24} className={s.isTranscribing || s.isConnecting ? 'visible' : 'hidden'} />
            <div className={`mic-dot ${s.isTranscribing || s.isConnecting ? 'hidden' : 'visible'}`} />
          </div>
        </button>
      </div>

      <button className="resize-handle" onMouseDown={s.startResizing} />
    </div>
  );
};

export default Susurro;
