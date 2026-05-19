import { useState, useRef, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { encodeWAV, floatTo16BitPCM, arrayBufferToBase64 } from '../utils/audio';
import { electronService } from '../services/electron';

/**
 * Specialized hook for the VoiceRecorder component.
 * Handles one-shot recording, review, and transcription.
 */
export const useVoiceRecorder = () => {
  const [step, setStep] = useState(1); // 1: Idle, 2: Recording, 3: Reviewing
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState('Pronto para gravar');
  
  const accumulatedAudio = useRef<Float32Array[]>([]);
  const { startRecording, stopRecording } = useAudioRecorder();

  const resetState = useCallback(() => {
    setStep(1);
    setTranscription('');
    setStatus('Pronto para gravar');
    setIsTranscribing(false);
    accumulatedAudio.current = [];
  }, []);

  const start = useCallback(async () => {
    setStep(2);
    setStatus('Gravando áudio...');
    setTranscription('');
    accumulatedAudio.current = [];
    
    await startRecording({
      sampleRate: 16000,
      onRawChunk: (samples) => {
        accumulatedAudio.current.push(new Float32Array(samples));
      },
      onVolumeChange: (v) => setVolume(v),
      isSystemAudio: false
    });
  }, [startRecording]);

  const stopAndTranscribe = useCallback(async () => {
    setStep(3);
    setIsTranscribing(true);
    setStatus('Transcrevendo...');
    stopRecording();

    try {
      if (accumulatedAudio.current.length === 0) {
        throw new Error("No audio captured");
      }

      // Merge all captured audio chunks into a single buffer
      const totalSamples = accumulatedAudio.current.reduce((acc, b) => acc + b.length, 0);
      const merged = new Float32Array(totalSamples);
      let offset = 0;
      for (const b of accumulatedAudio.current) {
        merged.set(b, offset);
        offset += b.length;
      }

      // Convert to 16-bit PCM and encode as WAV
      const pcm16 = floatTo16BitPCM(merged);
      const wav = encodeWAV(pcm16, 16000);
      const base64 = arrayBufferToBase64(wav);

      // Send to Electron backend for transcription
      const result = await electronService.transcribeAudio(base64);
      if (result.success) {
        setTranscription(result.data || '');
        setStatus('Transcrição concluída!');
      } else {
        setTranscription(`Erro: ${result.error}`);
        setStatus('Erro na transcrição');
      }
      setIsTranscribing(false);
    } catch (err) {
      console.error('[VOICE_RECORDER] Transcription error:', err);
      setStatus('Erro na transcrição');
      setIsTranscribing(false);
    }
  }, [stopRecording]);

  const finalize = useCallback(async () => {
    if (transcription.trim()) {
      // Send the transcribed message to the chat
      electronService.sendMessage(transcription);
      setStatus('Enviado!');
      setTimeout(() => {
        resetState();
        electronService.closeWindow();
      }, 500);
    } else {
      resetState();
      electronService.closeWindow();
    }
  }, [transcription, resetState]);

  return {
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
  };
};
