const { BrowserWindow, shell, app, Menu } = require('electron');
const configs = require('./windowConfigs');

/**
 * WindowManager handles the lifecycle and management of all application windows.
 * It provides a centralized way to create, retrieve, and configure windows.
 */
class WindowManager {
  constructor() {
    /** @type {Object<string, BrowserWindow>} */
    this.windows = {};
  }

  /**
   * Retrieves an existing window instance by name.
   * @param {string} name 
   * @returns {BrowserWindow|null}
   */
  get(name) {
    return this.windows[name];
  }

  /**
   * Hides all visible windows.
   */
  hideAllWindows() {
    console.log('[WINDOW_MANAGER] Hiding all windows');
    Object.values(this.windows).forEach(win => {
      if (win && !win.isDestroyed() && win.isVisible()) {
        win.hide();
      }
    });
  }

  /**
   * Hides all modes/windows except the specified one(s).
   * @param {string[]} excludeNames - Windows that should remain untouched.
   */
  hideAllExcept(excludeNames = []) {
    console.log(`[WINDOW_MANAGER] Hiding all windows except: ${excludeNames.join(', ')}`);
    Object.entries(this.windows).forEach(([name, win]) => {
      if (win && !win.isDestroyed() && win.isVisible() && !excludeNames.includes(name)) {
        win.hide();
      }
    });
  }

  /**
   * Internal method to create a window based on configuration.
   * @param {string} name 
   * @returns {BrowserWindow}
   */
  createWindow(name) {
    console.log(`[WINDOW_MANAGER] createWindow called for: ${name}`);
    if (this.windows[name] && !this.windows[name].isDestroyed()) {
      console.log(`[WINDOW_MANAGER] Reusing existing window for: ${name}`);
      return this.windows[name];
    }

    console.log(`[WINDOW_MANAGER] Creating new window for: ${name}`);
    const config = configs[name];
    if (!config) throw new Error(`Window configuration for "${name}" not found.`);

    const win = new BrowserWindow(config);
    this.windows[name] = win;

    // Load URL or File
    console.log(`[WINDOW_MANAGER] Loading URL for ${name}:`, config.url);
    win.loadURL(config.url);

    // Run custom initialization
    if (config.onInit) {
      console.log(`[WINDOW_MANAGER] Running onInit for: ${name}`);
      config.onInit(win);
    }

    // Setup default handlers
    this.setupExternalLinks(win);

    // Setup DevTools and Shortcuts
    win.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        console.log(`[WINDOW_MANAGER] Ctrl+Shift+I detected on window: ${name}`);
        if (win.webContents.isDevToolsOpened()) {
          console.log(`[WINDOW_MANAGER] Closing DevTools for: ${name}`);
          win.webContents.closeDevTools();
        } else {
          console.log(`[WINDOW_MANAGER] Opening DevTools for: ${name}`);
          win.webContents.openDevTools({ mode: 'detach' });
        }
        event.preventDefault();
      }
    });

    // Add specific event logs for debugging
    win.webContents.on('did-finish-load', () => {
      console.log(`[WINDOW_MANAGER] Window loaded: ${name}`);
    });

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`[WINDOW_MANAGER] Window failed to load: ${name}. Error: ${errorCode} - ${errorDescription}`);
    });

    win.webContents.on('devtools-opened', () => {
      console.log(`[WINDOW_MANAGER] DevTools opened for: ${name}`);
    });

    win.webContents.on('devtools-closed', () => {
      console.log(`[WINDOW_MANAGER] DevTools closed for: ${name}`);
    });

    // Cleanup on close
    win.on('closed', () => {
      console.log(`[WINDOW_MANAGER] Window closed: ${name}`);
      this.windows[name] = null;
    });

    // Apply stealth mode to newly created windows
    try {
      const store = require('../store/jsonStore');
      const settings = store.getSettings();
      const isStealth = !!(settings && settings.general && settings.general.stealthMode);
      win.setContentProtection(isStealth);
    } catch (e) {
      console.error(`[WINDOW_MANAGER] Failed to apply initial stealth mode for ${name}:`, e);
    }

    // Ensure content protection is enforced whenever the window is shown (prevents OS resets)
    win.on('show', () => {
      setTimeout(() => {
        if (win.isDestroyed()) return;
        try {
          const store = require('../store/jsonStore');
          const settings = store.getSettings();
          const isStealth = !!(settings && settings.general && settings.general.stealthMode);
          win.setContentProtection(isStealth);
          console.log(`[WINDOW_MANAGER] Enforced stealth mode (${isStealth}) on show for: ${name}`);
        } catch (e) {
          console.error(`[WINDOW_MANAGER] Failed to enforce stealth mode on show for ${name}:`, e);
        }
      }, 100);
    });

    return win;
  }

  // --- Specific Window Wrappers ---

  createCommandWindow() {
    const win = this.createWindow('command');
    
    win.on('blur', () => {
      console.log('[WINDOW_MANAGER] Command window blurred, checking in 150ms');
      setTimeout(() => {
        if (win.isDestroyed()) return;
        if (win.isFocused()) {
          console.log('[WINDOW_MANAGER] Command window regained focus, keeping visible');
          return;
        }
        
        // Se o DevTools estiver aberto, não esconde a janela no blur para permitir a depuração
        if (win.webContents.isDevToolsOpened()) {
          console.log('[WINDOW_MANAGER] DevTools estão abertos, mantendo a janela visível.');
          return;
        }
        
        const appState = require('../appState');
        const focusedWin = BrowserWindow.getFocusedWindow();
        const chatWin = this.get('chat');
        const isChatFocused = focusedWin && focusedWin === chatWin;
        
        if (!isChatFocused && focusedWin !== win) {
          win.hide();
          if (chatWin && !chatWin.isDestroyed() && !appState.isChatPinned) {
            chatWin.hide();
          }
        }
      }, 150);
    });

    win.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        win.hide();
      }
    });
    return win;
  }

  createChatWindow(showActive = true) {
    const win = this.createWindow('chat');
    
    win.on('blur', () => {
      console.log('[WINDOW_MANAGER] Chat window blurred, checking in 150ms');
      setTimeout(() => {
        if (win.isDestroyed()) return;
        if (win.isFocused()) {
          console.log('[WINDOW_MANAGER] Chat window regained focus, keeping visible');
          return;
        }
        
        const appState = require('../appState');
        const focusedWin = BrowserWindow.getFocusedWindow();
        const cmdWin = this.get('command');
        const isCommandFocused = focusedWin && focusedWin === cmdWin;
        
        if (!appState.isChatPinned && !isCommandFocused && focusedWin !== win) {
          win.hide();
          if (cmdWin && !cmdWin.isDestroyed()) {
            cmdWin.hide();
          }
        }
      }, 150);
    });

    if (showActive) {
      win.show();
      win.focus();
    } else {
      win.showInactive();
    }
    return win;
  }

  createVoiceWindow() {
    const win = this.createWindow('voice');
    win.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        win.blur();
        win.hide();
      }
    });

    win.on('blur', () => {
      console.log('[WINDOW_MANAGER] Voice window blurred');
      if (win.webContents.isDevToolsOpened()) {
        console.log('[WINDOW_MANAGER] DevTools are open, keeping voice window visible.');
        return;
      }
      win.hide();
    });
    return win;
  }

  createSusurroSetupWindow() {
    const win = this.createWindow('susurroSetup');
    win.once('ready-to-show', () => win.show());
    return win;
  }

  createSusurroWindow() {
    const win = this.createWindow('susurro');
    
    win.on('blur', () => {
      console.log('[WINDOW_MANAGER] Susurro window blurred, checking in 150ms');
      setTimeout(() => {
        if (win.isDestroyed()) return;
        if (win.isFocused()) {
          console.log('[WINDOW_MANAGER] Susurro window regained focus, keeping visible');
          return;
        }
        
        if (win.webContents.isDevToolsOpened()) {
          console.log('[WINDOW_MANAGER] DevTools are open, keeping Susurro window visible.');
          return;
        }
        const appState = require('../appState');
        if (!appState.isSusurroPinned) {
          win.hide();
        }
      }, 150);
    });

    win.on('minimize', () => {
      console.log('[WINDOW_MANAGER] Susurro window minimized, stopping session');
      win.webContents.send('stop-susurro');
    });

    win.on('hide', () => {
      console.log('[WINDOW_MANAGER] Susurro window hidden, stopping session');
      win.webContents.send('stop-susurro');
    });

    win.on('close', (event) => {
      const { app } = require('electron');
      if (!app.isQuitting) {
        event.preventDefault();
        win.hide();
      }
    });
    
    return win;
  }

  createSuggestionsWindow() {
    return this.createWindow('suggestions');
  }

  createNotificationWindow() {
    return this.createWindow('notification');
  }

  createSettingsWindow() {
    const win = this.createWindow('settings');
    win.once('ready-to-show', () => win.show());
    // Settings window should not close on blur
    win.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        win.hide();
      }
    });
    return win;
  }

  /**
   * Configures a window to open external links in the default system browser.
   * @param {BrowserWindow} window 
   */
  setupExternalLinks(window) {
    window.webContents.on('will-navigate', (event, url) => {
      // Allow internal navigation (localhost or file protocol)
      const isInternal = url.startsWith('http://localhost') || url.startsWith('file://');
      if (!isInternal) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }
}

module.exports = new WindowManager();
