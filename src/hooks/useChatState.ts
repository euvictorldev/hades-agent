import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { electronService } from '../services/electron';

/**
 * Hook to manage chat messages, persistence, and pending state.
 */
export const useChatState = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const pendingMessagesRef = useRef<ChatMessage[]>(pendingMessages);

  // Sync refs and persist state to localStorage and Electron backend
  useEffect(() => {
    pendingMessagesRef.current = pendingMessages;
  }, [pendingMessages]);

  useEffect(() => {
    messagesRef.current = messages;
    
    if (!isLoaded) return; // Prevent saving before loading completes

    // Single Source of Truth for persistence: The messages state
    const historyJson = JSON.stringify(messages);
    localStorage.setItem('chat_history', historyJson);
    
    // Update Electron side
    electronService.saveChat(messages);
    electronService.updateChatStatus(messages.length > 0);
  }, [messages, isLoaded]);

  // Initial load from Electron storage (fallback to localStorage if empty)
  useEffect(() => {
    const loadFromFile = async () => {
      try {
        const fileHistory = await electronService.getChat();
        if (fileHistory && fileHistory.length > 0) {
          setMessages(prev => {
            const newMessages = prev.filter(m => !fileHistory.some((fm: any) => fm.id === m.id));
            const merged = [...fileHistory, ...newMessages];
            messagesRef.current = merged;
            return merged;
          });
        }
      } catch (err) {
        console.error('[useChatState] Failed to load chat history:', err);
      } finally {
        setIsLoaded(true);
        electronService.chatWindowReady();
      }
    };
    loadFromFile();
  }, []);

  /**
   * Adds a new message to the history.
   * Persistence is handled by the useEffect hook.
   */
  const addMessage = useCallback((text: string, sender: 'user' | 'ia', image?: string) => {
    if (!text?.trim() && !image) return messagesRef.current;
    
    const newMsg: ChatMessage = {
      id: `${sender}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      text: text.trim(),
      sender,
      timestamp: new Date(),
      image
    };
    
    const updatedHistory = [...messagesRef.current, newMsg];
    setMessages(updatedHistory);
    messagesRef.current = updatedHistory;
    
    return updatedHistory;
  }, []);

  /**
   * Archives the current session via Electron (generates a title and saves to sessions.json),
   * then clears all local state. This is the canonical way to start a new session.
   * Local state is always cleared even if archiving fails (e.g. API quota errors).
   */
  const clearHistory = useCallback(() => {
    // Clear local state immediately for better UI experience
    setMessages([]);
    messagesRef.current = [];
    localStorage.removeItem('chat_history');
    localStorage.removeItem('minichat_timer');

    // Archive in the background
    electronService.endSession('minichat').catch((err) => {
      console.error('[useChatState] Failed to end session:', err);
    });
  }, []);

  return {
    messages,
    setMessages,
    messagesRef,
    pendingMessages,
    setPendingMessages,
    pendingMessagesRef,
    isBusy,
    setIsBusy,
    addMessage,
    clearHistory
  };
};
