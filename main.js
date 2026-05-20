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
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.console.level = false; // Disable console logging in production

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

  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; // Suppress CSP warnings in Dev (Vite requires unsafe-eval)

  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:3000; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' http://localhost:3000; img-src 'self' data: blob: http://localhost:3000; font-src 'self' data: http://localhost:3000; connect-src 'self' https: wss: http://localhost:3000 ws://localhost:3000;"
        ],
      },
    });
  });

  // Initialize Core Modules
  initIPC();
  registerGlobalShortcuts();
  createTray();
  taskService.start();

  // Phase 5 - Dreaming: Process backlogs and schedule cycle
  setTimeout(() => dreamService.runDreamCycle(), 10000); // 10s after start
  setInterval(() => dreamService.runDreamCycle(), 1000 * 60 * 60 * 24); // Every 24h

  // Windows are no longer pre-created hidden at startup.
  // Pre-creating hidden transparent windows breaks Windows DWM's ability to apply setContentProtection correctly when they are later shown.
  // They will be created lazily when the user first triggers their shortcuts.

  // Splash Window — shown at startup, auto-closes after 2.8s
  const splashWin = windowManager.createWindow('splash');
  splashWin.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.destroy();
      }
    }, 3000);
  });

  log.info('[MAIN] Hades Agent initialized successfully.');
});

// 4. Global Event Handlers
app.on('before-quit', () => {
  appState.isQuitting = true;
  taskService.stop();
});

app.on('window-all-closed', () => {
  // Prevent quitting when all windows are closed, as Hades runs in the background system tray.
  // The app only quits when 'Sair' is selected in the tray menu.
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 5. Cross-Window Communication (Orchestration)
ipcMain.on('send-message', (event, message, image) => {
  log.info('');
  log.info('=== [MAIN] ============ SEND-MESSAGE START ============');
  appState.chatHasMessages = true;
  let chatWin = windowManager.get('chat');
  const cmdWin = windowManager.get('command');

  log.info(`[MAIN] chatWin exists=${!!chatWin} destroyed=${chatWin?.isDestroyed?.()}`);
  log.info(`[MAIN] cmdWin exists=${!!cmdWin} visible=${cmdWin?.isVisible?.()}`);

  if (chatWin && !chatWin.isDestroyed()) {
    if (chatWin.isMinimized()) chatWin.restore();
    log.info('[MAIN] Setting chat alwaysOnTop + show + moveTop');
    chatWin.setAlwaysOnTop(true, 'pop-up-menu');
    chatWin.show();
    chatWin.moveTop();
    log.info(`[MAIN] Chat after show: visible=${chatWin.isVisible()} alwaysOnTop=${chatWin.isAlwaysOnTop()}`);
    chatWin.webContents.send('new-message', message, image);

    // Re-raise command bar on top
    if (cmdWin?.isVisible()) {
      log.info('[MAIN] Re-raising command bar on top of chat');
      cmdWin.setAlwaysOnTop(true, 'pop-up-menu');
      cmdWin.moveTop();
      cmdWin.focus();
      cmdWin.webContents.send('focus-input');
    }
  } else {
    log.info('[MAIN] Chat window not ready, storing pending message');
    appState.pendingMessage = { message, image };
    windowManager.createChatWindow(false);
  }
  log.info('=== [MAIN] ============ SEND-MESSAGE END ==============');
  log.info('');
});

// Listener para quando o Chat e React estão totalmente carregados e montados
ipcMain.on('chat-window-ready', () => {
  log.info('');
  log.info('=== [MAIN] ============ CHAT-WINDOW-READY START ============');
  const chatWin = windowManager.get('chat');
  if (chatWin && appState.pendingMessage) {
    log.info('[MAIN] Sending pending message to chat');
    chatWin.webContents.send('new-message', appState.pendingMessage.message, appState.pendingMessage.image);
    appState.pendingMessage = null;

    // Show the newly loaded chat window above everything
    log.info('[MAIN] Showing newly loaded chat window');
    chatWin.setAlwaysOnTop(true, 'pop-up-menu');
    chatWin.show();
    chatWin.moveTop();
    log.info(`[MAIN] Chat after show: visible=${chatWin.isVisible()} alwaysOnTop=${chatWin.isAlwaysOnTop()}`);
  }

  // Re-raise command bar on top
  const cmdWin = windowManager.get('command');
  if (cmdWin?.isVisible()) {
    log.info('[MAIN] Re-raising command bar on top of chat');
    cmdWin.setAlwaysOnTop(true, 'pop-up-menu');
    cmdWin.show();
    cmdWin.moveTop();
    cmdWin.focus();
    cmdWin.webContents.send('focus-input');
  }
  console.log('=== [MAIN] ============ CHAT-WINDOW-READY END ==============');
  console.log('');
});
