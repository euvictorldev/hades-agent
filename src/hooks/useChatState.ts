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

  const messagesRef = useRef<ChatMessage[]>(messages);
  const pendingMessagesRef = useRef<ChatMessage[]>(pendingMessages);

  // Sync refs and persist state to localStorage and Electron backend
  useEffect(() => {
    pendingMessagesRef.current = pendingMessages;
  }, [pendingMessages]);

  useEffect(() => {
    messagesRef.current = messages;
    
    // Single Source of Truth for persistence: The messages state
    const historyJson = JSON.stringify(messages);
    localStorage.setItem('chat_history', historyJson);
    
    // Update Electron side
    electronService.saveChat(messages);
    electronService.updateChatStatus(messages.length > 0);
  }, [messages]);

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
   * Clears the chat history across all storage layers.
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    localStorage.removeItem('chat_history');
    electronService.endSession();
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
