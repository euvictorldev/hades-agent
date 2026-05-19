const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { app } = require('electron');
const logger = require('./logger');
const sessionLogger = require('./sessionLogger');
const { GoogleGenAI } = require('@google/genai');
const jsonStore = require('../store/jsonStore');

/**
 * DreamService processes accumulated user sessions (conversations, tool calls)
 * to extract behavioral patterns, preferences, and actionable insights.
 */
class DreamService {
  constructor() {
    const userDataPath = path.join(os.homedir(), '.Hades');
    this.memoryDir = path.join(userDataPath, 'memory');
    
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  async runDreamCycle() {
    logger.info('DreamService', 'Starting dream cycle...');
    const sessions = sessionLogger.getUnprocessedSessions();
    
    if (sessions.length === 0) {
      logger.info('DreamService', 'No new sessions to process.');
      return;
    }

    try {
      const apiKey = jsonStore.getSettings()?.general?.apiKey || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        logger.warn('DreamService', 'API Key missing. Cannot run dream analysis.');
        return;
      }

      logger.info('DreamService', `Analyzing ${sessions.length} sessions...`);
      const client = new GoogleGenAI({ apiKey });
      
      // Combine session logs for analysis
      let combinedLogs = '';
      sessions.forEach(s => {
        try {
           const logData = JSON.stringify(s.data);
           combinedLogs += `\n--- Session ---\n${logData}\n`;
        } catch(e) {
           logger.error('DreamService', 'Error processing session data', e);
        }
      });

      // Avoid hitting token limits by truncating if necessary, 
      // but typically we'll keep the last X chars.
      if (combinedLogs.length > 50000) {
        combinedLogs = combinedLogs.substring(combinedLogs.length - 50000);
      }

      const promptTemplate = fs.readFileSync(path.join(__dirname, '../../prompts/dreamService.md'), 'utf-8');
      const prompt = promptTemplate.replace('{{combinedLogs}}', combinedLogs);

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2
        }
      });

      let insightsText = response.text || "Nenhum padrão novo detectado.";
      
      const learningsPath = path.join(this.memoryDir, 'learnings.json');
      let currentLearnings = [];
      if (fs.existsSync(learningsPath)) {
         try {
           currentLearnings = JSON.parse(fs.readFileSync(learningsPath, 'utf-8'));
         } catch(e) {
           logger.error('DreamService', 'Error parsing learnings.json', e);
           currentLearnings = [];
         }
      }
      
      currentLearnings.push({
         date: new Date().toISOString(),
         processedSessions: sessions.length,
         insights: insightsText.split('\n').filter(i => i.trim() !== '')
      });
      
      // Keep only last 10 dream cycles to avoid bloated memory file
      if (currentLearnings.length > 10) {
        currentLearnings = currentLearnings.slice(-10);
      }
      
      fs.writeFileSync(learningsPath, JSON.stringify(currentLearnings, null, 2), 'utf-8');
      
      // Mark as processed
      sessions.forEach(s => sessionLogger.markSessionAsProcessed(s.file));
      logger.info('DreamService', `Dream cycle completed successfully. Found insights.`);
    } catch (error) {
      logger.error('DreamService', 'Error during dream cycle', error);
    }
  }

  getLearnings() {
     const learningsPath = path.join(this.memoryDir, 'learnings.json');
     if (fs.existsSync(learningsPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(learningsPath, 'utf-8'));
            if (data.length > 0) {
               // Combine the last 3 learnings to provide recent context
               const recentLearnings = data.slice(-3);
               const allInsights = recentLearnings.flatMap(l => l.insights);
               if (allInsights.length > 0) {
                 return allInsights.join('\n');
               }
            }
        } catch(e) {
            logger.error('DreamService', 'Error reading learnings.json in getLearnings', e);
        }
     }
     return 'Nenhuma memória consolidada ainda.';
  }
}

module.exports = new DreamService();
