const store = require('./store/jsonStore');

class AppState {
  chatHasMessages = false;
  isChatPinned = false;
  isSusurroPinned = false;
  isSusurroTranscribing = false;
  isQuitting = false;
  isFileDialogOpen = false;

  constructor() {
    const history = store.getChatHistory();
    this.chatHasMessages = Array.isArray(history) && history.length > 0;
  }
}

module.exports = new AppState();
