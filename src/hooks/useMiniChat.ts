import { useState, useEffect, useRef } from 'react';
import { useChatState } from './useChatState';
import { useGemini } from './useGemini';
import { useWindowControl } from './useWindowControl';
import { useClipboard } from './useClipboard';
import { DEFAULT_MODEL } from '../constants';
import { electronService } from '../services/electron';

/**
 * Hook to manage the state and logic for the MiniChat component.
 * Orchestrates chat messages, AI responses, window controls, and IPC events.
 */
export const useMiniChat = () => {
  const {
    messages,
    pendingMessages,
    setPendingMessages,
    pendingMessagesRef,
    isBusy,
    setIsBusy,
    addMessage,
    clearHistory
  } = useChatState();

  const [currentModel, setCurrentModel] = useState<string>(DEFAULT_MODEL);
  const { isThinking, activeTool, handleAIResponse } = useGemini(currentModel, addMessage);
  const { isPinned, isResizing, togglePin, handleMinimize, startResizing } = useWindowControl();
  const { copiedId, copyToClipboard } = useClipboard();

  const [timer, setTimer] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'models'>('main');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timer and Tokens effect
  useEffect(() => {
    const timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);
    
    electronService.getTotalTokens().then(t => setTokens(t));

    return () => clearInterval(timerInterval);
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Process queued messages when not busy
  const processNextPending = async () => {
    if (pendingMessagesRef.current.length > 0) {
      const nextMsg = pendingMessagesRef.current[0];
      setPendingMessages(prev => prev.slice(1));
      const updatedHistory = addMessage(nextMsg.text, 'user', nextMsg.image);
      await handleAIResponse(nextMsg.text, updatedHistory);
      
      // Update tokens after response
      const t = await electronService.getTotalTokens();
      setTokens(t);

      processNextPending();
    } else {
      setIsBusy(false);
    }
  };

  // Handle incoming messages and task executions from Electron IPC
  useEffect(() => {
    // New message from Command Bar
    const unsubscribeMsg = electronService.onNewChatMessage((msg: string, image?: string) => {
      if (isBusy) {
        setPendingMessages(prev => [...prev, {
          id: `user_${Date.now()}`,
          text: msg,
          sender: 'user',
          timestamp: new Date(),
          status: 'sent',
          image
        }]);
      } else {
        setIsBusy(true);
        const updatedHistory = addMessage(msg, 'user', image);
        handleAIResponse(msg, updatedHistory).then(async () => {
          const t = await electronService.getTotalTokens();
          setTokens(t);
          processNextPending();
        });
      }
    });

    // Scheduled task execution from taskService
    const unsubscribeTask = electronService.onExecuteTask((task: any) => {
      const prompt = `[TAREFA AGENDADA] A tarefa a seguir foi disparada automaticamente, execute-a agora: "${task.description}"`;
      setIsBusy(true);
      handleAIResponse(prompt, messages).then(async () => {
        const t = await electronService.getTotalTokens();
        setTokens(t);
        processNextPending();
      });
    });

    // Keyboard shortcut to close/minimize
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleMinimize();
    };
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      if (unsubscribeMsg) unsubscribeMsg();
      if (unsubscribeTask) unsubscribeTask();
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBusy, currentModel, addMessage, handleAIResponse, handleMinimize, messages]);

  return {
    messages,
    pendingMessages,
    isBusy,
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
    addMessage,
    setCurrentModel,
    setIsSettingsOpen,
    setMenuView,
    togglePin,
    handleMinimize,
    startResizing,
    clearHistory,
    copyToClipboard
  };
};
