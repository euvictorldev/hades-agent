/**
 * Shared audio processing utilities for handling PCM and WAV encoding.
 */

/**
 * Calculates the Root Mean Square (RMS) of an audio buffer to detect volume/activity.
 */
export const calculateRMS = (samples: Float32Array): number => {
  let sum = 0;
  for (const sample of samples) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / samples.length);
};

/**
 * Converts a Float32Array of audio samples to 16-bit PCM (Int16Array).
 */
export const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
};

/**
 * Encodes 16-bit PCM samples into a standard WAV file format.
 */
export const encodeWAV = (samples: ArrayBuffer, sampleRate: number): ArrayBuffer => {
  const buffer = new ArrayBuffer(44 + samples.byteLength);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.codePointAt(i) || 0);
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.byteLength, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.byteLength, true);

  const data = new Uint8Array(buffer, 44);
  data.set(new Uint8Array(samples));
  return buffer;
};

/**
 * Converts an ArrayBuffer to a Base64 string for IPC transmission.
 * Optimized for larger buffers to avoid stack overflow and improve performance.
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  
  // Process in chunks to avoid String.fromCharCode(...bytes) stack limits
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCodePoint(...chunk);
  }
  
  return btoa(binary);
};
