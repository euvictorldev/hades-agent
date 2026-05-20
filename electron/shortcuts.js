const { globalShortcut, app } = require('electron');
const windowManager = require('./windows/windowManager');
const jsonStore = require('./store/jsonStore');
const appState = require('./appState');

/**
 * Toggles the command window and associated chat window.
 */
function toggleCommandWindow() {
  console.log('[SHORTCUTS] Toggle Command pressed!');
  const win = windowManager.get('command') || windowManager.createCommandWindow();
  const chatWin = windowManager.get('chat');
  console.log('[SHORTCUTS] Command window:', win ? 'Found/Created' : 'Failed to get');
  console.log('[SHORTCUTS] Chat window state:', chatWin ? 'Exists' : 'Not found');
  
  if (!win) {
    console.error('[SHORTCUTS] Command window is null or undefined.');
    return;
  }

  console.log('[SHORTCUTS] Command Window State - isVisible:', win.isVisible(), 'isDestroyed:', win.isDestroyed());
  
  if (win.isVisible()) {
    console.log('[SHORTCUTS] Window is visible. Hiding all windows...');
    windowManager.hideAllWindows();
  } else {
    console.log('[SHORTCUTS] Window is hidden. Showing windows...');
    windowManager.hideAllExcept(['command', 'chat']);
    win.show();
    
    // Show chat window if it exists and has an active session
    if (chatWin && !chatWin.isDestroyed() && appState.chatHasMessages) {
      console.log('[SHORTCUTS] Showing existing active chat window without stealing focus.');
      chatWin.showInactive();
    }
    
    // Explicitly focus command window and send event to ensure React input is focused
    win.focus();
    win.webContents.send('focus-input');
  }
}

/**
 * Toggles the settings window.
 */
function toggleSettingsWindow() {
  console.log('[SHORTCUTS] Toggle Settings pressed!');
  const win = windowManager.get('settings') || windowManager.createSettingsWindow();
  if (!win) {
    console.error('[SHORTCUTS] Settings window is null or undefined.');
    return;
  }
  
  if (win.isVisible()) {
    console.log('[SHORTCUTS] Settings window is visible. Hiding...');
    win.hide();
  } else {
    console.log('[SHORTCUTS] Settings window is hidden. Showing...');
    windowManager.hideAllExcept(['settings']);
    win.show();
    win.focus();
  }
}

/**
 * Registers global keyboard shortcuts for the application.
 * Handles toggling main windows and starting features via hotkeys.
 */
function registerGlobalShortcuts() {
  // Wipe all active global shortcut registrations to prevent clashing and leaks when updating
  globalShortcut.unregisterAll();

  const settings = jsonStore.getSettings();
  const shortcuts = settings.shortcuts || {
    toggleCommand: 'Alt+D',
    toggleSettings: 'Alt+S',
    toggleSusurro: 'Alt+B',
    toggleVoice: 'Alt+V'
  };

  // Toggle Command Bar & Chat
  const toggleCmdKey = shortcuts.toggleCommand || 'Alt+D';
  try {
    const registered = globalShortcut.register(toggleCmdKey, toggleCommandWindow);
    console.log(`[SHORTCUTS] Toggle Command shortcut (${toggleCmdKey}) registration status:`, registered);
  } catch (err) {
    console.error(`[SHORTCUTS] Failed to register Toggle Command shortcut (${toggleCmdKey}):`, err.message);
  }

  // Toggle Settings
  const toggleSettingsKey = shortcuts.toggleSettings || 'Alt+S';
  try {
    const settingsRegistered = globalShortcut.register(toggleSettingsKey, toggleSettingsWindow);
    console.log(`[SHORTCUTS] Toggle Settings shortcut (${toggleSettingsKey}) registration status:`, settingsRegistered);
  } catch (err) {
    console.error(`[SHORTCUTS] Failed to register Toggle Settings shortcut (${toggleSettingsKey}):`, err.message);
  }

  // Toggle Susurro (Live Transcription)
  const toggleSusurroKey = shortcuts.toggleSusurro || 'Alt+B';
  try {
    const susurroRegistered = globalShortcut.register(toggleSusurroKey, () => {
      const win = windowManager.get('susurro') || windowManager.createSusurroWindow();
      if (win.isVisible()) {
        win.hide();
      } else {
        windowManager.hideAllExcept(['susurro', 'suggestions']);
        win.show();
        win.focus();
        // Sinaliza o frontend para iniciar a conexão imediatamente
        win.webContents.send('start-susurro');
      }
    });
    console.log(`[SHORTCUTS] Toggle Susurro shortcut (${toggleSusurroKey}) registration status:`, susurroRegistered);
  } catch (err) {
    console.error(`[SHORTCUTS] Failed to register Toggle Susurro shortcut (${toggleSusurroKey}):`, err.message);
  }

  // Trigger Voice Command
  const toggleVoiceKey = shortcuts.toggleVoice || 'Alt+V';
  try {
    const voiceRegistered = globalShortcut.register(toggleVoiceKey, () => {
      const win = windowManager.get('voice') || windowManager.createVoiceWindow();
      if (win.isVisible()) {
        win.hide();
      } else {
        windowManager.hideAllExcept(['voice']);
        win.show();
        win.focus();
        // Envia o evento para começar a gravar imediatamente após abrir
        win.webContents.send('start-voice');
      }
    });
    console.log(`[SHORTCUTS] Toggle Voice shortcut (${toggleVoiceKey}) registration status:`, voiceRegistered);
  } catch (err) {
    console.error(`[SHORTCUTS] Failed to register Toggle Voice shortcut (${toggleVoiceKey}):`, err.message);
  }
}

module.exports = registerGlobalShortcuts;
