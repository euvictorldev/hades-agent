import { ElectronAPI, IPCResponse, SettingsData } from '../types/electron';

/**
 * Service to interact with the Electron IPC layer.
 * Provides a typed and safe wrapper around globalThis.electron.
 */
class ElectronService {
  private get electron(): ElectronAPI | undefined {
    // @ts-ignore
    return globalThis.electron;
  }

  /**
   * Helper to handle standardized IPC responses.
   * Unwraps data if success, otherwise logs error and returns fallback.
   */
  private async handleResponse<T>(
    promise: Promise<IPCResponse<T>> | undefined,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      const response = await promise;
      if (response?.success) {
        return response.data ?? fallback;
      }
      if (response?.error) {
        console.error(`[ElectronService] ${context} error:`, response.error);
      }
      return fallback;
    } catch (error) {
      console.error(`[ElectronService] ${context} exception:`, error);
      return fallback;
    }
  }

  // --- Window Control ---
  async closeWindow() { await this.handleResponse(this.electron?.closeWindow(), undefined, 'closeWindow'); }
  async minimizeWindow() { await this.handleResponse(this.electron?.minimizeWindow(), undefined, 'minimizeWindow'); }
  async resizeWindow(width: number, height: number) { await this.handleResponse(this.electron?.resizeWindow(width, height), undefined, 'resizeWindow'); }
  togglePin() { this.electron?.togglePin(); }
  async isPinned() { return await this.electron?.isPinned() ?? false; }
  async isMinimized() { return await this.electron?.isMinimized() ?? false; }
  async isMaximized() { return await this.electron?.isMaximized() ?? false; }
  startResizing() { this.electron?.startResizing(); }
  toggleMic(enabled: boolean) { this.electron?.toggleMic(enabled); }
  toggleAudio(enabled: boolean) { this.electron?.toggleAudio(enabled); }

  // --- Messaging ---
  sendMessage(text: string, image?: string | null) { this.electron?.sendMessage(text, image); }
  showNotification(text: string) { this.electron?.showNotification(text); }
  onNewChatMessage(callback: (msg: string, img?: string) => void) {
    return this.electron?.onNewChatMessage(callback) || (() => {});
  }
  onFocusInput(callback: () => void) {
    return this.electron?.onFocusInput(callback) || (() => {});
  }
  onNotify(callback: (message: string) => void) {
    return this.electron?.onNotify(callback) || (() => {});
  }
  notifHidden() { this.electron?.notifHidden(); }

  // --- Screen Capture ---
  async getSources() { return await this.electron?.getSources() || []; }
  async captureSource(sourceId: string) { return await this.electron?.captureSource(sourceId) || ''; }
  async captureAllScreens() { return await this.electron?.captureAllScreens() || ''; }
  onCaptureEvent(callback: () => void) {
    return this.electron?.onCaptureEvent(callback) || (() => {});
  }

  // --- Chat & History ---
  async getChat() { 
    return await this.handleResponse(this.electron?.getChat(), [], 'getChat'); 
  }
  saveChat(history: any[]) { this.electron?.saveChat(history); }
  updateChatStatus(hasMessages: boolean) { this.electron?.updateChatStatus(hasMessages); }
  async endSession(type?: string) { 
    return await this.handleResponse(this.electron?.endSession(type), null, 'endSession'); 
  }
  async getTotalTokens() { 
    return await this.handleResponse(this.electron?.getTotalTokens(), 0, 'getTotalTokens'); 
  }
  async updateTokens(count: number) { 
    return await this.handleResponse(this.electron?.updateTokens(count), 0, 'updateTokens'); 
  }
  chatWindowReady() { this.electron?.chatWindowReady(); }

  // --- Susurro ---
  async startSusurroLive(personaPrompt?: string) { 
    return await this.handleResponse(this.electron?.startSusurroLive(personaPrompt), false, 'startSusurroLive'); 
  }
  async stopSusurroLive() { 
    return await this.handleResponse(this.electron?.stopSusurroLive(), undefined, 'stopSusurroLive'); 
  }
  sendSusurroChunk(base64: string, seq: number) { this.electron?.sendSusurroChunk(base64, seq); }
  onSusurroLiveDelta(callback: (delta: any) => void) {
    return this.electron?.onSusurroLiveDelta(callback) || (() => {});
  }
  onSusurroLiveStatus(callback: (status: string) => void) {
    return this.electron?.onSusurroLiveStatus(callback) || (() => {});
  }
  onToggleSusurroTranscriptionSignal(callback: () => void) {
    return this.electron?.onToggleSusurroTranscriptionSignal(callback) || (() => {});
  }
  onStartSusurro(callback: () => void) {
    return this.electron?.onStartSusurro(callback) || (() => {});
  }
  onStopSusurro(callback: () => void) {
    return this.electron?.onStopSusurro(callback) || (() => {});
  }
  async generateSuggestion(data: { transcription: string, personaPrompt: string }) {
    return await this.handleResponse(this.electron?.generateSuggestion(data), '', 'generateSuggestion');
  }
  async saveSusurroMessage(msg: any) {
    return await this.handleResponse(this.electron?.saveSusurroMessage(msg), undefined, 'saveSusurroMessage');
  }

  // --- Tools (IPC wrappers) ---
  async openFileDialog(): Promise<string | null> { return await this.electron?.openFileDialog() ?? null; }
  async searchWeb(query: string) { return await this.electron?.searchWeb(query); }

  
  // --- Skills System ---
  async saveSkill(args: any) { return await this.handleResponse(this.electron?.saveSkill(args), 'Erro ao salvar skill', 'saveSkill'); }
  async listSkills() { return await this.handleResponse(this.electron?.listSkills(), [], 'listSkills'); }
  async loadSkill(name: string) { return await this.handleResponse(this.electron?.loadSkill(name), 'Erro ao carregar skill', 'loadSkill'); }

  // --- Session Logger ---
  async logSession(data: any) { return await this.handleResponse(this.electron?.logSession(data), null, 'logSession'); }
  async getLearnings() { return await this.handleResponse(this.electron?.getLearnings(), 'Nenhuma memória consolidada ainda.', 'getLearnings'); }

  // --- Settings ---
  async getSettings(): Promise<SettingsData | null> { 
    try {
      return (await this.electron?.getSettings()) ?? null;
    } catch (error) {
      console.error('[ElectronService] getSettings exception:', error);
      return null;
    }
  }
  async saveSettings(settings: any) { return await this.handleResponse(this.electron?.saveSettings(settings), undefined, 'saveSettings'); }
  async applyStealthMode(enabled: boolean) { return await this.handleResponse(this.electron?.applyStealthMode(enabled), undefined, 'applyStealthMode'); }
  async getHistoryData() { return await this.handleResponse(this.electron?.getHistoryData(), null, 'getHistoryData'); }
  onSettingsUpdated(callback: (settings: SettingsData) => void) {
    return this.electron?.onSettingsUpdated(callback) || (() => {});
  }
  async disableShortcuts() { return await this.handleResponse(this.electron?.disableShortcuts(), undefined, 'disableShortcuts'); }
  async enableShortcuts() { return await this.handleResponse(this.electron?.enableShortcuts(), undefined, 'enableShortcuts'); }

  async scheduleTask(args: any) { 
    return await this.handleResponse(this.electron?.scheduleTask(args), null, 'scheduleTask'); 
  }
  async getTasks() { 
    return await this.handleResponse(this.electron?.getTasks(), [], 'getTasks'); 
  }
  async deleteTask(id: string) { 
    return await this.handleResponse(this.electron?.deleteTask(id), undefined, 'deleteTask'); 
  }
  onExecuteTask(callback: (task: any) => void) {
    return this.electron?.onExecuteTask(callback) || (() => {});
  }
  showChat() { this.electron?.showChat(); }
  async translateText(text: string, targetLanguage: string) { 
    return await this.handleResponse(this.electron?.translateText(text, targetLanguage), text, 'translateText'); 
  }
  async translateIncremental(text: string, previousText: string, targetLanguage: string) {
    return await this.handleResponse(this.electron?.translateIncremental(text, previousText, targetLanguage), '', 'translateIncremental');
  }
  async transcribeAudio(base64: string) { return await this.electron?.transcribeAudio(base64) || ''; }
  async getSystemAudioSourceId() { 
    return await this.handleResponse(this.electron?.getSystemAudioSourceId(), '', 'getSystemAudioSourceId'); 
  }
  updateChatPin(pinned: boolean) { this.electron?.updateChatPin(pinned); }
  async getPersonas() { 
    return await this.handleResponse(this.electron?.getPersonas(), [], 'getPersonas'); 
  }
  async savePersona(persona: any) { 
    return await this.handleResponse(this.electron?.savePersona(persona), undefined, 'savePersona'); 
  }
  async deletePersona(id: string) { 
    return await this.handleResponse(this.electron?.deletePersona(id), undefined, 'deletePersona'); 
  }

  // --- Voice Recording ---
  onStartVoice(callback: () => void) {
    return this.electron?.onStartVoice(callback) || (() => {});
  }
  onVoiceSend(callback: () => void) {
    return this.electron?.onVoiceSend(callback) || (() => {});
  }

  // --- Translation & Setup ---
  sendSusurroSetupComplete() { this.electron?.sendSusurroSetupComplete(); }
  downloadTranslationModel() { this.electron?.downloadTranslationModel(); }
  onTranslationDownloadProgress(callback: (progress: number) => void) {
    return this.electron?.onTranslationDownloadProgress(callback) || (() => {});
  }
  onTranslationDownloadStatus(callback: (status: string) => void) {
    return this.electron?.onTranslationDownloadStatus(callback) || (() => {});
  }
  onTranslationDownloadComplete(callback: () => void) {
    return this.electron?.onTranslationDownloadComplete(callback) || (() => {});
  }
  onTranslationDownloadError(callback: (error: string) => void) {
    return this.electron?.onTranslationDownloadError(callback) || (() => {});
  }

  // --- Suggestions ---
  toggleSuggestions(enabled: boolean) { this.electron?.toggleSuggestions(enabled); }
  onNewSuggestion(callback: (text: string) => void) {
    return this.electron?.onNewSuggestion(callback) || (() => {});
  }

  // --- Misc ---
  openExternal(url: string) { this.electron?.openExternal(url); }
  copyToClipboard(text: string) { this.electron?.copyToClipboard?.(text); }
}

export const electronService = new ElectronService();
