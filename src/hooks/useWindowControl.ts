import { useState, useEffect } from 'react';
import { electronService } from '../services/electron';

/**
 * Hook to manage shared window controls like pinning, resizing, and closing.
 */
export const useWindowControl = (initialPinned = false) => {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isResizing, setIsResizing] = useState(false);

  // Sync pin state on mount
  useEffect(() => {
    electronService.isPinned().then(pinned => {
      setIsPinned(pinned);
    });
  }, []);

  /**
   * Toggles the window's "Always on Top" (pin) state.
   */
  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    electronService.updateChatPin(next);
  };

  /**
   * Closes the current window.
   */
  const handleMinimize = () => {
    electronService.closeWindow();
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.screenX;
    const startY = e.screenY;
    const startWidth = window.innerWidth;
    const startHeight = window.innerHeight;
    
    let lastResize = 0;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const now = Date.now();
      if (now - lastResize < 16) return; // ~60fps throttling
      lastResize = now;
      
      const deltaX = moveEvent.screenX - startX;
      const deltaY = moveEvent.screenY - startY;
      
      // Update window dimensions via Electron IPC
      electronService.resizeWindow(
        Math.max(400, startWidth + deltaX), 
        Math.max(400, startHeight + deltaY)
      );
    };

    const onMouseUp = () => {
      setIsResizing(false);
      globalThis.removeEventListener('mousemove', onMouseMove);
      globalThis.removeEventListener('mouseup', onMouseUp);
    };

    globalThis.addEventListener('mousemove', onMouseMove);
    globalThis.addEventListener('mouseup', onMouseUp);
  };

  return {
    isPinned,
    isResizing,
    togglePin,
    handleMinimize,
    startResizing
  };
};
