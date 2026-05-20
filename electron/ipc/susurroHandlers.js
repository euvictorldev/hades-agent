const { ipcMain } = require('electron');
const store = require('../store/jsonStore');
const aiService = require('../services/aiService');
const translationService = require('../services/translationService');
const geminiLiveService = require('../services/geminiLiveService');
const windowManager = require('../windows/windowManager');
const logger = require('../services/logger');

/**
 * Registers IPC handlers for the Susurro (Transcription & Suggestions) feature.
 */
function registerSusurroHandlers() {
  // --- Suggestions Window ---
  ipcMain.on('toggle-suggestions-window', (event, show) => {
    const win = windowManager.get('suggestions') || windowManager.createSuggestionsWindow();
    if (show) {
      win.showInactive();
    } else {
      win.hide();
    }
  });

  ipcMain.handle('generate-suggestion', async (event, data) => {
    try {
      const suggestion = await aiService.generateSuggestion(data);
      if (suggestion) {
        const win = windowManager.get('suggestions');
        if (win) win.webContents.send('new-suggestion', suggestion);
        return { success: true, data: suggestion };
      }
      return { success: false, error: 'No suggestion generated' };
    } catch (error) {
      logger.error('IPC', 'generate-suggestion error', error);
      return { success: false, error: error.message };
    }
  });

  // --- Persistence ---
  ipcMain.handle('save-susurro-message', (event, msg) => {
    try {
      const history = store.getSusurroHistory();
      history.push(msg);
      store.saveSusurroHistory(history);
      return { success: true, data: true };
    } catch (error) {
      logger.error('IPC', 'save-susurro-message error', error);
      return { success: false, error: error.message };
    }
  });

  // --- Translation (SSOT from TranslationService) ---
  ipcMain.handle('susurro-translate', async (event, text, targetLang) => {
    try {
      const translation = await translationService.translate(text, targetLang);
      return { success: true, data: translation };
    } catch (error) {
      logger.error('IPC', 'susurro-translate error', error);
      return { success: false, error: error.message, data: text }; // Return original text in data as fallback
    }
  });

  ipcMain.handle('susurro-translate-incremental', async (event, text, previousText, targetLang) => {
    try {
      const translation = await translationService.translateIncremental(text, previousText, targetLang);
      return { success: true, data: translation };
    } catch (error) {
      logger.error('IPC', 'susurro-translate-incremental error', error);
      return { success: false, error: error.message };
    }
  });
  
  // --- Real-time Transcription (Gemini Live) ---
  ipcMain.on('toggle-mic', (event, enabled) => {
    logger.info('IPC', `Microphone toggled: ${enabled}`);
  });

  ipcMain.on('toggle-audio', (event, enabled) => {
    logger.info('IPC', `System audio toggled: ${enabled}`);
  });

  ipcMain.on('susurro-send-chunk', (event, chunk) => {
    geminiLiveService.sendChunk(chunk);
  });

  ipcMain.handle('susurro-start-live', async (event, personaPrompt) => {
    try {
      const started = await geminiLiveService.start(event, personaPrompt);
      return { success: started, data: started };
    } catch (error) {
      logger.error('IPC', 'susurro-start-live error', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('susurro-stop-live', async () => {
    try {
      geminiLiveService.stop();
      return { success: true, data: true };
    } catch (error) {
      logger.error('IPC', 'susurro-stop-live error', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = registerSusurroHandlers;
