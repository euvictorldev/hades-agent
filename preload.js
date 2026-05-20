const { contextBridge, ipcRenderer } = require('electron');

/**
 * Electron Preload Script
 * Exposes a safe subset of Electron's IPC functionality to the renderer process.
 * Grouped by feature area for better maintainability.
 */
contextBridge.exposeInMainWorld('electron', {
  // --- Core Messaging & UI ---
  sendMessage: (message, image) => ipcRenderer.send('send-message', message, image),
  onNewChatMessage: (callback) => {
    const sub = (_event, msg, img) => callback(msg, img);
    ipcRenderer.on('new-message', sub);
    return () => ipcRenderer.removeListener('new-message', sub);
  },
  onFocusInput: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('focus-input', sub);
    return () => ipcRenderer.removeListener('focus-input', sub);
  },
  onNotify: (callback) => {
    const sub = (_event, message) => callback(message);
    ipcRenderer.on('notify', sub);
    return () => ipcRenderer.removeListener('notify', sub);
  },
  showNotification: (text) => ipcRenderer.send('show-notification', text),
  notifHidden: () => ipcRenderer.send('notif-hidden'),

  // --- Window Management ---
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  resizeWindow: (w, h) => ipcRenderer.invoke('resize-window', { width: w, height: h }),
  showChat: () => ipcRenderer.send('show-chat'),
  togglePin: () => ipcRenderer.send('toggle-pin'),
  isPinned: () => ipcRenderer.invoke('is-pinned'),
  isMinimized: () => ipcRenderer.invoke('is-minimized'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  startResizing: () => ipcRenderer.send('start-resizing'),
  updateChatPin: (pinned) => ipcRenderer.send('update-chat-pin', pinned),
  toggleMic: (enabled) => ipcRenderer.send('toggle-mic', enabled),
  toggleAudio: (enabled) => ipcRenderer.send('toggle-audio', enabled),

  // --- Chat & Persistence ---
  getChat: () => ipcRenderer.invoke('get-chat-history'),
  saveChat: (history) => ipcRenderer.send('save-chat-history', history),
  updateChatStatus: (hasMessages) => ipcRenderer.send('chat-status-update', { hasMessages }),
  updateTokens: (count) => ipcRenderer.invoke('update-tokens', count),
  getTotalTokens: () => ipcRenderer.invoke('get-total-tokens'),
  endSession: (type) => ipcRenderer.invoke('end-session', type),
  chatWindowReady: () => ipcRenderer.send('chat-window-ready'),

  // --- Tasks ---
  scheduleTask: (data) => ipcRenderer.invoke('schedule-task', data),
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  onExecuteTask: (callback) => {
    const sub = (_event, task) => callback(task);
    ipcRenderer.on('execute-scheduled-task', sub);
    return () => ipcRenderer.removeListener('execute-scheduled-task', sub);
  },

  // --- Voice & Susurro (Transcription) ---
  onStartVoice: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('start-voice', sub);
    return () => ipcRenderer.removeListener('start-voice', sub);
  },
  onVoiceSend: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('voice-send', sub);
    return () => ipcRenderer.removeListener('voice-send', sub);
  },
  startSusurroLive: (persona) => ipcRenderer.invoke('susurro-start-live', persona),
  stopSusurroLive: () => ipcRenderer.invoke('susurro-stop-live'),
  sendSusurroChunk: (base64, seq) => ipcRenderer.send('susurro-send-chunk', base64, seq),
  onSusurroLiveDelta: (callback) => {
    const sub = (_event, delta) => callback(delta);
    ipcRenderer.on('susurro-live-delta', sub);
    return () => ipcRenderer.removeListener('susurro-live-delta', sub);
  },
  onSusurroLiveStatus: (callback) => {
    const sub = (_event, status) => callback(status);
    ipcRenderer.on('susurro-live-status', sub);
    return () => ipcRenderer.removeListener('susurro-live-status', sub);
  },
  onToggleSusurroTranscriptionSignal: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('toggle-susurro-transcription-signal', sub);
    return () => ipcRenderer.removeListener('toggle-susurro-transcription-signal', sub);
  },
  onStartSusurro: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('start-susurro', sub);
    return () => ipcRenderer.removeListener('start-susurro', sub);
  },
  onStopSusurro: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('stop-susurro', sub);
    return () => ipcRenderer.removeListener('stop-susurro', sub);
  },

  // --- Screen Capture ---
  getSources: () => ipcRenderer.invoke('get-sources'),
  captureSource: (sourceId) => ipcRenderer.invoke('capture-source', sourceId),
  captureAllScreens: () => ipcRenderer.invoke('capture-all-screens'),
  onCaptureEvent: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('capture-event', sub);
    return () => ipcRenderer.removeListener('capture-event', sub);
  },

  // --- Personas & Suggestions ---
  getPersonas: () => ipcRenderer.invoke('get-personas'),
  savePersona: (persona) => ipcRenderer.invoke('save-persona', persona),
  deletePersona: (id) => ipcRenderer.invoke('delete-persona', id),
  toggleSuggestions: (show) => ipcRenderer.send('toggle-suggestions-window', show),
  generateSuggestion: (data) => ipcRenderer.invoke('generate-suggestion', data),
  onNewSuggestion: (callback) => {
    const sub = (_event, sug) => callback(sug);
    ipcRenderer.on('new-suggestion', sub);
    return () => ipcRenderer.removeListener('new-suggestion', sub);
  },
  saveSusurroMessage: (msg) => ipcRenderer.invoke('save-susurro-message', msg),

  // --- Translation Service ---
  translateText: (text, target) => ipcRenderer.invoke('susurro-translate', text, target),
  translateIncremental: (text, previousText, target) => ipcRenderer.invoke('susurro-translate-incremental', text, previousText, target),
  sendSusurroSetupComplete: () => ipcRenderer.send('susurro-setup-complete'),

  // --- Utility Tools ---
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  searchWeb: (query) => ipcRenderer.invoke('search-web', query),
  getLolPlayerStats: (args) => ipcRenderer.invoke('get-lol-player-stats', args),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  copyToClipboard: (text) => ipcRenderer.send('copy-to-clipboard', text),
  getSystemAudioSourceId: () => ipcRenderer.invoke('get-system-audio-source-id'),
  transcribeAudio: (base64) => ipcRenderer.invoke('transcribe-audio', base64),

  // --- Skills System ---
  saveSkill: (args) => ipcRenderer.invoke('save-skill', args),
  listSkills: () => ipcRenderer.invoke('list-skills'),
  loadSkill: (name) => ipcRenderer.invoke('load-skill', name),

  // --- Session Logger ---
  logSession: (data) => ipcRenderer.invoke('log-session', data),
  getLearnings: () => ipcRenderer.invoke('get-learnings'),

  // --- Settings ---
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  applyStealthMode: (enabled) => ipcRenderer.invoke('apply-stealth-mode', enabled),
  getHistoryData: () => ipcRenderer.invoke('get-history-data'),
  onSettingsUpdated: (callback) => {
    const sub = (_event, settings) => callback(settings);
    ipcRenderer.on('settings-updated', sub);
    return () => ipcRenderer.removeListener('settings-updated', sub);
  },
  disableShortcuts: () => ipcRenderer.invoke('disable-shortcuts'),
  enableShortcuts: () => ipcRenderer.invoke('enable-shortcuts'),
});
