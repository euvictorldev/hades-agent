const { ipcMain, shell, desktopCapturer, clipboard } = require('electron');
const { exec } = require('node:child_process');
const logger = require('../services/logger');
const skillService = require('../services/skillService');
const sessionLogger = require('../services/sessionLogger');
const searchService = require('../services/searchService');

/**

 * Registers IPC handlers for utility tools like web search and external link opening.
 */
function registerToolHandlers() {
  /**
   * Skills System
   */
  ipcMain.handle('save-skill', async (event, args) => {
    return await skillService.saveSkill(args);
  });
  
  ipcMain.handle('list-skills', async () => {
    return await skillService.listSkills();
  });
  
  ipcMain.handle('load-skill', async (event, name) => {
    return await skillService.loadSkill(name);
  });

  /**
   * Web Search
   */
  ipcMain.handle('search-web', async (event, query) => {
    return await searchService.searchWeb(query);
  });

  /**
   * Session / Dreaming System
   */
  ipcMain.handle('log-session', async (event, sessionData) => {
    return sessionLogger.logSession(sessionData);
  });
  
  ipcMain.handle('get-learnings', async () => {
    const dreamService = require('../services/dreamService');
    return dreamService.getLearnings();
  });

  /**
   * Opens a URL in the system's default browser.
   */

  ipcMain.on('open-external', (event, url) => {
    if (url) shell.openExternal(url);
  });

  ipcMain.on('copy-to-clipboard', (event, text) => {
    clipboard.writeText(text || '');
  });

  /**
   * Retrieves the system audio source ID for Hadesback capture.
   */
  ipcMain.handle('get-system-audio-source-id', async () => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
      // Usually, we pick the primary screen or a specific "System" source if available
      const systemSource = sources.find(s =>
        s.name.toLowerCase().includes('screen') ||
        s.name.toLowerCase().includes('tela') ||
        s.id.startsWith('screen')
      ) || sources[0];

      if (systemSource) {
        return { success: true, data: systemSource.id };
      }
      return { success: false, error: 'Source not found' };
    } catch (error) {
      logger.error('IPC', 'get-system-audio-source-id error', error);
      return { success: false, error: error.message };
    }
  });
  /**
   * Retrieves all available screen and window sources.
   */
  ipcMain.handle('get-sources', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 150, height: 150 }
      });
      return {
        success: true, data: sources.map(s => ({
          id: s.id,
          name: s.name,
          thumbnail: s.thumbnail.toDataURL()
        }))
      };
    } catch (error) {
      logger.error('IPC', 'get-screen-sources error', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Captures all screens and returns their thumbnails as data URLs.
   */
  ipcMain.handle('capture-all-screens', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });
      return sources.map(s => s.thumbnail.toDataURL());
    } catch (error) {
      logger.error('IPC', 'capture-all-screens error', error);
      return [];
    }
  });

}

module.exports = registerToolHandlers;
