import { useState, useEffect, useRef, useCallback } from 'react';
import { SusurroMessage, MenuView } from '../types';
import { useWindowControl } from './useWindowControl';
import { useClipboard } from './useClipboard';
import { usePersonas } from './usePersonas';
import { useTranscription } from './useTranscription';
import { useTranslation } from './useTranslation';
import { electronService } from '../services/electron';

/**
 * Orchestrator hook for Susurro logic.
 * Manages state for messages, personas, translation, and UI controls.
 */
export const useSusurro = () => {
  // --- Core State ---
  const [messages, setMessages] = useState<SusurroMessage[]>([]);
  const [timer, setTimer] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>('main');
  const [isSuggestionsEnabled, setIsSuggestionsEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('pt');
  const [targetLanguageLabel, setTargetLanguageLabel] = useState('Português');
  const [inputVolume, setInputVolume] = useState(1);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaPrompt, setNewPersonaPrompt] = useState('');
  const [isGlobalTranslationEnabled, setIsGlobalTranslationEnabled] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState(14); // Default 14px

  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Sub-Hooks ---
  const { isPinned, isResizing, togglePin, handleMinimize, startResizing } = useWindowControl();
  const { copiedId, copyToClipboard } = useClipboard();
  const {
    personas,
    selectedPersona,
    setSelectedPersona,
    savePersona,
    deletePersona
  } = usePersonas();

  const { isTranscribing, isConnecting, startTranscriptionHades, stopTranscriptionHades } = useTranscription(
    selectedPersona,
    isSuggestionsEnabled,
    isGlobalTranslationEnabled,
    setMessages,
    setTokens,
    inputVolume
  );

  useTranslation(messages, setMessages, targetLanguage, isTranscribing);

  // --- Effects ---
  useEffect(() => {
    const loadTokens = async () => {
      const t = await electronService.getTotalTokens();
      if (typeof t === 'number') setTokens(t);
    };
    loadTokens();

    const timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        electronService.closeWindow();
      }
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        (document.activeElement as HTMLElement)?.blur();
        startTranscriptionHades();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    if (autoScroll) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    document.documentElement.style.setProperty('--susurro-base-font-size', `${fontSize}px`);
  }, [fontSize]);

  // --- Handlers ---
  const handleToggleGlobalTranslation = useCallback(() => {
    const nextState = !isGlobalTranslationEnabled;
    setIsGlobalTranslationEnabled(nextState);
    setMessages(curr => curr.map(m => ({ ...m, isTranslated: nextState, isTranslating: false })));
  }, [isGlobalTranslationEnabled]);

  const handleToggleMessageTranslation = useCallback((msgId: string) => {
    setMessages(curr => curr.map(m =>
      m.id === msgId ? { ...m, isTranslated: !m.isTranslated, isTranslating: false } : m
    ));
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  }, []);

  const onSavePersona = useCallback(async () => {
    if (!newPersonaName || !newPersonaPrompt) return;
    const persona = await savePersona(newPersonaName, newPersonaPrompt);
    if (persona) {
      setIsCreatingPersona(false);
      setNewPersonaName('');
      setNewPersonaPrompt('');
    }
  }, [newPersonaName, newPersonaPrompt, savePersona]);

  return {
    // State
    messages,
    timer,
    tokens,
    isSettingsOpen, setIsSettingsOpen,
    menuView, setMenuView,
    isSuggestionsEnabled, setIsSuggestionsEnabled,
    personas,
    selectedPersona, setSelectedPersona,
    targetLanguage, setTargetLanguage,
    targetLanguageLabel, setTargetLanguageLabel,
    inputVolume, setInputVolume,
    isCreatingPersona, setIsCreatingPersona,
    newPersonaName, setNewPersonaName,
    newPersonaPrompt, setNewPersonaPrompt,
    isGlobalTranslationEnabled,
    autoScroll, setAutoScroll,

    // Window/UI
    isPinned, isResizing, togglePin, handleMinimize, startResizing,
    copiedId, copyToClipboard,
    chatEndRef,
    handleScroll,

    // Transcription
    isTranscribing, isConnecting, startTranscriptionHades, stopTranscriptionHades,

    // Handlers
    handleToggleGlobalTranslation,
    handleToggleMessageTranslation,
    handleSavePersona: onSavePersona,
    handleDeletePersona: deletePersona,

    // Font Size
    fontSize,
    increaseFontSize: () => setFontSize(prev => Math.min(prev + 1, 24)),
    decreaseFontSize: () => setFontSize(prev => Math.max(prev - 1, 10))
  };
};
