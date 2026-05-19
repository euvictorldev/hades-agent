import { useRef, useCallback } from 'react';
import { AUDIO_CONFIG } from '../constants';
import { calculateRMS, floatTo16BitPCM, arrayBufferToBase64 } from '../utils/audio';
import { electronService } from '../services/electron';

interface AudioRecorderOptions {
  sampleRate?: number;
  bufferSize?: number;
  onChunk?: (base64: string, seq: number) => void;
  onRawChunk?: (samples: Float32Array) => void;
  onVolumeChange?: (volume: number) => void;
  isSystemAudio?: boolean;
}

/**
 * Low-level hook for managing AudioContext, Worklets, and MediaStreams.
 * Handles both Microphone and System Audio recording.
 */
export const useAudioRecorder = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const chunkSeqRef = useRef<number>(0);
  const isRecordingActiveRef = useRef<boolean>(false);

  const stopRecording = useCallback(() => {
    isRecordingActiveRef.current = false;
    if (processorRef.current) processorRef.current.disconnect();
    if (gainNodeRef.current) gainNodeRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    
    processorRef.current = null;
    gainNodeRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    chunkSeqRef.current = 0;
  }, []);

  const startRecording = useCallback(async (options: AudioRecorderOptions) => {
    const { 
      sampleRate = AUDIO_CONFIG.SAMPLE_RATE, 
      bufferSize = AUDIO_CONFIG.BUFFER_SIZE,
      onChunk,
      onRawChunk,
      onVolumeChange,
      isSystemAudio = false
    } = options;

    isRecordingActiveRef.current = true;

    try {
      let stream: MediaStream;
      console.log(`[AUDIO_RECORDER] Starting recording. System Audio: ${isSystemAudio}`);
      
      if (isSystemAudio) {
        // Use the centralized electronService to get the system audio source ID.
        // This is necessary for capturing desktop audio on Electron.
        const sourceId = await electronService.getSystemAudioSourceId();
        if (!isRecordingActiveRef.current) {
          console.log("[AUDIO_RECORDER] Start canceled: recording active flag is false after source ID fetch.");
          return false;
        }
        console.log(`[AUDIO_RECORDER] System audio source ID obtained:`, sourceId);
        if (!sourceId) throw new Error("Audio source not found");

        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            // @ts-ignore - Electron-specific constraints for desktop capture
            mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId }
          },
          video: {
            // @ts-ignore - Video track is needed to get the audio stream from the desktop
            mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId }
          }
        });
        if (!isRecordingActiveRef.current) {
          console.log("[AUDIO_RECORDER] Start canceled: recording active flag is false after getUserMedia.");
          stream.getTracks().forEach(t => t.stop());
          return false;
        }
        // We only want the audio, so we stop the video tracks immediately.
        stream.getVideoTracks().forEach(t => t.stop());
      } else {
        // Standard microphone capture.
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isRecordingActiveRef.current) {
          console.log("[AUDIO_RECORDER] Start canceled: recording active flag is false after getUserMedia.");
          stream.getTracks().forEach(t => t.stop());
          return false;
        }
      }

      console.log(`[AUDIO_RECORDER] MediaStream obtained. Active tracks:`, stream.getAudioTracks().length);
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate });
      await audioContext.resume();
      if (!isRecordingActiveRef.current) {
        console.log("[AUDIO_RECORDER] Start canceled: recording active flag is false after resume AudioContext.");
        audioContext.close();
        stream.getTracks().forEach(t => t.stop());
        return false;
      }
      audioContextRef.current = audioContext;

      const workletCode = `
        class VoiceProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.buffer = [];
            this.bufferSize = ${bufferSize};
          }
          process(inputs) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const samples = input[0];
              for (let i = 0; i < samples.length; i++) {
                this.buffer.push(samples[i]);
              }
              if (this.buffer.length >= this.bufferSize) {
                this.port.postMessage(new Float32Array(this.buffer));
                this.buffer = [];
              }
            }
            return true;
          }
        }
        registerProcessor('voice-processor', VoiceProcessor);
      `;
      
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await audioContext.audioWorklet.addModule(url);
      if (!isRecordingActiveRef.current) {
        console.log("[AUDIO_RECORDER] Start canceled: recording active flag is false after addModule.");
        audioContext.close();
        stream.getTracks().forEach(t => t.stop());
        return false;
      }
      console.log(`[AUDIO_RECORDER] Audio worklet module loaded.`);

      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;

      const workletNode = new AudioWorkletNode(audioContext, 'voice-processor');
      processorRef.current = workletNode;

      const silenceCountRef = { current: 0 };
      const HANGOVER_CHUNKS = 15; // ~1 second of silence to let the model finalize
      let silentLogs = 0;

      workletNode.port.onmessage = (e) => {
        if (!isRecordingActiveRef.current) {
          return;
        }
        const samples = e.data as Float32Array;
        const rms = calculateRMS(samples);
        
        if (onVolumeChange) onVolumeChange(rms);
        if (onRawChunk) onRawChunk(samples);

        const threshold = AUDIO_CONFIG.NOISE_THRESHOLD || 0.01;
        const isSilent = rms <= threshold;

        if (isSilent) {
          silenceCountRef.current++;
        } else {
          silenceCountRef.current = 0;
        }

        // Send chunk if it's active OR if we are in the hangover period
        const shouldSend = !isSilent || silenceCountRef.current <= HANGOVER_CHUNKS;
        
        // Log every 100th chunk even if it's below threshold to show it's "alive"
        const debugSeq = chunkSeqRef.current + (silentLogs || 0);
        if (debugSeq % 100 === 0) {
          console.log(`[AUDIO_RECORDER] Activity Check - RMS: ${rms.toFixed(4)}, Threshold: ${threshold}, Silent: ${isSilent}, Hangover: ${silenceCountRef.current}/${HANGOVER_CHUNKS}`);
        }

        if (onChunk && shouldSend) {
          const pcm16 = floatTo16BitPCM(samples);
          const base64 = arrayBufferToBase64(pcm16);
          chunkSeqRef.current++;
          
          if (chunkSeqRef.current === 1 || chunkSeqRef.current % 50 === 0) {
            console.log(`[AUDIO_RECORDER] Sending chunk seq: ${chunkSeqRef.current}, RMS: ${rms.toFixed(4)}`);
          }
          onChunk(base64, chunkSeqRef.current);
        } else {
          silentLogs++;
        }
      };

      source.connect(gainNode);
      gainNode.connect(workletNode);
      workletNode.connect(audioContext.destination);

      console.log(`[AUDIO_RECORDER] Recording pipeline connected successfully.`);

      return true;
    } catch (err) {
      console.error('[AUDIO_RECORDER] Start error:', err);
      stopRecording();
      return false;
    }
  }, [stopRecording]);

  return {
    startRecording,
    stopRecording,
    gainNode: gainNodeRef.current
  };
};
