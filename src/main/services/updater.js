/**
 * Auto Updater Service
 * Handles automatic and manual application updates
 */

const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, dialog, shell } = require('electron');
const logger = require('../../../logger');

// Update state
let updateAvailable = false;
let updateDownloaded = false;
let latestVersion = null;
let downloadProgress = 0;

/**
 * Configure auto updater
 */
function configure() {
    // Disable auto download - we want user confirmation
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set update feed URL (GitHub by default when using electron-builder)
    // autoUpdater.setFeedURL({
    //     provider: 'github',
    //     owner: 'YOUR_GITHUB_USERNAME',
    //     repo: 'guvenli_uygulama'
    // });

    // Event handlers
    autoUpdater.on('checking-for-update', () => {
        logger.info('Checking for updates...');
        sendStatusToWindow('checking');
    });

    autoUpdater.on('update-available', (info) => {
        logger.info('Update available:', info.version);
        updateAvailable = true;
        latestVersion = info.version;
        sendStatusToWindow('available', info);

        // Show notification to user
        showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
        logger.info('Update not available, current version is latest');
        updateAvailable = false;
        sendStatusToWindow('not-available', info);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        downloadProgress = progressObj.percent;
        logger.info(`Download progress: ${downloadProgress.toFixed(2)}%`);
        sendStatusToWindow('downloading', {
            percent: progressObj.percent,
            transferred: progressObj.transferred,
            total: progressObj.total,
            bytesPerSecond: progressObj.bytesPerSecond
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        logger.info('Update downloaded:', info.version);
        updateDownloaded = true;
        sendStatusToWindow('downloaded', info);

        // Show install prompt
        showUpdateReadyDialog(info);
    });

    autoUpdater.on('error', (err) => {
        logger.error('Auto updater error:', err);
        sendStatusToWindow('error', { message: err.message });
    });
}

/**
 * Send update status to renderer
 */
function sendStatusToWindow(status, data = {}) {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
        windows[0].webContents.send('update-status', { status, ...data });
    }
}

/**
 * Show update available dialog
 */
async function showUpdateAvailableDialog(info) {
    const response = await dialog.showMessageBox({
        type: 'info',
        buttons: ['📥 Şimdi İndir', '⏰ Daha Sonra', '📋 Detaylar'],
        defaultId: 0,
        title: 'Güncelleme Mevcut',
        message: `Yeni sürüm mevcut: v${info.version}`,
        detail: `Mevcut sürüm: v${app.getVersion()}\n\n` +
            'Yeni güncellemeyi indirmek ister misiniz?\n\n' +
            'Not: İndirme arka planda yapılacak, çalışmanıza devam edebilirsiniz.',
        cancelId: 1
    });

    if (response.response === 0) {
        // Download update
        downloadUpdate();
    } else if (response.response === 2) {
        // Open release notes
        if (info.releaseNotes) {
            shell.openExternal(`https://github.com/YOUR_USERNAME/guvenli_uygulama/releases/tag/v${info.version}`);
        }
    }
}

/**
 * Show update ready to install dialog
 */
async function showUpdateReadyDialog(info) {
    const response = await dialog.showMessageBox({
        type: 'info',
        buttons: ['🔄 Şimdi Yeniden Başlat', '⏰ Sonra Yükle'],
        defaultId: 0,
        title: 'Güncelleme Hazır',
        message: `v${info.version} yüklemeye hazır`,
        detail: 'Güncelleme indirildi ve yüklenmeye hazır.\n\n' +
            'Uygulamayı şimdi yeniden başlatmak ister misiniz?\n\n' +
            'Daha sonra yüklerseniz, uygulama kapatıldığında otomatik olarak kurulacaktır.',
        cancelId: 1
    });

    if (response.response === 0) {
        // Quit and install
        quitAndInstall();
    }
}

/**
 * Check for updates
 */
async function checkForUpdates(silent = false) {
    try {
        logger.info('Manually checking for updates...');
        const result = await autoUpdater.checkForUpdates();

        if (!result && !silent) {
            await dialog.showMessageBox({
                type: 'info',
                buttons: ['Tamam'],
                title: 'Güncelleme Yok',
                message: 'Uygulama güncel!',
                detail: `Mevcut sürüm: v${app.getVersion()}`
            });
        }

        return result;
    } catch (err) {
        logger.error('Check for updates failed:', err);

        if (!silent) {
            await dialog.showMessageBox({
                type: 'error',
                buttons: ['Tamam'],
                title: 'Güncelleme Kontrolü Başarısız',
                message: 'Güncelleme kontrol edilemedi.',
                detail: `Hata: ${err.message}\n\nLütfen internet bağlantınızı kontrol edin.`
            });
        }

        return null;
    }
}

/**
 * Download update
 */
async function downloadUpdate() {
    try {
        logger.info('Starting update download...');
        await autoUpdater.downloadUpdate();
    } catch (err) {
        logger.error('Download update failed:', err);

        await dialog.showMessageBox({
            type: 'error',
            buttons: ['Tamam'],
            title: 'İndirme Başarısız',
            message: 'Güncelleme indirilemedi.',
            detail: `Hata: ${err.message}`
        });
    }
}

/**
 * Quit and install update
 */
function quitAndInstall() {
    logger.info('Quitting and installing update...');
    autoUpdater.quitAndInstall(false, true);
}

/**
 * Get current update state
 */
function getUpdateState() {
    return {
        currentVersion: app.getVersion(),
        updateAvailable,
        updateDownloaded,
        latestVersion,
        downloadProgress
    };
}

/**
 * Open download page for manual update
 */
function openDownloadPage() {
    shell.openExternal('https://github.com/YOUR_USERNAME/guvenli_uygulama/releases/latest');
}

/**
 * Initialize auto updater
 */
function initialize() {
    configure();

    // Check for updates on startup (after 10 seconds)
    setTimeout(() => {
        checkForUpdates(true); // Silent check
    }, 10000);

    // Check for updates every 4 hours
    setInterval(() => {
        checkForUpdates(true);
    }, 4 * 60 * 60 * 1000);
}

module.exports = {
    initialize,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
    getUpdateState,
    openDownloadPage
};
