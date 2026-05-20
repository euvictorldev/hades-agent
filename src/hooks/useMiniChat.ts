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

  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem('minichat_timer');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [tokens, setTokens] = useState<number>(() => {
    const saved = localStorage.getItem('minichat_session_tokens');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'models'>('main');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial settings
  useEffect(() => {
    electronService.getSettings().then(settings => {
      if (settings?.general?.minichatModel) {
        setCurrentModel(settings.general.minichatModel);
      }
    });
  }, []);

  // Timer effect: ticks only when active session exists (messages.length > 0)
  useEffect(() => {
    if (messages.length === 0) {
      setTimer(0);
      localStorage.removeItem('minichat_timer');
      return;
    }

    const timerInterval = setInterval(() => {
      setTimer(prev => {
        const next = prev + 1;
        localStorage.setItem('minichat_timer', next.toString());
        return next;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [messages.length]);

  // Listen for live settings updates from the main process
  useEffect(() => {
    const unsubscribe = electronService.onSettingsUpdated((settings) => {
      if (settings?.general?.minichatModel) {
        setCurrentModel(settings.general.minichatModel);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      const loopTokens = await handleAIResponse(nextMsg.text, updatedHistory);
      
      // Update tokens after response
      setTokens(prev => {
        const next = prev + (loopTokens || 0);
        localStorage.setItem('minichat_session_tokens', next.toString());
        return next;
      });

      processNextPending();
    } else {
      setIsBusy(false);
    }
  };

  // Use refs for values needed inside the IPC listener to avoid recreating it
  const isBusyRef = useRef(isBusy);
  useEffect(() => { isBusyRef.current = isBusy; }, [isBusy]);

  const currentModelRef = useRef(currentModel);
  useEffect(() => { currentModelRef.current = currentModel; }, [currentModel]);

  // Handle incoming messages and task executions from Electron IPC
  useEffect(() => {
    // New message from Command Bar
    const unsubscribeMsg = electronService.onNewChatMessage((msg: string, image?: string) => {
      if (isBusyRef.current) {
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
        // addMessage uses a ref internally so it's safe to call without depending on messages state
        const updatedHistory = addMessage(msg, 'user', image);
        handleAIResponse(msg, updatedHistory).then(async (loopTokens) => {
          setTokens(prev => {
            const next = prev + (loopTokens || 0);
            localStorage.setItem('minichat_session_tokens', next.toString());
            return next;
          });
          processNextPending();
        });
      }
    });

    // Scheduled task execution from taskService
    const unsubscribeTask = electronService.onExecuteTask((task: any) => {
      const prompt = `[TAREFA AGENDADA] A tarefa a seguir foi disparada automaticamente, execute-a agora: "${task.description}"`;
      setIsBusy(true);
      // We must get the latest messages for the prompt
      electronService.getChat().then(currentHistory => {
        handleAIResponse(prompt, currentHistory || []).then(async (loopTokens) => {
          setTokens(prev => {
            const next = prev + (loopTokens || 0);
            localStorage.setItem('minichat_session_tokens', next.toString());
            return next;
          });
          processNextPending();
        });
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
  }, [addMessage, handleAIResponse, handleMinimize]); // Removed isBusy, currentModel, messages from dependencies

  const handleSelectModel = async (modelId: string) => {
    setCurrentModel(modelId);
    try {
      const settings = await electronService.getSettings();
      if (settings) {
        settings.general.minichatModel = modelId;
        await electronService.saveSettings(settings);
      }
    } catch (err) {
      console.error('Failed to persist model selection from minichat:', err);
    }
  };

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
    setCurrentModel: handleSelectModel,
    setIsSettingsOpen,
    setMenuView,
    togglePin,
    handleMinimize,
    startResizing,
    clearHistory: () => {
      setTimer(0);
      setTokens(0);
      localStorage.removeItem('minichat_session_tokens');
      clearHistory();
    },
    copyToClipboard
  };
};
