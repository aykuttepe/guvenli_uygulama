/**
 * Notification Service
 * Handles update notifications and scheduled scans
 */

const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const logger = require('../../../logger');

// Settings file path
const settingsPath = path.join(app.getPath('userData'), 'notification-settings.json');

// Default settings
let notificationSettings = {
    enabled: true,
    lastScanTime: null,
    scanIntervalHours: 24 // Daily scan
};

// Update checker interval
let updateCheckInterval = null;

/**
 * Load notification settings from file
 */
function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            notificationSettings = { ...notificationSettings, ...JSON.parse(data) };
        }
    } catch (err) {
        logger.error('Failed to load notification settings', err);
    }
}

/**
 * Save notification settings to file
 */
function saveSettings() {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(notificationSettings, null, 2));
    } catch (err) {
        logger.error('Failed to save notification settings', err);
    }
}

/**
 * Get current settings
 */
function getSettings() {
    return { ...notificationSettings };
}

/**
 * Update settings
 */
function updateSettings(newSettings) {
    notificationSettings = { ...notificationSettings, ...newSettings };
    saveSettings();
    logger.info('Notification settings updated', notificationSettings);
    return getSettings();
}

/**
 * Show update notification
 */
function showUpdateNotification(count, apps, iconPath) {
    if (!Notification.isSupported()) {
        logger.warn('Notifications not supported on this system');
        return;
    }

    const appList = apps.join(', ');
    const moreText = count > 5 ? ` ve ${count - 5} uygulama daha...` : '';

    const notification = new Notification({
        title: `🔄 ${count} Güncelleme Mevcut`,
        body: `Güncellenebilir uygulamalar: ${appList}${moreText}`,
        icon: iconPath,
        silent: false
    });

    notification.on('click', () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            const win = windows[0];
            if (win.isMinimized()) win.restore();
            win.focus();
            win.webContents.send('switch-to-updates-tab');
        }
    });

    notification.show();
    logger.info(`Notification shown: ${count} updates available`);
}

/**
 * Check for updates and notify
 */
async function checkForUpdatesAndNotify(runCommand, iconPath) {
    if (!notificationSettings.enabled) return;

    const now = Date.now();
    const lastScan = notificationSettings.lastScanTime;
    const intervalMs = notificationSettings.scanIntervalHours * 60 * 60 * 1000;

    // Check if enough time has passed since last scan
    if (lastScan && (now - lastScan) < intervalMs) {
        const nextScan = new Date(lastScan + intervalMs);
        logger.info(`Next update scan scheduled for ${nextScan.toLocaleString()}`);
        return;
    }

    logger.info('Starting scheduled update scan...');

    try {
        const result = await runCommand('winget upgrade --include-unknown --accept-source-agreements');

        if (result.error) {
            logger.error('Update scan failed', result.stderr);
            return;
        }

        // Parse the output to count upgradable apps
        const lines = result.stdout.split('\n');
        const separatorIndex = lines.findIndex(line => line.trim().startsWith('---'));

        if (separatorIndex === -1) {
            logger.info('No updates available');
            notificationSettings.lastScanTime = now;
            saveSettings();
            return;
        }

        const dataLines = lines.slice(separatorIndex + 1);
        let updateCount = 0;
        const updatableApps = [];

        dataLines.forEach(line => {
            if (!line.trim()) return;
            if (line.includes('upgrade') && (line.includes('available') || line.includes('yükseltme'))) return;

            const parts = line.trim().split(/\s{2,}/);
            if (parts.length >= 4) {
                const name = parts[0];
                const currentVersion = parts[2];
                const availableVersion = parts[3];

                if (currentVersion && availableVersion &&
                    currentVersion !== 'Unknown' &&
                    availableVersion !== 'Unknown' &&
                    currentVersion !== availableVersion) {
                    updateCount++;
                    if (updatableApps.length < 5) {
                        updatableApps.push(name);
                    }
                }
            }
        });

        if (updateCount > 0) {
            showUpdateNotification(updateCount, updatableApps, iconPath);
        }

        notificationSettings.lastScanTime = now;
        saveSettings();
        logger.info(`Update scan completed: ${updateCount} updates available`);

    } catch (err) {
        logger.error('Update scan error', err);
    }
}

/**
 * Start update checker
 */
function startChecker(runCommand, iconPath) {
    // Check immediately on startup (after a short delay)
    setTimeout(() => {
        checkForUpdatesAndNotify(runCommand, iconPath);
    }, 30000);

    // Then check every hour if updates should be scanned
    updateCheckInterval = setInterval(() => {
        checkForUpdatesAndNotify(runCommand, iconPath);
    }, 60 * 60 * 1000);
}

/**
 * Stop update checker
 */
function stopChecker() {
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
        updateCheckInterval = null;
    }
}

/**
 * Force trigger a scan
 */
async function triggerScan(runCommand, iconPath) {
    notificationSettings.lastScanTime = null;
    await checkForUpdatesAndNotify(runCommand, iconPath);
    return { success: true };
}

/**
 * Send test notification
 */
function testNotification(iconPath) {
    showUpdateNotification(3, ['Test App 1', 'Test App 2', 'Test App 3'], iconPath);
    return { success: true };
}

module.exports = {
    loadSettings,
    saveSettings,
    getSettings,
    updateSettings,
    showUpdateNotification,
    checkForUpdatesAndNotify,
    startChecker,
    stopChecker,
    triggerScan,
    testNotification
};
