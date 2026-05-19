import React from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { SettingsMenu } from './chat/SettingsMenu';
import { ChatList } from './chat/ChatList';
import { useMiniChat } from '../hooks/useMiniChat';

/**
 * MiniChat component - Main entry point for the AI chat interface.
 * Orchestrates messages, AI inference, and window controls via useMiniChat hook.
 */
const MiniChat: React.FC = () => {
  const {
    messages,
    pendingMessages,
    isThinking,
    activeTool,
    isPinned,
    isResizing,
    timer,
    tokens,
    isSettingsOpen,
    menuView,
    currentModel,
    copiedId,
    chatEndRef,
    setCurrentModel,
    setIsSettingsOpen,
    setMenuView,
    togglePin,
    handleMinimize,
    startResizing,
    clearHistory,
    copyToClipboard
  } = useMiniChat();

  return (
    <div className={`app-container chat-mode ${isResizing ? 'resizing' : ''}`}>
      <ChatHeader
        timer={timer}
        tokens={tokens}
        currentModel={currentModel}
        isPinned={isPinned}
        isSettingsOpen={isSettingsOpen}
        togglePin={togglePin}
        setIsSettingsOpen={setIsSettingsOpen}
        onCloseSession={clearHistory}
        onMinimize={handleMinimize}
      />

      {isSettingsOpen && (
        <SettingsMenu
          view={menuView}
          currentModel={currentModel}
          onSetView={setMenuView}
          onSelectModel={setCurrentModel}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <ChatList
        messages={messages}
        pendingMessages={pendingMessages}
        isThinking={isThinking}
        activeTool={activeTool}
        copiedId={copiedId}
        onCopy={copyToClipboard}
        chatEndRef={chatEndRef}
      />

      <button
        type="button"
        className="resize-handle"
        onMouseDown={startResizing}
        aria-label="Resize chat window"
      >
        <div className="resize-square" />
      </button>
    </div>
  );
};

export default MiniChat;
