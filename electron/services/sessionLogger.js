const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const logger = require('./logger');

class SessionLogger {
  constructor() {
    const userDataPath = path.join(os.homedir(), '.Hades');
    this.sessionsDir = path.join(userDataPath, 'sessions');
    
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  logSession(sessionData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}_session.json`;
      const filePath = path.join(this.sessionsDir, filename);

      fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2), 'utf-8');
      logger.info('SessionLogger', `Session saved: ${filename}`);
      return { success: true, filePath };
    } catch (error) {
      logger.error('SessionLogger', 'Error saving session', error);
      return { success: false, error: error.message };
    }
  }

  getUnprocessedSessions() {
    try {
      const files = fs.readdirSync(this.sessionsDir)
        .filter(f => f.endsWith('.json') && !f.includes('_processed'));
      
      const sessions = files.map(file => {
        const content = fs.readFileSync(path.join(this.sessionsDir, file), 'utf-8');
        return { file, data: JSON.parse(content) };
      });

      return sessions;
    } catch (error) {
      logger.error('SessionLogger', 'Error reading sessions', error);
      return [];
    }
  }

  markSessionAsProcessed(filename) {
    try {
      const oldPath = path.join(this.sessionsDir, filename);
      const newPath = path.join(this.sessionsDir, filename.replace('.json', '_processed.json'));
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    } catch (error) {
      logger.error('SessionLogger', 'Error marking session as processed', error);
    }
  }
}

module.exports = new SessionLogger();
