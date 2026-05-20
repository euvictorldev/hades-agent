const store = require('./store/jsonStore');

class AppState {
  chatHasMessages = false;
  isChatPinned = false;
  isSusurroPinned = false;
  isSusurroTranscribing = false;
  isQuitting = false;

  constructor() {
    try {
      const history = store.getChatHistory();
      this.chatHasMessages = Array.isArray(history) && history.length > 0;
    } catch (err) {
      this.chatHasMessages = false;
    }
  }
}

module.exports = new AppState();
