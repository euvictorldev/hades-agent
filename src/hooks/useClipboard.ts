import { useState, useCallback } from 'react';

/**
 * Hook to manage clipboard copying with feedback.
 */
export const useClipboard = (timeout = 2000) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), timeout);
  }, [timeout]);

  return {
    copiedId,
    setCopiedId,
    copyToClipboard
  };
};
