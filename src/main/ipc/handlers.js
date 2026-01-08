/**
 * IPC Handlers
 * All IPC communication between main and renderer process
 */

const { ipcMain, dialog, shell } = require('electron');
const path = require('path');
const wingetService = require('../services/winget');
const notificationService = require('../services/notification');
const logger = require('../../../logger');

/**
 * Register all IPC handlers
 */
function registerHandlers(iconPath) {
    // Search apps
    ipcMain.handle('search-apps', async (event, query) => {
        return await wingetService.searchApps(query);
    });

    // Install app
    ipcMain.handle('install-app', async (event, appId) => {
        return await wingetService.installApp(appId, (data) => {
            event.sender.send('install-progress', data);
        });
    });

    // Upgrade all
    ipcMain.handle('upgrade-all', async (event) => {
        return await wingetService.upgradeAll((data) => {
            event.sender.send('upgrade-progress', data);
        });
    });

    // Get upgradable apps
    ipcMain.handle('get-upgradable-apps', async () => {
        return await wingetService.getUpgradableApps();
    });

    // Upgrade single app
    ipcMain.handle('upgrade-app', async (event, appId) => {
        return await wingetService.upgradeApp(appId, (data) => {
            event.sender.send('upgrade-app-progress', data);
        });
    });

    // Upgrade selected apps
    ipcMain.handle('upgrade-selected-apps', async (event, appIds) => {
        return await wingetService.upgradeSelectedApps(appIds, (data) => {
            event.sender.send('upgrade-batch-progress', data);
        });
    });

    // Get installed apps
    ipcMain.handle('get-installed-apps', async () => {
        return await wingetService.getInstalledApps();
    });

    // Uninstall app
    ipcMain.handle('uninstall-app', async (event, appId) => {
        return await wingetService.uninstallApp(appId, (data) => {
            event.sender.send('uninstall-progress', data);
        });
    });

    // Open external URL
    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
    });

    // Export apps to file
    ipcMain.handle('export-apps', async () => {
        const result = await dialog.showSaveDialog({
            title: 'Uygulama Listesini Kaydet',
            defaultPath: 'uygulama_listesi.json',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        return { filePath: result.filePath, canceled: result.canceled };
    });

    // Import apps from file
    ipcMain.handle('import-apps', async () => {
        const result = await dialog.showOpenDialog({
            title: 'Uygulama Listesini Yükle',
            filters: [{ name: 'JSON Files', extensions: ['json'] }],
            properties: ['openFile']
        });

        return { filePaths: result.filePaths, canceled: result.canceled };
    });

    // Get system info
    ipcMain.handle('get-system-info', async () => {
        return await wingetService.getSystemInfo();
    });

    // Open Windows Update
    ipcMain.handle('open-windows-update', async () => {
        await shell.openExternal('ms-settings:windowsupdate');
    });

    // Logging
    ipcMain.handle('log-message', async (event, level, message, details) => {
        if (logger[level]) {
            logger[level](message, details);
        }
    });

    // Open log file
    ipcMain.handle('open-log-file', async () => {
        const logPath = logger.getLogPath();
        if (logPath) {
            await shell.openPath(logPath);
            return { success: true };
        }
        return { error: 'Log path not found' };
    });

    // Get log path
    ipcMain.handle('get-log-path', async () => {
        return logger.getLogPath();
    });

    // Notification Settings
    ipcMain.handle('get-notification-settings', async () => {
        return notificationService.getSettings();
    });

    ipcMain.handle('set-notification-settings', async (event, settings) => {
        return notificationService.updateSettings(settings);
    });

    ipcMain.handle('trigger-update-scan', async () => {
        return await notificationService.triggerScan(wingetService.runCommand, iconPath);
    });

    ipcMain.handle('test-notification', async () => {
        return notificationService.testNotification(iconPath);
    });

    // App Update Handlers
    ipcMain.handle('check-for-app-updates', async () => {
        const updaterService = require('../services/updater');
        return await updaterService.checkForUpdates();
    });

    ipcMain.handle('download-app-update', async () => {
        const updaterService = require('../services/updater');
        return await updaterService.downloadUpdate();
    });

    ipcMain.handle('install-app-update', async () => {
        const updaterService = require('../services/updater');
        updaterService.quitAndInstall();
    });

    ipcMain.handle('get-app-update-state', async () => {
        const updaterService = require('../services/updater');
        return updaterService.getUpdateState();
    });

    ipcMain.handle('open-download-page', async () => {
        const updaterService = require('../services/updater');
        updaterService.openDownloadPage();
    });
}

module.exports = {
    registerHandlers
};
