const { Worker } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');
const { app } = require('electron');
const store = require('../store/jsonStore');
const logger = require('./logger');

/**
 * TranslationService manages local AI translation using Transformers.js in a worker thread.
 * It handles model downloading progress, caching, and concurrent translation requests.
 */
class TranslationService {
  worker = null;
  pendingTranslations = new Map();
  modelsPath = path.join(app.getPath('userData'), 'models');
  
  // Real-time translation cache for words/segments
  liveCache = new Map(); 
  
  // LibreTranslate configuration
  libreUrl = 'http://192.168.0.101:5000/translate';

  /**
   * Initializes or retrieves the background worker thread.
   * @param {BrowserWindow} [setupWindow] - Optional window to receive progress updates.
   * @returns {Worker}
   */
  getWorker(setupWindow) {
    if (this.worker) return this.worker;

    this.worker = new Worker(path.join(__dirname, '../../translation-worker.js'), {
      workerData: { modelsPath: this.modelsPath }
    });

    this.worker.on('message', (msg) => {
      this.handleWorkerMessage(msg, setupWindow);
    });

    this.worker.on('error', (err) => {
      logger.error('TRANSLATION', 'Worker error', err);
      this.worker = null;
    });

    return this.worker;
  }

  /**
   * Handles incoming messages from the worker thread.
   * @private
   */
  handleWorkerMessage(msg, setupWindow) {
    const { type, data, message, id, result, error } = msg;

    switch (type) {
      case 'progress':
        if (setupWindow) setupWindow.webContents.send('translation-download-progress', data);
        break;
      case 'status':
        if (setupWindow) setupWindow.webContents.send('translation-download-status', message);
        break;
      case 'ready':
        if (setupWindow) setupWindow.webContents.send('translation-download-complete');
        break;
      case 'translation-result':
        if (this.pendingTranslations.has(id)) {
          this.pendingTranslations.get(id).resolve(result);
          this.pendingTranslations.delete(id);
        }
        break;
      case 'translation-error':
        if (this.pendingTranslations.has(id)) {
          this.pendingTranslations.get(id).reject(new Error(error));
          this.pendingTranslations.delete(id);
        }
        break;
    }
  }

  /**
   * Checks if the required translation models are already downloaded.
   * @returns {Promise<boolean>}
   */
  async checkModelReady() {
    const modelFolder = path.join(this.modelsPath, 'Xenova', 'nllb-200-distilled-600M');
    if (!fs.existsSync(modelFolder)) return false;
    
    const requiredFiles = ['tokenizer.json', 'config.json'];
    for (const f of requiredFiles) {
      if (!fs.existsSync(path.join(modelFolder, f))) return false;
    }

    const onnxFolder = path.join(modelFolder, 'onnx');
    const findOnnx = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir).filter(f => f.endsWith('.onnx') && !f.includes('.tmp'));
    };

    const allOnnx = [...findOnnx(modelFolder), ...findOnnx(onnxFolder)];
    return allOnnx.length > 0;
  }

  /**
   * Translates text using a remote LibreTranslate instance.
   * @param {string} text 
   * @param {string} targetLang 
   * @returns {Promise<string>}
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
        logger.warn('TRANSLATION', 'LibreTranslate unavailable, falling back to local.', err.message);
      }
      return null;
    }
  }

  /**
   * Performs an incremental translation by detecting only new segments.
   * @param {string} text - The full current text.
   * @param {string} previousText - The text that was already translated.
   * @param {string} targetLang 
   * @returns {Promise<string>} - The newly translated segment.
   */
  async translateIncremental(text, previousText, targetLang) {
    if (!text) return "";
    
    // 1. Identify the new portion
    let newPart = "";
    if (text.startsWith(previousText)) {
      newPart = text.slice(previousText.length);
    } else {
      // If the text changed significantly (e.g., corrected by model), re-translate the whole thing
      // but let's try to be smart about it later. For now, just re-translate.
      newPart = text;
    }

    if (!newPart || newPart.trim().length === 0) return "";

    // 2. Check word-level cache for very short segments (common in live transcription)
    const cacheKey = `${targetLang}:${newPart.trim().toLowerCase()}`;
    if (this.liveCache.has(cacheKey)) return this.liveCache.get(cacheKey);

    // 3. Translate the new segment
    let translated = await this.translateLibre(newPart, targetLang);
    
    // Fallback to local if Libre fails
    if (!translated) {
      translated = await this.translate(newPart, targetLang);
    }

    // 4. Cache and return
    if (translated) {
      this.liveCache.set(cacheKey, translated);
    }
    
    return translated || newPart;
  }

  /**
   * Translates text to the target language.
   * @param {string} text 
   * @param {string} targetLang 
   * @returns {Promise<string>}
   */
  async translate(text, targetLang) {
    if (!text || text.trim().length < 2) return text;

    // Normalize for cache key consistency
    const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
    const cacheKey = `${targetLang}:${normalized}`;
    const cache = store.getTranslationCache();

    if (cache[cacheKey]) return cache[cacheKey];

    // Try LibreTranslate first as it's typically faster and more capable
    const remoteResult = await this.translateLibre(text, targetLang);
    if (remoteResult) {
      cache[cacheKey] = remoteResult;
      store.saveTranslationCache(cache);
      return remoteResult;
    }

    // Fallback to local worker
    const worker = this.getWorker();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.pendingTranslations.has(id)) {
          this.pendingTranslations.get(id).reject(new Error("Translation timeout"));
          this.pendingTranslations.delete(id);
        }
      }, 15000);

      this.pendingTranslations.set(id, { 
        resolve: (val) => { clearTimeout(timeoutId); resolve(val); },
        reject: (err) => { clearTimeout(timeoutId); reject(err); }
      });
      
      worker.postMessage({ type: 'translate', id, text, targetLang, srcLang: 'pt' });
    }).then(result => {
      cache[cacheKey] = result;
      store.saveTranslationCache(cache);
      return result;
    });
  }
}

module.exports = new TranslationService();
