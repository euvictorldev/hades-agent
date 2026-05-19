import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { stitchImages } from '../utils/image';
import { electronService } from '../services/electron';

const MAX_CHARS = 4000;

/**
 * Orchestrator hook for the CommandBar component.
 * Manages input state, screen capture, and Electron IPC interactions.
 */
export const useCommandBar = () => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Focus and IPC event setup
  useEffect(() => {
    inputRef.current?.focus();

    const removeFocusListener = electronService.onFocusInput(() => {
      inputRef.current?.focus();
    });

    const removeCaptureListener = electronService.onCaptureEvent(async () => {
      handleCapture();
    });

    const handleLocalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleCapture();
      }
    };

    globalThis.addEventListener('keydown', handleLocalKeyDown);

    return () => {
      if (typeof removeFocusListener === 'function') removeFocusListener();
      if (typeof removeCaptureListener === 'function') removeCaptureListener();
      globalThis.removeEventListener('keydown', handleLocalKeyDown);
    };
  }, []);

  // Handle window resizing and textarea auto-height
  useLayoutEffect(() => {
    if (inputRef.current && containerRef.current) {
      inputRef.current.style.height = '24px';
      const scHeight = inputRef.current.scrollHeight;
      
      const maxTextAreaHeight = 400;
      const limitedTextAreaHeight = Math.min(scHeight, maxTextAreaHeight);
      
      inputRef.current.style.height = `${limitedTextAreaHeight}px`;
      inputRef.current.style.overflowY = scHeight > maxTextAreaHeight ? 'auto' : 'hidden';

      const height = containerRef.current.offsetHeight;
      const limitedWindowHeight = Math.min(height, 550);
      
      electronService.resizeWindow(730, limitedWindowHeight);
    }
  }, [query, attachedImage]);

  const handleCapture = async () => {
    try {
      const result = await electronService.captureAllScreens();
      if (result && Array.isArray(result) && result.length > 0) {
        const stitched = await stitchImages(result);
        setAttachedImage(stitched);
      } else if (typeof result === 'string') {
        setAttachedImage(result);
      }
    } catch (err) {
      console.error("[CommandBar] Capture error:", err);
    }
  };

  const handleSend = () => {
    if (query.trim() || attachedImage) {
      const msg = query;
      const img = attachedImage;
      setQuery('');
      setAttachedImage(null);
      
      electronService.sendMessage(msg, img);
      
      inputRef.current?.focus();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      electronService.closeWindow();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setAttachedImage(base64);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const removeAttachment = () => setAttachedImage(null);

  return {
    query,
    setQuery,
    attachedImage,
    inputRef,
    containerRef,
    MAX_CHARS,
    handleCapture,
    handleSend,
    handleKeyDown,
    handlePaste,
    removeAttachment
  };
};
