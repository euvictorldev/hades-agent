const registerWindowHandlers = require('./windowHandlers');
const registerChatHandlers = require('./chatHandlers');
const registerPersonaHandlers = require('./personaHandlers');
const registerTaskHandlers = require('./taskHandlers');
const registerSusurroHandlers = require('./susurroHandlers');
const registerToolHandlers = require('./toolHandlers');
const registerVoiceHandlers = require('./voiceHandlers');
const { registerSettingsHandlers } = require('./settingsHandlers');

/**
 * Initializes all IPC (Inter-Process Communication) handlers.
 * This is the entry point for backend-frontend communication.
 */
function initIPC() {
  registerWindowHandlers();
  registerChatHandlers();
  registerPersonaHandlers();
  registerTaskHandlers();
  registerSusurroHandlers();
  registerToolHandlers();
  registerVoiceHandlers();
  registerSettingsHandlers();
}

module.exports = { initIPC };
