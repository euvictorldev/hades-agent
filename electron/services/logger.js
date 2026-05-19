/**
 * Logger provides a standardized way to log messages across the application.
 * It includes timestamps and source identification.
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Formats a log message with timestamp and level.
   * @private
   */
  format(level, source, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${source}] ${message}`;
  }

  info(source, message) {
    console.log(this.format('INFO', source, message));
  }

  warn(source, message) {
    console.warn(this.format('WARN', source, message));
  }

  error(source, message, err = null) {
    let msg = message;
    if (err) {
      msg += ` | Error: ${err.message}`;
      if (!this.isProduction && err.stack) {
        msg += `\n${err.stack}`;
      }
    }
    console.error(this.format('ERROR', source, msg));
  }

  debug(source, message) {
    if (!this.isProduction) {
      console.log(this.format('DEBUG', source, message));
    }
  }
}

module.exports = new Logger();
