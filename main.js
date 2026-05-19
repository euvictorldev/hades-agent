const { app, BrowserWindow, ipcMain, globalShortcut, screen, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Modular Imports
const windowManager = require('./electron/windows/windowManager');
const { initIPC } = require('./electron/ipc');
const registerGlobalShortcuts = require('./electron/shortcuts');
const createTray = require('./electron/tray');
const appState = require('./electron/appState');
const taskService = require('./electron/services/taskService');
const dreamService = require('./electron/services/dreamService');

/**
 * Hades Application Orchestrator
 * This is the main entry point for the Electron backend.
 * It initializes core services, window management, and IPC handlers.
 */

// 1. Environment & Configuration
const loadEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value.length > 0) {
        process.env[key.trim()] = value.join('=').trim();
      }
    });
  }

  // No longer rely strictly on .env for API Key as it is managed via UI settings.
};

loadEnv();

// 2. Performance & Stability
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu'); // Mica/Transparency stability on Windows

// 3. Application Lifecycle
app.whenReady().then(() => {
  // Setup Media Permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'audioCapture', 'videoCapture'];
    callback(allowed.includes(permission));
  });

  // Initialize Core Modules
  initIPC();
  registerGlobalShortcuts();
  createTray();
  taskService.start();

  // Phase 5 - Dreaming: Process backlogs and schedule cycle
  setTimeout(() => dreamService.runDreamCycle(), 10000); // 10s after start
  setInterval(() => dreamService.runDreamCycle(), 1000 * 60 * 60 * 24); // Every 24h

  // Create Initial Windows
  windowManager.createCommandWindow();
  windowManager.createVoiceWindow();
  windowManager.createSusurroWindow();

  // Splash Window — shown at startup, auto-closes after 2.8s
  const splashWin = windowManager.createWindow('splash');
  setTimeout(() => {
    if (splashWin && !splashWin.isDestroyed()) {
      splashWin.destroy();
    }
  }, 2800);

  console.log('[MAIN] Hades Assistant initialized successfully.');
});

// 4. Global Event Handlers
app.on('before-quit', () => {
  appState.isQuitting = true;
  taskService.stop();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 5. Cross-Window Communication (Orchestration)
ipcMain.on('send-message', (event, message, image) => {
  appState.chatHasMessages = true;
  let chatWin = windowManager.get('chat');

  if (chatWin) {
    if (chatWin.isMinimized()) chatWin.restore();
    chatWin.showInactive();
    chatWin.webContents.send('new-message', message, image);

    // Recupera o foco após a janela existente ser mostrada
    const cmdWin = windowManager.get('command');
    if (cmdWin && cmdWin.isVisible()) {
      cmdWin.focus();
    }
  } else {
    chatWin = windowManager.createChatWindow(false);
    chatWin.webContents.once('did-finish-load', () => {
      chatWin.webContents.send('new-message', message, image);

      // Recupera o foco após a nova janela terminar de carregar e abrir
      const cmdWin = windowManager.get('command');
      if (cmdWin && cmdWin.isVisible()) {
        cmdWin.focus();
      }
    });
  }
});
