const logger = require('./logger');

/**
 * TranslationService handles real-time translation using a remote LibreTranslate instance.
 * Local ML model support has been removed in favor of the remote service.
 */
class TranslationService {
  // Real-time translation cache for words/segments
  liveCache = new Map();

  // LibreTranslate configuration
  libreUrl = 'http://192.168.0.101:5000/translate';

  /**
   * Translates text using a remote LibreTranslate instance.
   * @param {string} text
   * @param {string} targetLang
   * @returns {Promise<string|null>}
   */
  async translateLibre(text, targetLang) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.libreUrl, {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text'
        }),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn('TRANSLATION', `LibreTranslate returned ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.translatedText ?? null;
    } catch (err) {
      if (err.name === 'AbortError') {
        logger.warn('TRANSLATION', 'LibreTranslate timed out (5s), skipping.');
      } else {
        logger.warn('TRANSLATION', 'LibreTranslate unavailable.', err.message);
      }
      return null;
    }
  }

  /**
   * Translates text to the target language.
   * Returns original text if translation fails.
   * @param {string} text
   * @param {string} targetLang
   * @returns {Promise<string>}
   */
  async translate(text, targetLang) {
    if (!text || text.trim().length < 2) return text;
    const result = await this.translateLibre(text, targetLang);
    return result ?? text;
  }

  /**
   * Performs an incremental translation by detecting only new segments.
   * @param {string} text - The full current text.
   * @param {string} previousText - The text that was already translated.
   * @param {string} targetLang
   * @returns {Promise<string>} - The newly translated segment.
   */
  async translateIncremental(text, previousText, targetLang) {
    if (!text) return '';

    let newPart = text.startsWith(previousText)
      ? text.slice(previousText.length)
      : text;

    if (!newPart || newPart.trim().length === 0) return '';

    // Check live cache for very short segments
    const cacheKey = `${targetLang}:${newPart.trim().toLowerCase()}`;
    if (this.liveCache.has(cacheKey)) return this.liveCache.get(cacheKey);

    const translated = await this.translateLibre(newPart, targetLang);

    if (translated) {
      this.liveCache.set(cacheKey, translated);
      return translated;
    }

    return newPart;
  }
}

module.exports = new TranslationService();
