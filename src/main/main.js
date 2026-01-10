/**
 * Main Process Entry Point
 * Güvenli Yükleyici - Electron Application
 */

const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const logger = require('../../logger');
const wingetService = require('./services/winget');
const notificationService = require('./services/notification');
const updaterService = require('./services/updater');
const glitchTipService = require('./services/sentry');
const ipcHandlers = require('./ipc/handlers');

// Initialize GlitchTip FIRST (before any errors can occur)
glitchTipService.initialize();

// Global Error Handling
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    glitchTipService.captureError(error, { tags: { type: 'uncaughtException' } });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason);
    glitchTipService.captureError(reason, { tags: { type: 'unhandledRejection' } });
});

// Main window reference
let mainWindow = null;

// Icon path
const iconPath = path.join(__dirname, '../../assets/icon.png');

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#ffffff'
        },
        backgroundColor: '#1a1a1a',
        icon: iconPath
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // mainWindow.webContents.openDevTools(); // For debugging

    mainWindow.webContents.on('render-process-gone', (event, details) => {
        logger.error('Render process gone', details);
    });

    return mainWindow;
}

/**
 * Install winget automatically
 */
async function installWinget() {
    logger.info('Attempting to install winget...');

    // Show progress dialog
    const progressWindow = new BrowserWindow({
        width: 400,
        height: 200,
        resizable: false,
        minimizable: false,
        maximizable: false,
        closable: false,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    progressWindow.loadURL(`data:text/html;charset=utf-8,
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    border-radius: 12px;
                }
                h3 { margin-bottom: 20px; }
                .spinner {
                    width: 40px; height: 40px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top-color: #4ade80;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                p { color: #aaa; font-size: 14px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h3>🔧 Winget Yükleniyor</h3>
            <div class="spinner"></div>
            <p>Bu işlem birkaç dakika sürebilir...</p>
        </body>
        </html>
    `);

    try {
        // Method 1: Try Microsoft Store method
        logger.info('Trying Microsoft Store method...');
        let result = await wingetService.runCommand(
            'powershell -ExecutionPolicy Bypass -Command "' +
            '$ProgressPreference = \'SilentlyContinue\'; ' +
            'try { ' +
            '    Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe -ErrorAction Stop; ' +
            '    Write-Host \'SUCCESS\' ' +
            '} catch { ' +
            '    Write-Host \'FAILED\' ' +
            '}"'
        );

        // Check if winget is now available
        let checkResult = await wingetService.runCommand('winget --version');

        if (!checkResult.error && checkResult.stdout) {
            logger.info('Winget installed successfully via Microsoft Store');
            progressWindow.close();
            return true;
        }

        // Method 2: Download from GitHub
        logger.info('Trying GitHub download method...');
        result = await wingetService.runCommand(
            'powershell -ExecutionPolicy Bypass -Command "' +
            '$ProgressPreference = \'SilentlyContinue\'; ' +
            'try { ' +
            '    $releases = \'https://api.github.com/repos/microsoft/winget-cli/releases/latest\'; ' +
            '    $latestRelease = Invoke-RestMethod -Uri $releases -Method Get -ErrorAction Stop; ' +
            '    $msixUrl = ($latestRelease.assets | Where-Object { $_.name -match \'Microsoft.DesktopAppInstaller.*\\.msixbundle$\' }).browser_download_url; ' +
            '    if ($msixUrl) { ' +
            '        $installerPath = \\\"$env:TEMP\\winget-installer.msixbundle\\\"; ' +
            '        Invoke-WebRequest -Uri $msixUrl -OutFile $installerPath -ErrorAction Stop; ' +
            '        Add-AppxPackage -Path $installerPath -ErrorAction Stop; ' +
            '        Remove-Item $installerPath -Force; ' +
            '        Write-Host \'SUCCESS\' ' +
            '    } else { ' +
            '        Write-Host \'URL_NOT_FOUND\' ' +
            '    } ' +
            '} catch { ' +
            '    Write-Host \'FAILED\' ' +
            '}"'
        );

        // Final check
        checkResult = await wingetService.runCommand('winget --version');
        progressWindow.close();

        if (!checkResult.error && checkResult.stdout) {
            logger.info('Winget installed successfully via GitHub');
            return true;
        }

        logger.error('Failed to install winget');
        return false;

    } catch (err) {
        logger.error('Error during winget installation', err);
        progressWindow.close();
        return false;
    }
}

/**
 * Check if winget is installed
 */
async function checkDependencies() {
    try {
        const result = await wingetService.runCommand('winget --version');
        if (result.stdout && result.stdout.includes('v')) {
            logger.info('Winget found: ' + result.stdout.trim());
            return;
        }
        throw new Error('Winget not found');
    } catch (error) {
        logger.error('Winget check failed', error);

        const response = await dialog.showMessageBox({
            type: 'warning',
            buttons: ['🔧 Şimdi Yükle', '🔗 İndirme Sayfasına Git', '❌ Kapat'],
            defaultId: 0,
            title: 'Winget Bulunamadı',
            message: 'Winget (Windows Paket Yöneticisi) sisteminizde bulunamadı.',
            detail: 'Bu uygulamanın çalışması için Winget gereklidir.\n\n' +
                '• "Şimdi Yükle" - Otomatik olarak yüklenir (önerilen)\n' +
                '• "İndirme Sayfasına Git" - Manuel kurulum için\n' +
                '• "Kapat" - Uygulamayı kapat',
            cancelId: 2
        });

        if (response.response === 0) {
            // Try to install winget
            const installed = await installWinget();

            if (installed) {
                await dialog.showMessageBox({
                    type: 'info',
                    buttons: ['Tamam'],
                    title: 'Kurulum Başarılı',
                    message: 'Winget başarıyla yüklendi!',
                    detail: 'Uygulama şimdi başlatılacak.'
                });
                return; // Continue with app startup
            } else {
                const retryResponse = await dialog.showMessageBox({
                    type: 'error',
                    buttons: ['🔗 Manuel Yükle', '❌ Kapat'],
                    title: 'Kurulum Başarısız',
                    message: 'Winget otomatik olarak yüklenemedi.',
                    detail: 'Lütfen Microsoft Store\'dan "App Installer" uygulamasını manuel olarak yükleyin.'
                });

                if (retryResponse.response === 0) {
                    shell.openExternal('https://aka.ms/getwinget');
                }
                app.quit();
            }
        } else if (response.response === 1) {
            shell.openExternal('https://aka.ms/getwinget');
            app.quit();
        } else {
            app.quit();
        }
    }
}

/**
 * Application ready handler
 */
app.whenReady().then(async () => {
    logger.info('Application started');

    // Load notification settings
    notificationService.loadSettings();

    // Check dependencies
    await checkDependencies();

    // Register IPC handlers
    ipcHandlers.registerHandlers(iconPath);

    // Create window
    createWindow();

    // Start update checker for winget apps
    notificationService.startChecker(wingetService.runCommand, iconPath);

    // Initialize app auto-updater
    updaterService.initialize();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * Application close handler
 */
app.on('window-all-closed', () => {
    logger.info('Application closing');
    notificationService.stopChecker();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

module.exports = { mainWindow };
