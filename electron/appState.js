class AppState {
  chatHasMessages = false;
  isChatPinned = false;
  isSusurroPinned = false;
  isSusurroTranscribing = false;
  isQuitting = false;
}

module.exports = new AppState();
