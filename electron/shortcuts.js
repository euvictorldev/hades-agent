const { globalShortcut, app } = require('electron');
const windowManager = require('./windows/windowManager');

/**
 * Toggles the command window and associated chat window.
 */
function toggleCommandWindow() {
  console.log('[SHORTCUTS] Alt+D pressed!');
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
    win.focus();
    
    // Show chat window if it exists (handles the case where a session is already started)
    if (chatWin && !chatWin.isDestroyed()) {
      console.log('[SHORTCUTS] Showing existing chat window.');
      chatWin.show();
    }
  }
}

/**
 * Registers global keyboard shortcuts for the application.
 * Handles toggling main windows and starting features via hotkeys.
 */
function registerGlobalShortcuts() {
  // Alt+D: Toggle Command Bar & Chat
  globalShortcut.unregister('Alt+D');
  const registered = globalShortcut.register('Alt+D', toggleCommandWindow);
  console.log('[SHORTCUTS] Alt+D registration status:', registered);

  // Alt+B: Toggle Susurro (Live Transcription)
  globalShortcut.unregister('Alt+B');
  globalShortcut.register('Alt+B', () => {
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

  // Alt+V: Trigger Voice Command
  globalShortcut.unregister('Alt+V');
  globalShortcut.register('Alt+V', () => {
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
}

module.exports = registerGlobalShortcuts;
