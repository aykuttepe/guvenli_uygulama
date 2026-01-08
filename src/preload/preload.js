/**
 * Preload Script
 * Secure bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * API exposed to renderer process
 */
const api = {
    // App Search & Install
    searchApps: (query) => ipcRenderer.invoke('search-apps', query),
    installApp: (appId) => ipcRenderer.invoke('install-app', appId),
    onInstallProgress: (callback) => ipcRenderer.on('install-progress', (event, data) => callback(data)),

    // Upgrade Operations
    upgradeAll: () => ipcRenderer.invoke('upgrade-all'),
    onUpgradeProgress: (callback) => ipcRenderer.on('upgrade-progress', (event, data) => callback(data)),
    getUpgradableApps: () => ipcRenderer.invoke('get-upgradable-apps'),
    upgradeApp: (appId) => ipcRenderer.invoke('upgrade-app', appId),
    upgradeSelectedApps: (appIds) => ipcRenderer.invoke('upgrade-selected-apps', appIds),
    onUpgradeAppProgress: (callback) => ipcRenderer.on('upgrade-app-progress', (event, data) => callback(data)),
    onUpgradeBatchProgress: (callback) => ipcRenderer.on('upgrade-batch-progress', (event, data) => callback(data)),

    // Installed Apps
    getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
    uninstallApp: (appId) => ipcRenderer.invoke('uninstall-app', appId),
    onUninstallProgress: (callback) => ipcRenderer.on('uninstall-progress', (event, data) => callback(data)),

    // File Operations
    exportApps: () => ipcRenderer.invoke('export-apps'),
    importApps: () => ipcRenderer.invoke('import-apps'),

    // External Links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // System
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    openWindowsUpdate: () => ipcRenderer.invoke('open-windows-update'),

    // Logging
    logMessage: (level, message, details) => ipcRenderer.invoke('log-message', level, message, details),
    openLogFile: () => ipcRenderer.invoke('open-log-file'),
    getLogPath: () => ipcRenderer.invoke('get-log-path'),

    // Notification Settings
    getNotificationSettings: () => ipcRenderer.invoke('get-notification-settings'),
    setNotificationSettings: (settings) => ipcRenderer.invoke('set-notification-settings', settings),
    triggerUpdateScan: () => ipcRenderer.invoke('trigger-update-scan'),
    testNotification: () => ipcRenderer.invoke('test-notification'),

    // App Updates
    checkForAppUpdates: () => ipcRenderer.invoke('check-for-app-updates'),
    downloadAppUpdate: () => ipcRenderer.invoke('download-app-update'),
    installAppUpdate: () => ipcRenderer.invoke('install-app-update'),
    getAppUpdateState: () => ipcRenderer.invoke('get-app-update-state'),
    openDownloadPage: () => ipcRenderer.invoke('open-download-page'),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),

    // Event Listeners
    onSwitchToUpdatesTab: (callback) => ipcRenderer.on('switch-to-updates-tab', () => callback())
};

// Expose API to renderer
contextBridge.exposeInMainWorld('api', api);
