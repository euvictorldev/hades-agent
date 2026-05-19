/**
 * Configuration constants for audio and translation.
 */

export const TRANSLATION_CONFIG = {
  ACTIVE_INTERVAL: 1500,
  IDLE_INTERVAL: 500,
  SENTENCE_THROTTLE: 3, // Number of words to wait before considering a sentence stable
};

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  BUFFER_SIZE: 1024,
  NOISE_THRESHOLD: 0.015,
};
