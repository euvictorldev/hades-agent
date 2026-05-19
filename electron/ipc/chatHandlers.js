const { ipcMain } = require('electron');
const store = require('../store/jsonStore');
const appState = require('../appState');
const logger = require('../services/logger');

/**
 * Registers IPC handlers for chat-related functionality, including history and token usage.
 */
function registerChatHandlers() {
  // --- History ---
  ipcMain.handle('get-chat-history', () => {
    return { success: true, data: store.getChatHistory() };
  });
  
  ipcMain.on('save-chat-history', (event, history) => {
    store.saveChatHistory(history);
  });

  // --- Token Management ---
  ipcMain.handle('update-tokens', (event, count) => {
    try {
      const total = store.getTotalTokens() + (count || 0);
      store.saveTokens(total);
      return { success: true, data: total };
    } catch (error) {
      logger.error('IPC', 'update-tokens error', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-total-tokens', () => {
    return { success: true, data: store.getTotalTokens() };
  });

  // --- Status ---
  ipcMain.on('chat-status-update', (event, { hasMessages }) => {
    appState.chatHasMessages = hasMessages;
  });
}

module.exports = registerChatHandlers;
