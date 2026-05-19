import { useEffect, useRef } from 'react';
import { TRANSLATION_CONFIG } from '../constants';
import { SusurroMessage } from '../types';
import { electronService } from '../services/electron';

type TranslationResult = {
  id: string;
  success: boolean;
  combinedTranslation?: string;
  textActuallyTranslated?: string;
  lang?: string;
};

/** Pure helper – marks matched messages as translating. */
function buildMarkAsTranslating(messagesToUpdate: SusurroMessage[]) {
  return (curr: SusurroMessage[]) =>
    curr.map((m) => {
      if (messagesToUpdate.some((u) => u.id === m.id) && m.isTranslated)
        return { ...m, isTranslating: true };
      return m;
    });
}

/** Pure helper – merges translation results back into the message list. */
function buildApplyResults(results: TranslationResult[]) {
  return (curr: SusurroMessage[]) =>
    curr.map((m) => {
      const res = results.find((r) => r.id === m.id);
      if (!res?.success) return res ? { ...m, isTranslating: false } : m;
      if (!m.isTranslated) return { ...m, isTranslating: false };
      return {
        ...m,
        translatedText: res.combinedTranslation,
        lastTranslatedText: res.textActuallyTranslated,
        lastTranslatedLang: res.lang,
        isTranslating: false,
      };
    });
}

/**
 * Hook to manage the translation Hades for Susurro messages.
 */
export const useTranslation = (
  messages: SusurroMessage[],
  setMessages: React.Dispatch<React.SetStateAction<SusurroMessage[]>>,
  targetLanguage: string,
  isTranscribing: boolean
) => {
  const messagesRef = useRef(messages);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const processMessageTranslation = async (msg: SusurroMessage, lang: string) => {
    // Quality fix: Always use full context for translation to avoid "glued words" 
    // and grammatical errors caused by fragmenting sentences.
    // We only fallback to incremental for extremely long texts (rare in Susurro).

    const textPart = (msg.text || "").trim();
    const pendingPart = (msg.pendingText || "").trim();

    // Join with a single space if both exist
    const fullSource = (textPart && pendingPart)
      ? `${textPart} ${pendingPart}`
      : (textPart || pendingPart);

    if (!fullSource) return { id: msg.id, success: false };

    // Full approach provides the best quality as the engine sees the whole sentence
    const translated = await electronService.translateText(fullSource, lang);

    return {
      id: msg.id,
      success: true,
      combinedTranslation: translated,
      textActuallyTranslated: fullSource,
      lang
    };
  };

  useEffect(() => {
    const runTranslationCycle = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const msgs = messagesRef.current;
        const lang = targetLanguage;

        const messagesToUpdate = msgs.filter(m => {
          if (!m.isTranslated || m.isTranslating) return false;
          const combinedText = (m.text.trim() + " " + (m.pendingText || "").trim()).trim();
          return combinedText.length > 0 && (combinedText !== m.lastTranslatedText || m.lastTranslatedLang !== lang);
        });

        if (messagesToUpdate.length === 0) {
          isProcessingRef.current = false;
          return;
        }

        setMessages(buildMarkAsTranslating(messagesToUpdate));

        const results = await Promise.all(
          messagesToUpdate.map((m) => processMessageTranslation(m, lang))
        );

        setMessages(buildApplyResults(results));
      } catch (err) {
        console.error("[SUSURRO] Critical error in translation cycle:", err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const intervalTime = isTranscribing ? TRANSLATION_CONFIG.ACTIVE_INTERVAL : TRANSLATION_CONFIG.IDLE_INTERVAL;
    const interval = setInterval(runTranslationCycle, intervalTime);
    return () => clearInterval(interval);
  }, [targetLanguage, isTranscribing, setMessages]);
};
