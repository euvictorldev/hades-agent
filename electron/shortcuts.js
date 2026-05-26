const { globalShortcut, app } = require('electron');
const windowManager = require('./windows/windowManager');
const jsonStore = require('./store/jsonStore');
const appState = require('./appState');

/**
 * Toggles the chat window.
 */
function toggleCommandWindow() {
  const { BrowserWindow } = require('electron');
  console.log('');
  console.log('=== [SHORTCUTS] ============ TOGGLE CHAT START ============');
  
  let chatWin = windowManager.get('chat');
  const isNew = !chatWin;

  if (isNew) {
    // Pass false to createChatWindow so it doesn't instantly steal focus before we check visibility
    chatWin = windowManager.createChatWindow(false);
  }
  
  const logWinState = (label, w) => {
    if (!w || w.isDestroyed()) {
      console.log(`  [${label}] NULL or DESTROYED`);
      return;
    }
    const bounds = w.getBounds();
    console.log(`  [${label}] visible=${w.isVisible()} focused=${w.isFocused()} alwaysOnTop=${w.isAlwaysOnTop()} minimized=${w.isMinimized()} bounds=[${bounds.x},${bounds.y},${bounds.width}x${bounds.height}]`);
  };

  console.log('[SHORTCUTS] --- INITIAL STATE ---');
  logWinState('CHAT', chatWin);
  console.log(`[SHORTCUTS] chatHasMessages=${appState.chatHasMessages} isChatPinned=${appState.isChatPinned}`);
  console.log(`[SHORTCUTS] Currently focused window: ${BrowserWindow.getFocusedWindow()?.getTitle?.() || 'NONE (external app)'}`);
  
  if (!chatWin) {
    console.error('[SHORTCUTS] Chat window is null or undefined. ABORTING.');
    return;
  }
  
  // If the window is new, we always want to show it. Otherwise, toggle based on visibility.
  if (!isNew && chatWin.isVisible()) {
    console.log('[SHORTCUTS] === ACTION: HIDE ALL ===');
    windowManager.hideAllWindows();
  } else {
    console.log('[SHORTCUTS] === ACTION: SHOW WINDOWS ===');
    windowManager.hideAllExcept(['chat']);

    console.log('[SHORTCUTS] --- SHOW CHAT ---');
    console.log('[SHORTCUTS] calling chatWin.show()');
    chatWin.show();
    logWinState('CHAT after show()', chatWin);
    chatWin.focus();
    chatWin.webContents.send('focus-input');

    // Deferred state check
    setTimeout(() => {
      if (chatWin.isDestroyed()) return;
      logWinState('CHAT', chatWin);
    }, 50);

    setTimeout(() => {
      if (chatWin.isDestroyed()) return;
      logWinState('CHAT', chatWin);
    }, 300);
  }
  
  console.log('=== [SHORTCUTS] ============ TOGGLE CHAT END ==============');
  console.log('');
}

/**
 * Toggles the settings window.
 */
function toggleSettingsWindow() {
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

function registerShortcut(name, key, handler) {
  try {
    const registered = globalShortcut.register(key, handler);
    console.log(`[SHORTCUTS] Toggle ${name} shortcut (${key}): ${registered ? '✓ OK' : '✗ FAILED'}`);
    return registered;
  } catch (err) {
    console.error(`[SHORTCUTS] Toggle ${name} shortcut (${key}): EXCEPTION - ${err.message}`);
    return false;
  }
}

/**
 * Registers global keyboard shortcuts for the application.
 */
function registerGlobalShortcuts(retryCount = 0) {
  // Wipe all active global shortcut registrations to prevent clashing and leaks when updating
  globalShortcut.unregisterAll();

  const settings = jsonStore.getSettings();
  const shortcuts = settings.shortcuts || {
    toggleCommand: 'Alt+D',
    toggleSettings: 'Alt+S',
    toggleSusurro: 'Alt+B'
  };

  let allRegistered = true;

  // Toggle Command Bar & Chat
  if (!registerShortcut('Command', shortcuts.toggleCommand || 'Alt+D', toggleCommandWindow)) allRegistered = false;

  // Toggle Settings
  if (!registerShortcut('Settings', shortcuts.toggleSettings || 'Alt+S', toggleSettingsWindow)) allRegistered = false;

  // Toggle Susurro (Live Transcription)
  if (!registerShortcut('Susurro', shortcuts.toggleSusurro || 'Alt+B', () => {
    const win = windowManager.get('susurro') || windowManager.createSusurroWindow();
    if (win.isVisible()) {
      win.hide();
    } else {
      windowManager.hideAllExcept(['susurro', 'suggestions']);
      win.show();
      win.focus();
      win.webContents.send('force-susurro-mode');
    }
  })) allRegistered = false;

  // Retry if any shortcut failed (zombie process may still be releasing)
  if (allRegistered) {
    console.log('[SHORTCUTS] ✓ All shortcuts registered successfully.');
  } else if (retryCount < 3) {
    const delay = (retryCount + 1) * 1500;
    console.warn(`[SHORTCUTS] ⚠ Some shortcuts failed to register. Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`);
    setTimeout(() => registerGlobalShortcuts(retryCount + 1), delay);
  } else {
    console.error('[SHORTCUTS] ✗ CRITICAL: Shortcuts failed after 3 retries. A zombie Electron process may be holding them.');
  }
}

module.exports = registerGlobalShortcuts;
