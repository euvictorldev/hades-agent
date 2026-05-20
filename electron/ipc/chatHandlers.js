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

  ipcMain.handle('end-session', async (event, type) => {
    try {
      const isSusurro = type === 'susurro';
      const history = isSusurro ? store.getSusurroHistory() : store.getChatHistory();

      if (!history || history.length === 0) {
        return { success: true, data: { message: 'No active session' } };
      }

      // UI clears immediately to avoid delay
      if (isSusurro) {
        store.saveSusurroHistory([]);
      } else {
        store.saveChatHistory([]);
        appState.chatHasMessages = false;
        const windowManager = require('../windows/windowManager');
        const chatWin = windowManager.get('chat');
        if (chatWin && !chatWin.isDestroyed()) {
          chatWin.hide();
        }
      }

      const windowManager = require('../windows/windowManager');
      const cmdWin = windowManager.get('command');
      if (cmdWin && !cmdWin.isDestroyed()) {
        cmdWin.webContents.send('focus-input');
        cmdWin.focus(); // Ensure it receives OS-level focus if possible
      }

      // Run AI session generation asynchronously without blocking the UI
      let firstMessageContent = 'Nova Sessão';
      const firstUserMessage = history.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        if (firstUserMessage.parts) {
          const textPart = firstUserMessage.parts.find(p => p.text);
          if (textPart) firstMessageContent = textPart.text;
        } else if (firstUserMessage.text) {
          firstMessageContent = firstUserMessage.text;
        } else if (firstUserMessage.content) {
          firstMessageContent = firstUserMessage.content;
        }
      }

      const aiService = require('../services/aiService');
      const title = await aiService.generateSessionTitle(firstMessageContent);

      const session = {
        id: Date.now().toString(),
        title,
        type: type || 'minichat',
        timestamp: new Date().toISOString(),
        messages: history
      };

      const sessions = store.getSessions();
      sessions.push(session);
      store.saveSessions(sessions);

      return { success: true, data: session };
    } catch (error) {
      logger.error('IPC', 'end-session error', error);
      return { success: false, error: error.message };
    }
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
