/**
 * Standardized response from the Electron backend.
 */
export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  // Window Control
  closeWindow: () => Promise<IPCResponse<void>>;
  minimizeWindow: () => Promise<IPCResponse<void>>;
  resizeWindow: (width: number, height: number) => Promise<IPCResponse<void>>;
  togglePin: () => void;
  isPinned: () => Promise<boolean>;
  isMinimized: () => Promise<boolean>;
  isMaximized: () => Promise<boolean>;
  startResizing: () => void;
  toggleMic: (enabled: boolean) => void;
  toggleAudio: (enabled: boolean) => void;
  
  // Messaging & Notifications
  sendMessage: (text: string, image?: string | null) => void;
  showNotification: (text: string) => void;
  onNewChatMessage: (callback: (msg: string, img?: string) => void) => () => void;
  onFocusInput: (callback: () => void) => () => void;
  onNotify: (callback: (message: string) => void) => () => void;
  notifHidden: () => void;
  
  // Screen Capture
  getSources: () => Promise<any[]>;
  captureSource: (sourceId: string) => Promise<string>;
  captureAllScreens: () => Promise<string | string[]>;
  onCaptureEvent: (callback: () => void) => () => void;
  
  // Chat History & Tokens
  getChat: () => Promise<IPCResponse<any[]>>;
  saveChat: (history: any[]) => void;
  updateChatStatus: (hasMessages: boolean) => void;
  endSession: (type?: string) => Promise<IPCResponse<any>>;
  getTotalTokens: () => Promise<IPCResponse<number>>;
  updateTokens: (count: number) => Promise<IPCResponse<number>>;
  chatWindowReady: () => void;
  
  // Susurro (Live Transcription)
  startSusurroLive: (personaPrompt?: string) => Promise<IPCResponse<boolean>>;
  stopSusurroLive: () => Promise<IPCResponse<void>>;
  sendSusurroChunk: (base64: string, seq: number) => void;
  onSusurroLiveDelta: (callback: (delta: any) => void) => () => void;
  onSusurroLiveStatus: (callback: (status: string) => void) => () => void;
  onToggleSusurroTranscriptionSignal: (callback: () => void) => () => void;
  onStartSusurro: (callback: () => void) => () => void;
  onStopSusurro: (callback: () => void) => () => void;
  generateSuggestion: (data: { transcription: string, personaPrompt: string }) => Promise<IPCResponse<string>>;
  saveSusurroMessage: (msg: any) => Promise<IPCResponse<void>>;
  
  // Tools & IPC
  openFileDialog: () => Promise<string | null>;
  searchWeb: (query: string) => Promise<any>;

  
  // Skills System
  saveSkill: (args: { name: string, description: string, procedure: string }) => Promise<IPCResponse<any>>;
  listSkills: () => Promise<IPCResponse<any[]>>;
  loadSkill: (name: string) => Promise<IPCResponse<string>>;

  // Session Logging
  logSession: (data: any) => Promise<IPCResponse<any>>;
  getLearnings: () => Promise<IPCResponse<string>>;

  scheduleTask: (args: any) => Promise<IPCResponse<any>>;

  getTasks: () => Promise<IPCResponse<any[]>>;
  deleteTask: (id: string) => Promise<IPCResponse<void>>;
  onExecuteTask: (callback: (task: any) => void) => () => void;
  showChat: () => void;
  translateText: (text: string, targetLanguage: string) => Promise<IPCResponse<string>>;
  translateIncremental: (text: string, previousText: string, targetLanguage: string) => Promise<IPCResponse<string>>;
  transcribeAudio: (base64: string) => Promise<string>;
  getSystemAudioSourceId: () => Promise<IPCResponse<string>>;
  updateChatPin: (pinned: boolean) => void;
  getPersonas: () => Promise<IPCResponse<any[]>>;
  savePersona: (persona: any) => Promise<IPCResponse<void>>;
  deletePersona: (id: string) => Promise<IPCResponse<void>>;

  // Voice Recording
  onStartVoice: (callback: () => void) => () => void;
  onVoiceSend: (callback: () => void) => () => void;

  // Translation & Setup
  sendSusurroSetupComplete: () => void;
  downloadTranslationModel: () => void;
  onTranslationDownloadProgress: (callback: (progress: number) => void) => () => void;
  onTranslationDownloadStatus: (callback: (status: string) => void) => () => void;
  onTranslationDownloadComplete: (callback: () => void) => () => void;
  onTranslationDownloadError: (callback: (error: string) => void) => () => void;

  // Suggestions
  toggleSuggestions: (enabled: boolean) => void;
  onNewSuggestion: (callback: (text: string) => void) => () => void;

  // --- Settings ---
  getSettings: () => Promise<SettingsData>;
  saveSettings: (settings: SettingsData) => Promise<IPCResponse<void>>;
  applyStealthMode: (enabled: boolean) => Promise<IPCResponse<void>>;
  getHistoryData: () => Promise<IPCResponse<{ susurroHistory: any[], chatHistory: any[] }>>;
  onSettingsUpdated: (callback: (settings: SettingsData) => void) => () => void;
  disableShortcuts: () => Promise<IPCResponse<void>>;
  enableShortcuts: () => Promise<IPCResponse<void>>;

  // Misc
  openExternal: (url: string) => void;
  copyToClipboard: (text: string) => void;
}

export interface AudioSettings {
  inputDeviceId: string;
  outputDeviceId: string;
  micEnabled: boolean;
  micVolume: number;
  systemAudioEnabled: boolean;
  systemAudioVolume: number;
}

export interface GeneralSettings {
  apiKey: string;
  tavilyApiKey: string;
  minichatModel: string;
  sttModel: string;
  fullTranscriptionModel: string;
  stealthMode: boolean;
  dreamingEnabled: boolean;
  dreamingModel: string;
}

export interface ShortcutsSettings {
  toggleCommand: string;
  toggleSettings: string;
  toggleSusurro: string;
  toggleVoice: string;
}

export interface SettingsData {
  audio: AudioSettings;
  general: GeneralSettings;
  shortcuts?: ShortcutsSettings;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
