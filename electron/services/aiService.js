const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('./logger');
const jsonStore = require('../store/jsonStore');

/**
 * AIService provides an interface for interacting with Google's Gemini models.
 * It handles prompt generation and AI responses for application-level insights.
 */
class AIService {
  /**
   * Generates a suggestion based on a transcription chunk and a given persona.
   * @param {Object} params
   * @param {string} params.transcription - The text chunk from the transcription.
   * @param {string} params.personaPrompt - The system instruction or persona definition.
   * @returns {Promise<string|null>}
   */
  async generateSuggestion({ transcription, personaPrompt }) {
    const apiKey = jsonStore.getSettings().general.apiKey || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('AI', 'VITE_GEMINI_API_KEY is not defined.');
      return null;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Persona: ${personaPrompt}\n\nTranscription Chunk: ${transcription}\n\nBased on the persona and the transcription, generate a brief suggestion or insight. Be concise. Use markdown if needed.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      logger.error('AI', 'Error generating suggestion', err);
      return null;
    }
  }

  /**
   * Generates a short, descriptive session title from the first user message.
   * @param {string} firstMessage - The first user message in the session.
   * @returns {Promise<string>}
   */
  async generateSessionTitle(firstMessage) {
    const apiKey = jsonStore.getSettings().general.apiKey || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return this._fallbackTitle(firstMessage);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: [
          'You are a session title generator. Given a user message, produce a concise, descriptive title.',
          'Rules:',
          '- Minimum 2 words, maximum 5 words',
          '- Title Case (capitalize each major word)',
          '- No punctuation at the end',
          '- No quotes, no emojis, no markdown',
          '- Action-oriented when possible (e.g. "Fixing Login Bug", "Setting Up Dark Mode")',
          '- Return ONLY the title, nothing else'
        ].join('\n')
      });

      const result = await model.generateContent(firstMessage.substring(0, 500));
      const raw = result.response.text().trim();
      // Safety: strip any quotes, newlines, or extra spaces
      return raw.replace(/['"]/g, '').replace(/\n.*/g, '').trim() || this._fallbackTitle(firstMessage);
    } catch (err) {
      logger.error('AI', 'Error generating session title', err);
      return this._fallbackTitle(firstMessage);
    }
  }

  _fallbackTitle(text) {
    if (!text) return 'Nova Sessão';
    return text.substring(0, 40).trim() + (text.length > 40 ? '...' : '');
  }

  /**
   * Transcribes audio from base64 data.
   * @param {string} base64Audio - Audio data in base64.
   * @returns {Promise<string|null>}
   */
  async transcribeAudio(base64Audio) {
    const apiKey = jsonStore.getSettings().general.apiKey || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('AI', 'VITE_GEMINI_API_KEY is not defined.');
      return null;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = "Transcreva o áudio exatamente como ele é dito. Não adicione comentários, não interprete, apenas retorne o texto falado.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Audio,
            mimeType: "audio/webm" // Assumindo webm que é o padrão do MediaRecorder no Chrome/Electron
          }
        }
      ]);
      return result.response.text();
    } catch (err) {
      logger.error('AI', 'Error transcribing audio', err);
      throw err;
    }
  }
}

module.exports = new AIService();
