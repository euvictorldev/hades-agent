const { ipcMain, BrowserWindow } = require('electron');
const windowManager = require('../windows/windowManager');
const appState = require('../appState');

/**
 * Registers IPC handlers for window manipulation (close, minimize, resize).
 */
function registerWindowHandlers() {
  /**
   * Generic handler to hide the active window.
   */
  ipcMain.handle('close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const settingsWin = windowManager.get('settings');
      if (win === settingsWin) {
        win.hide();
      } else {
        windowManager.hideAllWindows();
      }
      return { success: true };
    }
    return { success: false, error: "Window not found" };
  });

  /**
   * Generic handler to minimize the active window.
   */
  ipcMain.handle('minimize-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
      return { success: true };
    }
    return { success: false, error: "Window not found" };
  });

  /**
   * Resizes the active window.
   */
  ipcMain.handle('resize-window', (event, { width, height }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setSize(width, height);
      return { success: true };
    }
    return { success: false, error: "Window not found" };
  });



  /**
   * Toggles the "always on top" state of the active window.
   */
  ipcMain.on('toggle-pin', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const isPinned = win.isAlwaysOnTop();
      win.setAlwaysOnTop(!isPinned);
      
      const chatWin = windowManager.get('chat');
      const susurroWin = windowManager.get('susurro');
      if (win === chatWin) {
        appState.isChatPinned = !isPinned;
      } else if (win === susurroWin) {
        appState.isSusurroPinned = !isPinned;
      }
    }
  });

  /**
   * Returns whether the active window is pinned.
   */
  ipcMain.handle('is-pinned', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isAlwaysOnTop() : false;
  });

  /**
   * Enables manual resizing for frameless windows.
   */
  ipcMain.on('start-resizing', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    // On Windows, we can use win.setResizable(true) if it was false, 
    // but usually we just want to trigger the system resize if possible.
    // For now, just ensuring it's resizable.
    if (win) win.setResizable(true);
  });

  /**
   * Specifically updates the chat/susurro pin state in appState.
   */
  ipcMain.on('update-chat-pin', (event, pinned) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setAlwaysOnTop(pinned);
      
      const chatWin = windowManager.get('chat');
      const susurroWin = windowManager.get('susurro');
      if (win === chatWin) {
        appState.isChatPinned = pinned;
      } else if (win === susurroWin) {
        appState.isSusurroPinned = pinned;
      }
    }
  });

  /**
   * Shows the chat window.
   */
  ipcMain.on('show-chat', () => {
    const chatWin = windowManager.get('chat') || windowManager.createChatWindow();
    chatWin.show();
    chatWin.focus();
  });

  /**
   * Returns whether the active window is minimized.
   */
  ipcMain.handle('is-minimized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMinimized() : false;
  });

  /**
   * Returns whether the active window is maximized.
   */
  ipcMain.handle('is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });

  /**
   * Hides the notification window after its exit animation completes.
   */
  ipcMain.on('notif-hidden', () => {
    const notifWin = windowManager.get('notification');
    if (notifWin && !notifWin.isDestroyed()) {
      notifWin.hide();
    }
  });

  /**
   * Shows a notification triggered by the AI tool ("notify").
   * Creates the window if needed, waits for it to load, then sends the text.
   */
  ipcMain.on('show-notification', (event, text) => {
    let notifWin = windowManager.get('notification');
    if (!notifWin) {
      notifWin = windowManager.createNotificationWindow();
    }
    const sendNotify = () => {
      notifWin.showInactive();
      notifWin.webContents.send('notify', text);
    };
    if (notifWin.webContents.isLoading()) {
      notifWin.webContents.once('did-finish-load', sendNotify);
    } else {
      sendNotify();
    }
  });
}

module.exports = registerWindowHandlers;
