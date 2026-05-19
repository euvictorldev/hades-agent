import React, { useEffect, useCallback } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { electronService } from '../services/electron';

/**
 * VoiceRecorder: One-shot voice command recorder with Gemini transcription.
 * Optimized with useVoiceRecorder hook and shared audio utilities.
 */
const VoiceRecorder: React.FC = () => {
  const {
    step,
    isTranscribing,
    transcription,
    volume,
    status,
    start,
    stopAndTranscribe,
    finalize,
    resetState,
    stopRecording
  } = useVoiceRecorder();

  const handleAction = useCallback(() => {
    if (step === 1) start();
    else if (step === 2) stopAndTranscribe();
    else if (step === 3) finalize();
  }, [step, start, stopAndTranscribe, finalize]);

  const getButtonText = (s: number) => {
    if (s === 1) return 'Gravar';
    if (s === 2) return 'Parar';
    return 'Confirmar';
  };
  const buttonText = getButtonText(step);

  useEffect(() => {
    const removeStartListener = electronService.onStartVoice(() => {
      resetState();
      start();
    });
    const removeSendListener = electronService.onVoiceSend(() => handleAction());
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopRecording();
        resetState();
        electronService.closeWindow();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAction();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      if (removeStartListener) removeStartListener();
      if (removeSendListener) removeSendListener();
      stopRecording();
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAction, stopRecording, resetState]);

  return (
    <div className="app-container voice-mode">
      <div className="voice-recorder-section">
        <div className="waveform-container">
          {step === 2 ? (
            Array.from({ length: 11 }, (_, i) => {
              const distance = Math.abs(i - 5);
              const scale = Math.max(0.1, volume * 10 * (1 - distance / 6));
              if (i === 5) {
                return (
                  <div key="mic-circle" className="mic-circle active" style={{ transform: `scale(${1 + volume * 2})` }}>
                    <Mic size={24} fill="white" />
                  </div>
                );
              }
              return (
                <div
                  key={`waveform-bar-${i}`}
                  className="waveform-bar"
                  style={{ height: `${Math.max(10, scale * 100)}px`, opacity: Math.max(0.3, scale * 2) }}
                />
              );
            })
          ) : (
            <div className={`mic-circle ${step === 3 ? 'success' : ''}`}>
              {isTranscribing ? <Loader2 size={24} className="animate-spin text-white" /> : <Mic size={24} fill="white" />}
            </div>
          )}
        </div>
        <div className="listening-status">{status}</div>
        {step === 3 && (
          <div className="transcription-area">
            {isTranscribing ? 'Processando...' : transcription || 'Vazio'}
          </div>
        )}
      </div>

      <div className="command-footer">
        <button className="footer-btn primary" onClick={handleAction}>
          <span className="keycap-box">{step === 1 ? 'ALT+V' : 'ESPAÇO'}</span>
          <span className="keycap-text">{buttonText}</span>
        </button>
        <button className="footer-btn" onClick={() => { stopRecording(); resetState(); electronService.closeWindow(); }}>
          <span className="keycap-box">ESC</span>
          <span className="keycap-text">Cancelar</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceRecorder;
