const { ipcMain, BrowserWindow, globalShortcut } = require('electron');
const jsonStore = require('../store/jsonStore');
const logger = require('../services/logger');
const registerGlobalShortcuts = require('../shortcuts');

/**
 * Applies or removes content protection (Stealth Mode) on all active windows.
 * @param {boolean} enabled
 */
function applyStealthMode(enabled) {
  const allWindows = BrowserWindow.getAllWindows();
  console.log(`[SETTINGS_STEALTH] Applying stealth mode (${enabled}) to ${allWindows.length} windows.`);
  
  allWindows.forEach(win => {
    if (!win.isDestroyed()) {
      const url = win.webContents.getURL();
      const match = /\?window=([^&]+)/.exec(url);
      const name = match ? match[1] : win.getTitle() || 'unknown';
      
      try {
        const result = win.setContentProtection(enabled);
        console.log(`[SETTINGS_STEALTH] Window: ${name} (alwaysOnTop: ${win.isAlwaysOnTop()}, visible: ${win.isVisible()}) -> setContentProtection(${enabled}): ${result}`);
      } catch (err) {
        console.error(`[SETTINGS_STEALTH] Failed to set content protection on ${name}:`, err);
      }
    }
  });

  logger.info('SETTINGS', `Stealth mode ${enabled ? 'enabled' : 'disabled'}. Applied to all background windows immediately.`);
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
      const oldSettings = jsonStore.getSettings();
      const oldStealth = !!oldSettings?.general?.stealthMode;
      const newStealth = !!settings?.general?.stealthMode;
      const stealthModeChanged = oldStealth !== newStealth;

      jsonStore.saveSettings(settings);
      
      if (stealthModeChanged) {
        logger.info('SETTINGS', 'Stealth mode changed. Restarting application to apply DWM composition securely.');
        const { app } = require('electron');
        app.relaunch();
        app.exit();
        return { success: true };
      }

      applyStealthMode(newStealth);
      applyApiKey(settings.general.apiKey);
      
      // Update global shortcuts dynamically on save
      registerGlobalShortcuts();

      // Notify all active windows that settings have been updated
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send('settings-updated', settings);
        }
      });
      
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

  // Returns history data for the History tab — reads from sessions store (properly grouped)
  ipcMain.handle('get-history-data', () => {
    try {
      const sessions = jsonStore.getSessions();
      const minichat = sessions.filter(s => s.type !== 'susurro');
      const transcriptions = sessions.filter(s => s.type === 'susurro');
      return { success: true, data: { susurroHistory: transcriptions, chatHistory: minichat } };
    } catch (err) {
      logger.error('SETTINGS', 'get-history-data error', err);
      return { success: false, error: err.message };
    }
  });

  // Temporarily unregisters all global shortcuts to allow recording new keys without triggering actions
  ipcMain.handle('disable-shortcuts', () => {
    try {
      globalShortcut.unregisterAll();
      logger.info('SHORTCUTS', 'All global shortcuts temporarily unregistered (Keybind recording started).');
      return { success: true };
    } catch (err) {
      logger.error('SHORTCUTS', 'Failed to disable global shortcuts', err);
      return { success: false, error: err.message };
    }
  });

  // Re-registers all global shortcuts when recording is stopped or completed
  ipcMain.handle('enable-shortcuts', () => {
    try {
      registerGlobalShortcuts();
      logger.info('SHORTCUTS', 'All global shortcuts re-registered (Keybind recording stopped).');
      return { success: true };
    } catch (err) {
      logger.error('SHORTCUTS', 'Failed to enable global shortcuts', err);
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerSettingsHandlers, applyStealthMode };
