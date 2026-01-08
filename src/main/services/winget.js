/**
 * Winget Service
 * Handles all winget command operations
 */

const { exec, spawn } = require('child_process');
const logger = require('../../../logger');

/**
 * Run a command and return result
 */
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) {
                if (error.code === 2316632084) {
                    resolve({ stdout: '', stderr: '', error: null });
                    return;
                }
                logger.error(`Error executing command: ${command}`, error);
            }
            resolve({ stdout, stderr, error });
        });
    });
}

/**
 * Search apps using winget
 */
async function searchApps(query) {
    const cmd = `winget search "${query}" --accept-source-agreements`;
    return await runCommand(cmd);
}

/**
 * Get installed apps
 */
async function getInstalledApps() {
    const cmd = 'winget list --accept-source-agreements';
    return await runCommand(cmd);
}

/**
 * Get upgradable apps
 */
async function getUpgradableApps() {
    const cmd = 'winget upgrade --include-unknown --accept-source-agreements';
    return await runCommand(cmd);
}

/**
 * Install an app
 */
function installApp(appId, onProgress) {
    const args = ['install', '--id', appId, '--accept-package-agreements', '--accept-source-agreements'];

    logger.info(`Starting installation of ${appId}`);

    return new Promise((resolve, reject) => {
        const child = spawn('winget', args, { shell: true });

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ appId, output });
        });

        child.stderr.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ appId, output });
        });

        child.on('close', (code) => {
            if (code === 0) {
                logger.info(`Installation of ${appId} completed successfully`);
                resolve({ stdout: 'Success', stderr: '', error: null });
            } else {
                logger.error(`Installation of ${appId} failed with code ${code}`);
                resolve({ stdout: '', stderr: `Exit code: ${code}`, error: { code } });
            }
        });
    });
}

/**
 * Uninstall an app
 */
function uninstallApp(appId, onProgress) {
    const args = ['uninstall', '--id', appId, '--accept-source-agreements', '--force'];

    logger.info(`Starting uninstall for ${appId}`);

    return new Promise((resolve, reject) => {
        const child = spawn('winget', args, { shell: true });

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ appId, output });
        });

        child.stderr.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ appId, output });
        });

        child.on('close', (code) => {
            if (code === 0) {
                logger.info(`Uninstall of ${appId} completed successfully`);
                resolve({ stdout: 'Success', stderr: '', error: null });
            } else {
                logger.error(`Uninstall of ${appId} failed with code ${code}`);
                resolve({ stdout: '', stderr: `Exit code: ${code}`, error: { code } });
            }
        });
    });
}

/**
 * Upgrade all apps
 */
function upgradeAll(onProgress) {
    const args = ['upgrade', '--all', '--include-unknown', '--accept-package-agreements', '--accept-source-agreements', '--force'];

    logger.info('Starting upgrade all');

    return new Promise((resolve, reject) => {
        const child = spawn('winget', args, { shell: true });

        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ output });
        });

        child.stderr.on('data', (data) => {
            const output = data.toString();
            if (onProgress) onProgress({ output });
        });

        child.on('close', (code) => {
            if (code === 0) {
                logger.info('Upgrade all completed successfully');
                resolve({ stdout: 'Success', stderr: '', error: null });
            } else {
                logger.error(`Upgrade all failed with code ${code}`);
                resolve({ stdout: '', stderr: `Exit code: ${code}`, error: { code } });
            }
        });
    });
}

/**
 * Upgrade a single app
 */
function upgradeApp(appId, onProgress) {
    const args = ['upgrade', '--id', appId, '--accept-package-agreements', '--accept-source-agreements'];

    logger.info(`Starting upgrade for ${appId}`);

    return new Promise((resolve, reject) => {
        const child = spawn('winget', args, { shell: true });
        let fullOutput = '';

        child.stdout.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            if (onProgress) onProgress({ appId, output });
        });

        child.stderr.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            if (onProgress) onProgress({ appId, output });
        });

        child.on('close', (code) => {
            // Special winget exit codes
            // 0 = Success
            // -1978335189 (0x8A150057) = No applicable update found
            // 2316632084 (0x8A150014) = Package already installed / No update available
            // -1978335212 = Upgrade failed but package might be up to date

            const noUpdateCodes = [0, 2316632084, -1978335189, -1978335212];
            const isAlreadyUpToDate = fullOutput.toLowerCase().includes('no applicable upgrade') ||
                fullOutput.toLowerCase().includes('already installed') ||
                fullOutput.toLowerCase().includes('no newer package') ||
                fullOutput.toLowerCase().includes('zaten yüklü') ||
                fullOutput.toLowerCase().includes('güncel');

            if (code === 0 || noUpdateCodes.includes(code) || isAlreadyUpToDate) {
                if (code === 0) {
                    logger.info(`Upgrade of ${appId} completed successfully`);
                } else {
                    logger.info(`${appId} is already up to date (code: ${code})`);
                }
                resolve({ stdout: 'Success', stderr: '', error: null, alreadyUpToDate: code !== 0 });
            } else {
                logger.error(`Upgrade of ${appId} failed with code ${code}`);
                resolve({ stdout: '', stderr: `Exit code: ${code}`, error: { code } });
            }
        });
    });
}

/**
 * Upgrade selected apps
 */
async function upgradeSelectedApps(appIds, onProgress) {
    const results = [];

    for (const appId of appIds) {
        if (onProgress) {
            onProgress({ appId, status: 'starting' });
        }

        try {
            const result = await upgradeApp(appId, (data) => {
                if (onProgress) {
                    onProgress({ appId, status: 'progress', output: data.output });
                }
            });

            const success = !result.error;
            results.push({ appId, success });

            if (onProgress) {
                onProgress({ appId, status: success ? 'success' : 'error' });
            }
        } catch (err) {
            logger.error(`Error upgrading ${appId}`, err);
            results.push({ appId, success: false });
            if (onProgress) {
                onProgress({ appId, status: 'error' });
            }
        }
    }

    return results;
}

/**
 * Get system info
 */
async function getSystemInfo() {
    const cmd = `powershell -Command "Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model; Get-CimInstance Win32_Processor | Select-Object Name; Get-CimInstance Win32_VideoController | Select-Object Name"`;
    const result = await runCommand(cmd);
    return result.stdout;
}

module.exports = {
    runCommand,
    searchApps,
    getInstalledApps,
    getUpgradableApps,
    installApp,
    uninstallApp,
    upgradeAll,
    upgradeApp,
    upgradeSelectedApps,
    getSystemInfo
};
