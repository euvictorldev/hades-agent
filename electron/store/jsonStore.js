const { app } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const os = require('node:os');

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
      susurro: path.join(this.userDataPath, 'susurro_history.json'),
      personas: path.join(this.userDataPath, 'personas.json'),
      settings: path.join(this.userDataPath, 'settings.json'),
      sessions: path.join(this.userDataPath, 'sessions.json')
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
        tavilyApiKey: '',
        minichatModel: 'gemini-2.5-flash',
        sttModel: 'gemini-2.5-flash',
        fullTranscriptionModel: 'gemini-2.5-flash',
        stealthMode: false,
        dreamingEnabled: true,
        dreamingModel: 'gemini-2.5-flash'
      },
      shortcuts: {
        toggleCommand: 'Alt+D',
        toggleSettings: 'Alt+S',
        toggleSusurro: 'Alt+B',
        toggleVoice: 'Alt+V'
      }
    };

    /** In-memory cache of stored data */
    this.cache = {
      tasks: [],
      chatHistory: [],
      personas: [],
      susurroHistory: [],
      sessions: [],
      totalTokens: 0,
      settings: defaultSettings
    };

    this._defaultSettings = defaultSettings;

    this.loadAll();
  }

  /**
   * Helper to encrypt settings string
   * @private
   */
  encrypt(text) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(os.userInfo().username || 'hades', 'hades-salt-secure', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
      console.error('[STORE] Encryption error:', e.message);
      return text;
    }
  }

  /**
   * Helper to decrypt settings string
   * @private
   */
  decrypt(text) {
    try {
      if (!text.includes(':')) return text; // Probably not encrypted yet
      const parts = text.split(':');
      const iv = Buffer.from(parts.shift(), 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(os.userInfo().username || 'hades', 'hades-salt-secure', 32);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      console.error('[STORE] Decryption error (falling back to raw):', e.message);
      return text;
    }
  }

  /**
   * Safely loads and optionally decrypts the settings file.
   * @private
   */
  safeLoadSettings() {
    const filePath = this.paths.settings;
    try {
      if (fs.existsSync(filePath)) {
        const rawContent = fs.readFileSync(filePath, 'utf8').trim();
        if (!rawContent) return {};
        
        // Try parsing directly (if plain JSON)
        try {
          return JSON.parse(rawContent);
        } catch (e) {
          // If direct parsing fails, it's encrypted, so decrypt it
          const decrypted = this.decrypt(rawContent);
          return JSON.parse(decrypted);
        }
      }
    } catch (e) {
      console.error(`[STORE] Load settings error for ${path.basename(filePath)}:`, e.message);
    }
    return {};
  }

  /**
   * Safely encrypts and saves the settings file.
   * @private
   */
  safeSaveSettings(data) {
    const filePath = this.paths.settings;
    try {
      const serialized = JSON.stringify(data, null, 2);
      const encrypted = this.encrypt(serialized);
      fs.writeFileSync(filePath, encrypted, 'utf8');
    } catch (e) {
      console.error(`[STORE] Save settings error for ${path.basename(filePath)}:`, e.message);
    }
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
    this.cache.sessions = this.safeLoad(this.paths.sessions, []);
    this.cache.totalTokens = this.safeLoad(this.paths.tokens, { total: 0 }).total || 0;
    // Deep merge so new keys from defaultSettings survive missing fields in saved file
    const saved = this.safeLoadSettings();
    this.cache.settings = {
      audio: { ...this._defaultSettings.audio, ...(saved.audio || {}) },
      general: { ...this._defaultSettings.general, ...(saved.general || {}) },
      shortcuts: { ...this._defaultSettings.shortcuts, ...(saved.shortcuts || {}) }
    };

    // Populate env variables from settings for backward compatibility & frontend access
    process.env.VITE_GEMINI_API_KEY = this.cache.settings.general.apiKey || '';
    process.env.VITE_TAVILY_API_KEY = this.cache.settings.general.tavilyApiKey || '';
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

  getSessions() { return this.cache.sessions; }
  saveSessions(sessions) {
    this.cache.sessions = sessions;
    this.safeSave(this.paths.sessions, sessions);
  }

  getTotalTokens() { return this.cache.totalTokens; }
  saveTokens(total) {
    this.cache.totalTokens = total;
    this.safeSave(this.paths.tokens, { total });
  }

  getSettings() { return this.cache.settings; }
  saveSettings(settings) {
    this.cache.settings = settings;
    this.safeSaveSettings(settings);
    process.env.VITE_GEMINI_API_KEY = settings.general.apiKey || '';
    process.env.VITE_TAVILY_API_KEY = settings.general.tavilyApiKey || '';
  }
}

module.exports = new JsonStore();
