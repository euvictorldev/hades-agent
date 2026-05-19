const store = require('../store/jsonStore');
const windowManager = require('../windows/windowManager');
const logger = require('./logger');

/**
 * TaskService handles scheduled tasks and background notifications.
 * It periodically checks for due tasks and triggers notifications/actions.
 */
class TaskService {
  /** @type {NodeJS.Timeout|null} */
  interval = null;

  /**
   * Starts the background task monitoring Hades..
   */
  start() {
    if (this.interval) return;

    // Check every 30 seconds
    this.interval = setInterval(() => {
      this.checkTasks();
    }, 30000);

    logger.info('TASKS', 'Service started.');
  }

  /**
   * Checks for tasks that are due and haven't been completed.
   * @private
   */
  checkTasks() {
    const now = new Date();
    const nowStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const tasks = store.getTasks();
    const dueTasks = tasks.filter(t => !t.completed && t.time === nowStr);

    if (dueTasks.length > 0) {
      dueTasks.forEach(task => this.executeTask(task, tasks));
      store.saveTasks(tasks);
    }
  }

  /**
   * Executes a specific task by notifying the frontend.
   * @param {Object} task 
   * @param {Array} allTasks 
   * @private
   */
  executeTask(task, allTasks) {
    logger.info('TASKS', `[Step 1] Executing task: ${task.description}`);
    task.completed = true;

    const chatWin = windowManager.get('chat');
    logger.info('TASKS', `[Step 2] Chat window status: ${chatWin ? 'Found' : 'Not Found'}`);
    
    if (chatWin) {
      logger.info('TASKS', `[Step 3] Sending 'execute-scheduled-task' to chat window`);
      chatWin.webContents.send('execute-scheduled-task', task);
    }

    logger.info('TASKS', `[Step 4] Attempting to show notification window`);
    try {
      let notifWin = windowManager.get('notification');
      logger.info('TASKS', `[Step 5] Notification window existing: ${notifWin ? 'Yes' : 'No'}`);

      if (!notifWin) {
        logger.info('TASKS', `[Step 6] Creating notification window`);
        notifWin = windowManager.createNotificationWindow();
      }

      if (notifWin) {
        const sendNotify = () => {
          logger.info('TASKS', `[Step 7] Showing notification window inactive`);
          notifWin.showInactive();
          logger.info('TASKS', `[Step 8] Sending 'notify' event with text: ${task.description}`);
          notifWin.webContents.send('notify', task.description);
        };

        if (notifWin.webContents.isLoading()) {
          logger.info('TASKS', `[Step 6b] Window still loading — waiting for did-finish-load`);
          notifWin.webContents.once('did-finish-load', sendNotify);
        } else {
          sendNotify();
        }
      } else {
        logger.error('TASKS', `[Error] Could not get or create notification window`);
      }
    } catch (error) {
      logger.error('TASKS', `[Exception] Error handling notification window: ${error.message}`);
    }
  }

  /**
   * Stops the background task monitoring Hades.
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('TASKS', 'Service stopped.');
    }
  }
}

module.exports = new TaskService();
