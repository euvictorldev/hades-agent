const { screen, app } = require('electron');
const path = require('node:path');

/**
 * Window Configurations for the Hades Application.
 * This acts as the Single Source of Truth for window dimensions, properties, and paths.
 */

const isPackaged = app.isPackaged;
const baseUrl = isPackaged
  ? `file://${path.join(__dirname, '../../dist/index.html')}`
  : 'http://localhost:3000';

const preloadPath = path.join(__dirname, '../../preload.js');

const windowConfigs = {
  command: {
    width: 730,
    height: 480,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    resizable: true,
    movable: true,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=command`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
      const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
      win.setPosition(Math.floor((screenWidth - 730) / 2), 40);
    }
  },
  chat: {
    width: 480,
    height: 490,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    resizable: true,
    minWidth: 400,
    minHeight: 400,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=chat`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
      const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
      win.setPosition(Math.floor((screenWidth - 480) / 2), 180);
    }
  },
  voice: {
    width: 480,
    height: 420,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    resizable: false,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=voice`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
    }
  },
  susurroSetup: {
    width: 440,
    height: 520,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    resizable: false,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=susurro-setup`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
    }
  },
  susurro: {
    width: 520,
    height: 680,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: false,
    show: false,
    resizable: true,
    minWidth: 360,
    minHeight: 400,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=susurro`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
    }
  },
  suggestions: {
    width: 600,
    height: 60,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    resizable: false,
    focusable: false,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=suggestions`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    onInit: (win) => {
      const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
      win.setPosition(Math.floor((screenWidth - 600) / 2), 20);
    }
  },
  notification: {
    width: 400,
    height: 100,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    focusable: false,
    url: `file://${path.join(__dirname, '../../public/notification.html')}`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    onInit: (win) => {
      const { width: screenWidth } = screen.getPrimaryDisplay().workArea;
      win.setPosition(Math.floor(screenWidth / 2 - 200), 50);
    }
  },
  splash: {
    width: 960,
    height: 240,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=splash`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    onInit: (win) => {
      const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
      win.setPosition(
        Math.floor((sw - 960) / 2),
        Math.floor((sh - 240) / 2)
      );
      win.setAlwaysOnTop(true, 'screen-saver');
      win.once('ready-to-show', () => {
        console.log('[WINDOW_CONFIGS] Splash window ready-to-show, showing now');
        win.show();
      });
    }
  },
  settings: {
    width: 820,
    height: 580,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: false,
    show: false,
    resizable: false,
    backgroundColor: '#00000000',
    url: `${baseUrl}?window=settings`,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: false,
    },
    onInit: (win) => {
      if (process.platform === 'win32') win.setBackgroundMaterial('mica');
      const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
      win.setPosition(
        Math.floor((sw - 820) / 2),
        Math.floor((sh - 580) / 2)
      );
    }
  }
};

module.exports = windowConfigs;
