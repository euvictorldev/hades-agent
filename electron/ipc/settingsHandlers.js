const { ipcMain, BrowserWindow } = require('electron');
const jsonStore = require('../store/jsonStore');
const logger = require('../services/logger');

/**
 * Applies or removes content protection (Stealth Mode) on all active windows.
 * @param {boolean} enabled
 */
function applyStealthMode(enabled) {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(win => {
    if (!win.isDestroyed()) {
      win.setContentProtection(enabled);
    }
  });
  logger.info('SETTINGS', `Stealth mode ${enabled ? 'enabled' : 'disabled'} on ${allWindows.length} window(s).`);
}

/**
 * Updates the Gemini API key at runtime so services pick it up immediately.
 * @param {string} key
 */
function applyApiKey(key) {
  if (typeof key === 'string' && key.trim()) {
    process.env.VITE_GEMINI_API_KEY = key.trim();
    logger.info('SETTINGS', 'API key updated at runtime.');
  }
}

/**
 * Registers IPC handlers for application settings (get, save, stealth mode).
 */
function registerSettingsHandlers() {
  // Returns all persisted settings
  ipcMain.handle('get-settings', () => {
    return jsonStore.getSettings();
  });

  // Persists all settings and applies side-effects immediately
  ipcMain.handle('save-settings', (event, settings) => {
    try {
      jsonStore.saveSettings(settings);
      applyStealthMode(settings.general.stealthMode);
      applyApiKey(settings.general.apiKey);
      return { success: true };
    } catch (err) {
      logger.error('SETTINGS', 'save-settings error', err);
      return { success: false, error: err.message };
    }
  });

  // Standalone stealth mode toggle (used for live preview before save)
  ipcMain.handle('apply-stealth-mode', (event, enabled) => {
    try {
      applyStealthMode(enabled);
      return { success: true };
    } catch (err) {
      logger.error('SETTINGS', 'apply-stealth-mode error', err);
      return { success: false, error: err.message };
    }
  });

  // Returns history data for the History tab
  ipcMain.handle('get-history-data', () => {
    try {
      const susurroHistory = jsonStore.getSusurroHistory();
      const chatHistory = jsonStore.getChatHistory();
      return { success: true, data: { susurroHistory, chatHistory } };
    } catch (err) {
      logger.error('SETTINGS', 'get-history-data error', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerSettingsHandlers, applyStealthMode };
