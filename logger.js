const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Logger {
    constructor() {
        this.logFile = path.join(app.getPath('userData'), 'app_logs.txt');
        this.ensureLogFile();
    }

    ensureLogFile() {
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, `Log started at ${new Date().toISOString()}\n`);
        }
    }

    log(level, message, details = null) {
        const timestamp = new Date().toISOString();
        let logEntry = `[${timestamp}] [${level}] ${message}`;
        if (details) {
            if (details instanceof Error) {
                logEntry += `\nStack: ${details.stack}`;
            } else if (typeof details === 'object') {
                try {
                    logEntry += `\nDetails: ${JSON.stringify(details, null, 2)}`;
                } catch (e) {
                    logEntry += `\nDetails: [Circular or Unserializable Object]`;
                }
            } else {
                logEntry += `\nDetails: ${details}`;
            }
        }
        logEntry += '\n';

        try {
            fs.appendFileSync(this.logFile, logEntry);
            // Also log to console for dev
            if (process.env.NODE_ENV === 'development') {
                console.log(logEntry);
            }
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    info(message, details) {
        this.log('INFO', message, details);
    }

    warn(message, details) {
        this.log('WARN', message, details);
    }

    error(message, details) {
        this.log('ERROR', message, details);

        // Send to GlitchTip if available
        try {
            const glitchTipService = require('./src/main/services/sentry');
            if (glitchTipService.isEnabled()) {
                if (details instanceof Error) {
                    glitchTipService.captureError(details, { extra: { message } });
                } else {
                    glitchTipService.captureMessage(message, 'error', { extra: { details } });
                }
            }
        } catch (e) {
            // GlitchTip not available or not in main process
        }
    }

    getLogPath() {
        return this.logFile;
    }

    clearLogs() {
        try {
            fs.writeFileSync(this.logFile, `Log cleared at ${new Date().toISOString()}\n`);
            return true;
        } catch (err) {
            return false;
        }
    }
}

module.exports = new Logger();
