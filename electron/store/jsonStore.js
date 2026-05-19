const { app } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

/**
 * JsonStore provides a centralized persistence layer for the application.
 * It manages various JSON files for tasks, history, personas, and configuration.
 * This is the Single Source of Truth for on-disk data.
 */
class JsonStore {
  constructor() {
    this.userDataPath = app.getPath('userData');
    
    this.paths = {
      tasks: path.join(this.userDataPath, 'tasks.json'),
      history: path.join(this.userDataPath, 'chat_history.json'),
      tokens: path.join(this.userDataPath, 'tokens.json'),
      translation: path.join(this.userDataPath, 'translation_cache.json'),
      susurro: path.join(this.userDataPath, 'susurro_history.json'),
      personas: path.join(this.userDataPath, 'personas.json'),
      settings: path.join(this.userDataPath, 'settings.json')
    };

    /** Default settings schema */
    const defaultSettings = {
      audio: {
        inputDeviceId: 'default',
        outputDeviceId: 'default',
        micEnabled: true,
        micVolume: 100,
        systemAudioEnabled: true,
        systemAudioVolume: 100
      },
      general: {
        apiKey: '',
        minichatModel: 'gemini-2.5-flash',
        sttModel: 'gemini-2.5-flash',
        fullTranscriptionModel: 'gemini-2.5-flash',
        stealthMode: false
      }
    };

    /** In-memory cache of stored data */
    this.cache = {
      tasks: [],
      chatHistory: [],
      personas: [],
      susurroHistory: [],
      totalTokens: 0,
      translationCache: {},
      settings: defaultSettings
    };

    this._defaultSettings = defaultSettings;

    this.loadAll();
  }

  /**
   * Loads all files from disk into memory.
   * @private
   */
  loadAll() {
    this.cache.tasks = this.safeLoad(this.paths.tasks, []);
    this.cache.chatHistory = this.safeLoad(this.paths.history, []);
    this.cache.personas = this.safeLoad(this.paths.personas, []);
    this.cache.susurroHistory = this.safeLoad(this.paths.susurro, []);
    this.cache.totalTokens = this.safeLoad(this.paths.tokens, { total: 0 }).total || 0;
    this.cache.translationCache = this.safeLoad(this.paths.translation, {});
    // Deep merge so new keys from defaultSettings survive missing fields in saved file
    const saved = this.safeLoad(this.paths.settings, {});
    this.cache.settings = {
      audio: { ...this._defaultSettings.audio, ...(saved.audio || {}) },
      general: { ...this._defaultSettings.general, ...(saved.general || {}) }
    };
  }

  /**
   * Safely loads a JSON file, returning a default value if it fails.
   * @private
   */
  safeLoad(filePath, defaultValue) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.error(`[STORE] Load error for ${path.basename(filePath)}:`, e.message);
    }
    return defaultValue;
  }

  /**
   * Safely saves data to a JSON file.
   * @private
   */
  safeSave(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`[STORE] Save error for ${path.basename(filePath)}:`, e.message);
    }
  }

  // --- Data Accessors ---

  getTasks() { return this.cache.tasks; }
  saveTasks(tasks) {
    this.cache.tasks = tasks;
    this.safeSave(this.paths.tasks, tasks);
  }

  getChatHistory() { return this.cache.chatHistory; }
  saveChatHistory(history) {
    this.cache.chatHistory = history;
    this.safeSave(this.paths.history, history);
  }

  getPersonas() { return this.cache.personas; }
  savePersonas(personas) {
    this.cache.personas = personas;
    this.safeSave(this.paths.personas, personas);
  }

  getSusurroHistory() { return this.cache.susurroHistory; }
  saveSusurroHistory(history) {
    this.cache.susurroHistory = history;
    this.safeSave(this.paths.susurro, history);
  }

  getTotalTokens() { return this.cache.totalTokens; }
  saveTokens(total) {
    this.cache.totalTokens = total;
    this.safeSave(this.paths.tokens, { total });
  }

  getTranslationCache() { return this.cache.translationCache; }
  saveTranslationCache(cache) {
    this.cache.translationCache = cache;
    
    // Prune cache if it grows too large (keep last 5000 items)
    const keys = Object.keys(cache);
    if (keys.length > 5000) {
      const toRemove = keys.slice(0, -5000);
      toRemove.forEach(k => delete cache[k]);
    }
    
    this.safeSave(this.paths.translation, cache);
  }

  getSettings() { return this.cache.settings; }
  saveSettings(settings) {
    this.cache.settings = settings;
    this.safeSave(this.paths.settings, settings);
  }
}

module.exports = new JsonStore();
