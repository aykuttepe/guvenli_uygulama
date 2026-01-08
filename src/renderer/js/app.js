const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const resultsArea = document.getElementById('resultsArea');
const loading = document.getElementById('loading');
const queueList = document.getElementById('queueList');
const queueCount = document.getElementById('queueCount');
const installAllBtn = document.getElementById('installAllBtn');
const clearSearchIcon = document.getElementById('clearSearchIcon');

let installQueue = [];
let allInstalledApps = []; // Store installed apps for filtering
let activeTab = 'search'; // 'search' or 'installed'
let installedAppsLoaded = false; // Cache flag for installed apps
let ipcListenersRegistered = false; // Prevent duplicate IPC listeners

const logo = document.querySelector('.logo');

// Localization
const translations = {
    tr: {
        searchPlaceholder: 'Uygulama ara (örn: Chrome, Spotify)...',
        installedSearchPlaceholder: 'Yüklü uygulamalarda ara...',
        postInstallSearchPlaceholder: 'Listede ara...',
        searchBtn: 'Ara',
        clearBtn: 'Temizle',
        exportBtn: 'Listeyi Kaydet',
        importBtn: 'Listeyi Yükle',
        upgradeBtn: '🚀 Güncelle',
        tabSearch: '🔍 Uygulama Ara',
        tabInstalled: '📂 Yüklü Uygulamalar',
        tabPostInstall: '✨ Kurulum Sonrası',
        tabDrivers: '🔧 Sürücüler',
        tabSettings: '⚙️ Ayarlar',
        welcomeTitle: 'Hoş Geldiniz!',
        welcomeText: 'Aramak istediğiniz uygulamanın adını yukarı yazın veya popüler uygulamalardan seçin.',
        tagBrowsers: 'Tarayıcılar',
        tagDeveloper: 'Geliştirici',
        tagMusic: 'Müzik',
        tagVideo: 'Video',
        tagCommunication: 'İletişim',
        postInstallTitle: '✨ Kurulum Sonrası Önerilenler',
        postInstallText: 'Yeni bir bilgisayar kurulumundan sonra en çok ihtiyaç duyulan popüler uygulamalar:',
        driversTitle: '🔧 Sürücü Güncellemeleri',
        driversText: 'Sisteminiz için önerilen sürücü güncelleme yöntemleri:',
        manufacturerToolsTitle: 'Üretici Araçları:',
        btnWindowsUpdate: 'Windows Update\'i Aç',
        settingsTitle: 'Ayarlar',
        languageLabel: 'Dil / Language',
        installQueueTitle: 'Yükleme Listesi',
        clearQueueBtn: 'Listeyi Temizle',
        installAllBtn: 'Seçilenleri Yükle',
        statusPending: 'Bekliyor',
        statusInstalling: 'Yükleniyor...',
        statusSuccess: 'Tamamlandı',
        statusError: 'Hata',
        btnAdded: 'Eklendi',
        btnAdd: 'Listeye Ekle',
        btnInstalled: '✔ Yüklü',
        alertComplete: 'İşlem tamamlandı!',
        alertUpgradeConfirm: 'Tüm uygulamalar güncellenecek. Bu işlem biraz zaman alabilir. Devam edilsin mi?',
        alertUpgradeSuccess: 'Tüm uygulamalar başarıyla güncellendi!',
        alertExportSuccess: 'Uygulama listesi başarıyla yedeklendi!',
        alertImportConfirm: 'Yedekten geri yükleme işlemi başlayacak. Bu işlem mevcut uygulamalarınızı etkileyebilir. Devam edilsin mi?',
        alertImportSuccess: 'Uygulamalar başarıyla geri yüklenmeye başlandı/tamamlandı!',
        alertClearQueueConfirm: 'Yükleme listesi temizlenecek. Emin misiniz?',
        loading: 'İşlem yapılıyor...',
        noResults: 'Sonuç bulunamadı.',
        wingetNoResults: 'Winget kaynaklarında sonuç bulunamadı.',
        searchGoogle: '🌐 Google\'da Ara',
        internetSearch: 'İnternette aramak ister misiniz?',
        upgradeStarted: '🚀 Güncelleme Başlatıldı',
        upgradeText: 'Sistemdeki tüm uygulamalar taranıyor ve güncelleniyor...',
        scanningInstalled: 'Yüklü uygulamalar taranıyor...',
        tabUpdates: '🔄 Güncellemeler',
        updatesTitle: 'Güncellenebilir Uygulamalar',
        updatesSubtitle: 'Aşağıda güncelleme bekleyen uygulamalar listelenmiştir. Güncellemek istediklerinizi seçin.',
        refreshUpdates: 'Yenile',
        selectAll: 'Tümünü Seç',
        deselectAll: 'Seçimi Kaldır',
        upgradeSelected: 'Seçilenleri Güncelle',
        totalUpdates: 'Toplam Güncelleme',
        selectedUpdates: 'Seçili',
        currentVersion: 'Mevcut',
        newVersion: 'Yeni',
        noUpdates: 'Tüm Uygulamalar Güncel!',
        noUpdatesText: 'Şu anda güncellenmesi gereken uygulama bulunmuyor.',
        scanningUpdates: 'Güncellemeler taranıyor...',
        upgradeSuccess: 'Güncelleme başarılı!',
        upgradeFailed: 'Güncelleme başarısız!'
    },
    en: {
        searchPlaceholder: 'Search apps (e.g. Chrome, Spotify)...',
        installedSearchPlaceholder: 'Search installed apps...',
        postInstallSearchPlaceholder: 'Search in list...',
        searchBtn: 'Search',
        clearBtn: 'Clear',
        exportBtn: 'Export List',
        importBtn: 'Import List',
        upgradeBtn: '🚀 Update All',
        tabSearch: '🔍 Search Apps',
        tabInstalled: '📂 Installed Apps',
        tabPostInstall: '✨ Post-Install',
        tabDrivers: '🔧 Drivers',
        tabSettings: '⚙️ Settings',
        welcomeTitle: 'Welcome!',
        welcomeText: 'Type the name of the app you want to search above or select from popular apps.',
        tagBrowsers: 'Browsers',
        tagDeveloper: 'Developer',
        tagMusic: 'Music',
        tagVideo: 'Video',
        tagCommunication: 'Communication',
        postInstallTitle: '✨ Post-Install Recommendations',
        postInstallText: 'Popular apps most needed after a fresh computer installation:',
        driversTitle: '🔧 Driver Updates',
        driversText: 'Recommended driver update methods for your system:',
        manufacturerToolsTitle: 'Manufacturer Tools:',
        btnWindowsUpdate: 'Open Windows Update',
        settingsTitle: 'Settings',
        languageLabel: 'Language / Dil',
        installQueueTitle: 'Installation Queue',
        clearQueueBtn: 'Clear List',
        installAllBtn: 'Install Selected',
        statusPending: 'Pending',
        statusInstalling: 'Installing...',
        statusSuccess: 'Completed',
        statusError: 'Error',
        btnAdded: 'Added',
        btnAdd: 'Add to List',
        btnInstalled: '✔ Installed',
        alertComplete: 'Operation completed!',
        alertUpgradeConfirm: 'All apps will be updated. This may take some time. Continue?',
        alertUpgradeSuccess: 'All apps successfully updated!',
        alertExportSuccess: 'App list successfully exported!',
        alertImportConfirm: 'Restore from backup will start. This may affect your current apps. Continue?',
        alertImportSuccess: 'Apps started/completed restoring successfully!',
        alertClearQueueConfirm: 'Installation queue will be cleared. Are you sure?',
        loading: 'Processing...',
        noResults: 'No results found.',
        wingetNoResults: 'No results found in Winget sources.',
        searchGoogle: '🌐 Search on Google',
        internetSearch: 'Do you want to search on the internet?',
        upgradeStarted: '🚀 Update Started',
        upgradeText: 'Scanning and updating all apps in the system...',
        scanningInstalled: 'Scanning installed apps...',
        tabUpdates: '🔄 Updates',
        updatesTitle: 'Updatable Applications',
        updatesSubtitle: 'Below are applications with available updates. Select the ones you want to update.',
        refreshUpdates: 'Refresh',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        upgradeSelected: 'Update Selected',
        totalUpdates: 'Total Updates',
        selectedUpdates: 'Selected',
        currentVersion: 'Current',
        newVersion: 'New',
        noUpdates: 'All Apps Are Up To Date!',
        noUpdatesText: 'There are no applications that need to be updated at this time.',
        scanningUpdates: 'Scanning for updates...',
        upgradeSuccess: 'Update successful!',
        upgradeFailed: 'Update failed!'
    }
};

let currentLang = localStorage.getItem('language') || 'tr';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    const t = translations[lang];

    // Update static elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    // Update placeholders and specific elements
    if (activeTab === 'search') searchInput.placeholder = t.searchPlaceholder;
    else if (activeTab === 'installed') searchInput.placeholder = t.installedSearchPlaceholder;
    else if (activeTab === 'post-install') searchInput.placeholder = t.postInstallSearchPlaceholder;

    document.getElementById('searchBtn').textContent = t.searchBtn;
    document.getElementById('clearBtn').textContent = t.clearBtn;
    // Export/Import buttons removed from header, now in menu
    const menuExport = document.getElementById('menuExportBtn');
    if (menuExport) menuExport.textContent = t.exportBtn;
    const menuImport = document.getElementById('menuImportBtn');
    if (menuImport) menuImport.textContent = t.importBtn;
    const menuSettings = document.getElementById('menuSettingsBtn');
    if (menuSettings) menuSettings.textContent = t.tabSettings;

    document.getElementById('upgradeBtn').textContent = t.upgradeBtn;
    document.getElementById('installAllBtn').textContent = t.installAllBtn;
    const clearQueueBtn = document.getElementById('clearQueueBtn');
    if (clearQueueBtn) clearQueueBtn.title = t.clearQueueBtn;

    // Update Tabs
    document.querySelector('.nav-tab[data-target="search"]').textContent = t.tabSearch;
    document.querySelector('.nav-tab[data-target="installed"]').textContent = t.tabInstalled;
    document.querySelector('.nav-tab[data-target="post-install"]').textContent = t.tabPostInstall;
    document.querySelector('.nav-tab[data-target="drivers"]').textContent = t.tabDrivers;
    // Settings tab removed

    // Update Queue Header
    document.querySelector('.queue-header h3').textContent = t.installQueueTitle;

    // Update Loading Text
    document.querySelector('#loading p').textContent = t.loading;

    // Update Language Select
    document.getElementById('languageSelect').value = lang;

    // Re-render current view if needed to update dynamic content
    if (activeTab === 'post-install') renderPostInstallApps();
    else if (activeTab === 'installed') renderInstalledApps(allInstalledApps);
    else if (activeTab === 'search' && resultsArea.querySelector('.app-card')) {
        // If search results are showing, we might want to re-render them but we don't store the last search result raw data easily accessible to re-render without re-fetching or storing state.
        // For now, let's just leave search results as is until next search, or we could store last search results.
    }
}

// Event Listeners
searchBtn.addEventListener('click', handleSearchAction);

document.getElementById('languageSelect').addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

// Initialize Language
applyLanguage(currentLang);

if (clearBtn) clearBtn.addEventListener('click', resetUI);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearchAction();
});

// Live search for installed apps and toggle clear icon
searchInput.addEventListener('input', () => {
    toggleClearIcon();
    if (activeTab === 'installed') {
        filterInstalledApps(searchInput.value);
    } else if (activeTab === 'post-install') {
        filterPostInstallApps(searchInput.value);
    }
});

if (clearSearchIcon) {
    clearSearchIcon.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearIcon();
        searchInput.focus();

        if (activeTab === 'installed') {
            filterInstalledApps('');
        } else if (activeTab === 'post-install') {
            filterPostInstallApps('');
        }
    });
}

function toggleClearIcon() {
    if (searchInput.value.length > 0) {
        clearSearchIcon.classList.remove('hidden');
    } else {
        clearSearchIcon.classList.add('hidden');
    }
}

if (logo) logo.addEventListener('click', resetUI);

document.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', () => {
        // Switch to search tab if not active
        if (activeTab !== 'search') {
            document.querySelector('.nav-tab[data-target="search"]').click();
        }
        searchInput.value = btn.dataset.query;
        toggleClearIcon();
        performSearch();
    });
});

installAllBtn.addEventListener('click', startInstallation);

function handleSearchAction() {
    if (activeTab === 'search') {
        performSearch();
    } else if (activeTab === 'post-install') {
        filterPostInstallApps(searchInput.value);
    } else if (activeTab === 'installed') {
        filterInstalledApps(searchInput.value);
    }
    // Do nothing for drivers or settings
}

function filterPostInstallApps(query) {
    const container = views['post-install'];
    // Try to find existing header, or recreate it if lost (though it shouldn't be if we are careful)
    let header = container.querySelector('.placeholder-message');

    // If header is not found (e.g. we are in a state where it was removed), 
    // we might want to just proceed or try to restore it. 
    // For now, let's assume it's there or we don't need it for search results.
    // But renderPostInstallApps needs it. 

    // Actually, let's just re-use the header if found.

    container.innerHTML = '';
    if (header) container.appendChild(header);

    if (!query) {
        renderPostInstallApps();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = popularApps.filter(app =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.id.toLowerCase().includes(lowerQuery)
    );

    if (filtered.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.gridColumn = '1 / -1';
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.style.color = 'var(--text-secondary)';
        noResults.textContent = 'Sonuç bulunamadı.';
        container.appendChild(noResults);
        return;
    }

    filtered.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';

        const isQueued = installQueue.some(item => item.id === app.id);
        const isInstalled = isAppInstalled(app.id, app.name);

        let buttonHtml = '';
        if (isInstalled) {
            buttonHtml = `<button class="add-btn" disabled style="background: #2d2d2d; color: #4ade80; cursor: default;">✔ Yüklü</button>`;
        } else {
            buttonHtml = `
            <button class="add-btn ${isQueued ? 'added' : ''}" onclick="toggleQueue('${app.id}', '${app.name.replace(/'/g, "\\'")}', this)">
                ${isQueued ? 'Eklendi' : 'Listeye Ekle'}
            </button>`;
        }

        card.innerHTML = `
            <div class="app-name" title="${app.name}">${app.name}</div>
            <div class="app-id" title="${app.id}">${app.id}</div>
            <div class="app-version">${app.version}</div>
            ${buttonHtml}
        `;
        container.appendChild(card);
    });
}

function resetUI() {
    searchInput.value = '';
    toggleClearIcon();

    // Switch to search tab
    if (activeTab !== 'search') {
        document.querySelector('.nav-tab[data-target="search"]').click();
    }

    const t = translations[currentLang];
    resultsArea.innerHTML = `
        <div class="placeholder-message">
            <h3 data-i18n="welcomeTitle">${t.welcomeTitle}</h3>
            <p data-i18n="welcomeText">${t.welcomeText}</p>
            
            <div class="quick-tags">
                <button class="tag" data-query="Browser" data-i18n="tagBrowsers">${t.tagBrowsers}</button>
                <button class="tag" data-query="Developer" data-i18n="tagDeveloper">${t.tagDeveloper}</button>
                <button class="tag" data-query="Music" data-i18n="tagMusic">${t.tagMusic}</button>
                <button class="tag" data-query="Video" data-i18n="tagVideo">${t.tagVideo}</button>
                <button class="tag" data-query="Communication" data-i18n="tagCommunication">${t.tagCommunication}</button>
            </div>
        </div>
    `;
    // Re-attach listeners to new tags
    document.querySelectorAll('.tag').forEach(btn => {
        btn.addEventListener('click', () => {
            searchInput.value = btn.dataset.query;
            toggleClearIcon();
            performSearch();
        });
    });
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading(true);
    resultsArea.innerHTML = '';

    try {
        const result = await window.api.searchApps(query);

        if (result.error) {
            console.error(result.error);
            resultsArea.innerHTML = `<div class="placeholder-message"><p>Hata oluştu: ${result.stderr || 'Bilinmeyen hata'}</p></div>`;
        } else {
            parseAndDisplayResults(result.stdout);
        }
    } catch (err) {
        resultsArea.innerHTML = `<div class="placeholder-message"><p>Beklenmeyen hata: ${err.message}</p></div>`;
    } finally {
        showLoading(false);
    }
}

function parseAndDisplayResults(stdout) {
    const t = translations[currentLang];
    const lines = stdout.split('\n');
    const separatorIndex = lines.findIndex(line => line.trim().startsWith('---'));

    if (separatorIndex === -1) {
        const encodedQuery = encodeURIComponent(searchInput.value.trim());
        resultsArea.innerHTML = `
            <div class="placeholder-message">
                <p>${t.wingetNoResults}</p>
                <p>${t.internetSearch}</p>
                <button class="tag" style="margin-top: 10px; background: #2563eb;" onclick="window.api.openExternal('https://www.google.com/search?q=${encodedQuery} download')">
                    ${t.searchGoogle}
                </button>
            </div>`;
        return;
    }

    const dataLines = lines.slice(separatorIndex + 1);
    const apps = [];

    dataLines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.trim().split(/\s{2,}/);

        if (parts.length >= 2) {
            const name = parts[0];
            // Filter out names containing CJK characters (Chinese, Japanese, Korean)
            if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af]/.test(name)) {
                return;
            }

            apps.push({
                name: name,
                id: parts[1],
                version: parts[2] || 'Unknown'
            });
        }
    });

    if (apps.length === 0) {
        const encodedQuery = encodeURIComponent(searchInput.value.trim());
        resultsArea.innerHTML = `
            <div class="placeholder-message">
                <p>${t.wingetNoResults}</p>
                <p>${t.internetSearch}</p>
                <button class="tag" style="margin-top: 10px; background: #2563eb;" onclick="window.api.openExternal('https://www.google.com/search?q=${encodedQuery} download')">
                    ${t.searchGoogle}
                </button>
            </div>`;
        return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';

        const isQueued = installQueue.some(item => item.id === app.id);
        const isInstalled = isAppInstalled(app.id, app.name);

        let buttonHtml = '';
        if (isInstalled) {
            buttonHtml = `<button class="add-btn" disabled style="background: #2d2d2d; color: #4ade80; cursor: default;">${t.btnInstalled}</button>`;
        } else {
            buttonHtml = `
            <button class="add-btn ${isQueued ? 'added' : ''}" onclick="toggleQueue('${app.id}', '${app.name.replace(/'/g, "\\'")}', this)">
                ${isQueued ? t.btnAdded : t.btnAdd}
            </button>`;
        }

        card.innerHTML = `
            <div class="app-name" title="${app.name}">${app.name}</div>
            <div class="app-id" title="${app.id}">${app.id}</div>
            <div class="app-version">${app.version}</div>
            ${buttonHtml}
        `;
        fragment.appendChild(card);
    });

    resultsArea.appendChild(fragment);
}

window.toggleQueue = (id, name, btn) => {
    const t = translations[currentLang];
    const index = installQueue.findIndex(item => item.id === id);

    if (index === -1) {
        installQueue.push({ id, name, status: 'pending' });
        btn.textContent = t.btnAdded;
        btn.classList.add('added');
    } else {
        installQueue.splice(index, 1);
        btn.textContent = t.btnAdd;
        btn.classList.remove('added');
    }

    updateQueueUI();
};

function updateQueueUI() {
    queueList.innerHTML = '';
    queueCount.textContent = installQueue.length;
    installAllBtn.disabled = installQueue.length === 0;

    installQueue.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'queue-item';
        div.innerHTML = `
            <div>
                <div class="queue-item-name" title="${item.name}">${item.name}</div>
                <div class="status-${item.status}" id="status-${item.id}" style="font-size:0.8rem">${getStatusText(item.status)}</div>
                <div class="progress-container" id="progress-${item.id}">
                    <div class="progress-bar-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text" id="progress-text-${item.id}"></div>
            </div>
            ${item.status === 'pending' ? `<button class="remove-btn" onclick="removeFromQueue(${index})">×</button>` : ''}
        `;
        queueList.appendChild(div);
    });
}

// Clear Queue Logic
const clearQueueBtn = document.getElementById('clearQueueBtn');
if (clearQueueBtn) {
    clearQueueBtn.addEventListener('click', () => {
        const t = translations[currentLang];
        if (installQueue.length === 0) return;

        if (confirm(t.alertClearQueueConfirm)) {
            installQueue = [];
            updateQueueUI();

            // Reset buttons in active views
            document.querySelectorAll('.add-btn.added').forEach(btn => {
                btn.textContent = t.btnAdd;
                btn.classList.remove('added');
            });
        }
    });
}


// Listen for progress updates - Register only once
function registerIPCListeners() {
    if (ipcListenersRegistered) return;
    ipcListenersRegistered = true;

    window.api.onInstallProgress((data) => {
        const { appId, output } = data;

        const item = installQueue.find(i => i.id === appId);
        if (!item) return;

        const progressContainer = document.getElementById(`progress-${appId}`);
        const progressBar = progressContainer?.querySelector('.progress-bar-fill');
        const progressText = document.getElementById(`progress-text-${appId}`);
        const statusText = document.getElementById(`status-${appId}`);

        if (progressContainer && progressBar && progressText) {
            progressContainer.classList.add('active');

            const lowerOutput = output.toLowerCase();

            if (lowerOutput.includes('downloading')) {
                statusText.textContent = 'İndiriliyor...';
                statusText.className = 'status-installing';
                progressBar.style.width = '40%';
                progressText.textContent = 'Dosyalar indiriliyor...';
            } else if (lowerOutput.includes('installing') || lowerOutput.includes('yükleniyor')) {
                statusText.textContent = 'Yükleniyor...';
                progressBar.style.width = '80%';
                progressText.textContent = 'Sisteme kuruluyor...';
            } else if (lowerOutput.includes('verified') || lowerOutput.includes('doğrulandı')) {
                progressBar.style.width = '60%';
                progressText.textContent = 'Doğrulanıyor...';
            } else if (lowerOutput.includes('successfully installed') || lowerOutput.includes('başarıyla yüklendi')) {
                progressBar.style.width = '100%';
                statusText.textContent = 'Tamamlandı';
                statusText.className = 'status-success';
            }
        }
    });
}

// Register IPC listeners on startup
registerIPCListeners();

window.removeFromQueue = (index) => {
    const t = translations[currentLang];
    const item = installQueue[index];
    installQueue.splice(index, 1);

    const cards = document.querySelectorAll('.app-card');
    cards.forEach(card => {
        const idDiv = card.querySelector('.app-id');
        if (idDiv && idDiv.textContent === item.id) {
            const btn = card.querySelector('.add-btn');
            btn.textContent = t.btnAdd;
            btn.classList.remove('added');
        }
    });

    updateQueueUI();
};

function getStatusText(status) {
    const t = translations[currentLang];
    switch (status) {
        case 'pending': return t.statusPending;
        case 'installing': return t.statusInstalling;
        case 'success': return t.statusSuccess;
        case 'error': return t.statusError;
        default: return '';
    }
}

async function startInstallation() {
    if (installQueue.length === 0) return;

    installAllBtn.disabled = true;

    for (let i = 0; i < installQueue.length; i++) {
        const item = installQueue[i];
        if (item.status === 'success') continue;

        item.status = 'installing';
        updateQueueUI();

        try {
            const result = await window.api.installApp(item.id);
            if (result.error) {
                console.error(result.error);
                item.status = 'error';
            } else {
                item.status = 'success';
            }
        } catch (err) {
            console.error(err);
            item.status = 'error';
        }

        updateQueueUI();
    }

    installAllBtn.disabled = false;
    alert(translations[currentLang].alertComplete);
}

function showLoading(show) {
    if (show) loading.classList.remove('hidden');
    else loading.classList.add('hidden');
}

// Upgrade All Logic
if (upgradeBtn) {
    upgradeBtn.addEventListener('click', async () => {
        const t = translations[currentLang];
        if (!confirm(t.alertUpgradeConfirm)) return;

        showLoading(true);
        resultsArea.innerHTML = `
            <div class="placeholder-message">
                <h3>${t.upgradeStarted}</h3>
                <p>${t.upgradeText}</p>
                <div class="progress-container active" style="max-width: 400px; margin: 20px auto;">
                    <div id="upgradeProgressBar" class="progress-bar-fill" style="width: 0%"></div>
                </div>
                <div id="upgradeLog" style="font-family: monospace; font-size: 0.8rem; color: #aaa; margin-top: 10px; height: 200px; overflow-y: auto; text-align: left; background: #111; padding: 10px; border-radius: 8px;">
                    ...
                </div>
            </div>
        `;

        const logDiv = document.getElementById('upgradeLog');
        const progressBar = document.getElementById('upgradeProgressBar');

        window.api.onUpgradeProgress((data) => {
            const line = document.createElement('div');
            line.textContent = data.output;
            logDiv.appendChild(line);
            logDiv.scrollTop = logDiv.scrollHeight;

            if (progressBar.style.width !== '90%') {
                let current = parseInt(progressBar.style.width) || 0;
                if (current < 90) progressBar.style.width = (current + 1) + '%';
            }
        });

        try {
            await window.api.upgradeAll();
            progressBar.style.width = '100%';
            logDiv.innerHTML += `<div style="color: #4ade80; margin-top: 10px;">✅ ${t.alertComplete}</div>`;
            alert(t.alertUpgradeSuccess);
        } catch (err) {
            logDiv.innerHTML += `<div style="color: #f87171; margin-top: 10px;">❌ ${t.statusError}: ${err.message}</div>`;
        } finally {
            showLoading(false);
        }
    });
}

// Export/Import Logic
// Menu Logic
const menuBtn = document.getElementById('menuBtn');
const mainMenu = document.getElementById('mainMenu');
const menuExportBtn = document.getElementById('menuExportBtn');
const menuImportBtn = document.getElementById('menuImportBtn');
const menuSettingsBtn = document.getElementById('menuSettingsBtn');

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!mainMenu.contains(e.target) && e.target !== menuBtn) {
            mainMenu.classList.add('hidden');
        }
    });
}

if (menuExportBtn) {
    menuExportBtn.addEventListener('click', async () => {
        mainMenu.classList.add('hidden');
        const t = translations[currentLang];
        showLoading(true);
        try {
            const result = await window.api.exportApps();
            if (result.canceled) return;

            if (result.error) {
                alert(`${t.statusError}: ${result.stderr}`);
            } else {
                alert(t.alertExportSuccess);
            }
        } catch (err) {
            alert(`${t.statusError}: ${err.message}`);
        } finally {
            showLoading(false);
        }
    });
}

if (menuImportBtn) {
    menuImportBtn.addEventListener('click', async () => {
        mainMenu.classList.add('hidden');
        const t = translations[currentLang];
        if (!confirm(t.alertImportConfirm)) return;

        showLoading(true);
        try {
            const result = await window.api.importApps();
            if (result.canceled) return;

            if (result.error) {
                alert(`${t.statusError}: ${result.stderr}`);
            } else {
                alert(t.alertImportSuccess);
            }
        } catch (err) {
            alert(`${t.statusError}: ${err.message}`);
        } finally {
            showLoading(false);
        }
    });
}

if (menuSettingsBtn) {
    menuSettingsBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        // Manually switch to settings view
        tabs.forEach(t => t.classList.remove('active'));
        // No tab button for settings anymore, so just update view
        activeTab = 'settings';

        // Update search placeholder
        const t = translations[currentLang];
        searchInput.placeholder = ''; // Or some settings specific placeholder or disabled
        toggleClearIcon();

        // Switch views
        Object.values(views).forEach(v => {
            if (v) {
                v.classList.add('hidden-view');
                v.classList.remove('active-view');
            }
        });

        if (views.settings) {
            views.settings.classList.remove('hidden-view');
            views.settings.classList.add('active-view');
        }

        // Hide refresh button if visible
        document.getElementById('refreshPostInstallBtn').classList.add('hidden');
    });
}

// Tabs Logic
const tabs = document.querySelectorAll('.nav-tab');
const views = {
    search: document.getElementById('resultsArea'),
    updates: document.getElementById('updatesArea'),
    installed: document.getElementById('installedAppsArea'),
    'post-install': document.getElementById('postInstallArea'),
    drivers: document.getElementById('driversArea'),
    settings: document.getElementById('settingsArea')
};

// Drivers Logic
async function loadDriversInfo() {
    const systemInfoDiv = document.getElementById('systemInfo');
    const manufacturerToolsDiv = document.getElementById('manufacturerTools');

    // Clear previous
    manufacturerToolsDiv.innerHTML = '';
    systemInfoDiv.innerHTML = '<div data-i18n="loading">İşlem yapılıyor...</div>';

    try {
        const info = await window.api.getSystemInfo();
        systemInfoDiv.innerHTML = `<pre>${info}</pre>`;

        // Simple heuristic for manufacturer
        const lowerInfo = info.toLowerCase();
        let tools = [];

        if (lowerInfo.includes('dell')) {
            tools.push({ name: 'Dell Command | Update', id: 'Dell.CommandUpdate' });
        } else if (lowerInfo.includes('lenovo')) {
            tools.push({ name: 'Lenovo Vantage', id: 'Lenovo.Vantage' });
            tools.push({ name: 'Lenovo System Update', id: 'Lenovo.SystemUpdate' });
        } else if (lowerInfo.includes('hp')) {
            tools.push({ name: 'HP Support Assistant', id: 'HP.SupportAssistant' });
        } else if (lowerInfo.includes('asus')) {
            tools.push({ name: 'MyASUS', id: '9N7R5S6B0ZHC', source: 'msstore' }); // Example ID, might need winget search
            tools.push({ name: 'Armoury Crate', id: 'Asus.ArmouryCrate' });
        }

        if (tools.length > 0) {
            const t = translations[currentLang];
            const header = document.createElement('h4');
            header.textContent = t.manufacturerToolsTitle;
            header.style.marginBottom = '10px';
            manufacturerToolsDiv.appendChild(header);

            tools.forEach(tool => {
                const btn = document.createElement('button');
                btn.className = 'add-btn';
                btn.style.marginRight = '10px';
                btn.style.marginBottom = '10px';
                btn.textContent = `⬇ ${tool.name}`;
                btn.onclick = () => {
                    addToQueue(tool.id, tool.name, 'Latest');
                };
                manufacturerToolsDiv.appendChild(btn);
            });
        }

    } catch (err) {
        systemInfoDiv.textContent = 'Error loading info: ' + err.message;
    }
}

document.getElementById('btnWindowsUpdate').addEventListener('click', () => {
    window.api.openWindowsUpdate();
});

// Popular Apps Data
// Expanded Popular Apps Data
const popularApps = [
    { name: 'Google Chrome', id: 'Google.Chrome', version: 'Latest' },
    { name: 'Mozilla Firefox', id: 'Mozilla.Firefox', version: 'Latest' },
    { name: 'Discord', id: 'Discord.Discord', version: 'Latest' },
    { name: 'Spotify', id: 'Spotify.Spotify', version: 'Latest' },
    { name: 'Visual Studio Code', id: 'Microsoft.VisualStudioCode', version: 'Latest' },
    { name: 'VLC Media Player', id: 'VideoLAN.VLC', version: 'Latest' },
    { name: '7-Zip', id: '7zip.7zip', version: 'Latest' },
    { name: 'Zoom', id: 'Zoom.Zoom', version: 'Latest' },
    { name: 'WhatsApp', id: 'WhatsApp.WhatsApp', version: 'Latest' },
    { name: 'Steam', id: 'Valve.Steam', version: 'Latest' },
    { name: 'Notepad++', id: 'Notepad++.Notepad++', version: 'Latest' },
    { name: 'Git', id: 'Git.Git', version: 'Latest' },
    { name: 'Node.js', id: 'OpenJS.NodeJS', version: 'Latest' },
    { name: 'Python 3', id: 'Python.Python.3', version: 'Latest' },
    { name: 'Brave Browser', id: 'Brave.Brave', version: 'Latest' },
    { name: 'Telegram', id: 'Telegram.TelegramDesktop', version: 'Latest' },
    { name: 'Epic Games Launcher', id: 'EpicGames.EpicGamesLauncher', version: 'Latest' },
    { name: 'Adobe Acrobat Reader', id: 'Adobe.Acrobat.Reader.64-bit', version: 'Latest' },
    { name: 'TeamViewer', id: 'TeamViewer.TeamViewer', version: 'Latest' },
    { name: 'AnyDesk', id: 'AnyDeskSoftwareGmbH.AnyDesk', version: 'Latest' },
    { name: 'WinRAR', id: 'RARLab.WinRAR', version: 'Latest' },
    { name: 'OBS Studio', id: 'OBSProject.OBSStudio', version: 'Latest' },
    { name: 'GIMP', id: 'GIMP.GIMP', version: 'Latest' },
    { name: 'Audacity', id: 'Audacity.Audacity', version: 'Latest' },
    { name: 'LibreOffice', id: 'TheDocumentFoundation.LibreOffice', version: 'Latest' }
];

function getRandomApps(count = 12) {
    const shuffled = [...popularApps].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderPostInstallApps() {
    const t = translations[currentLang];
    const container = views['post-install'];
    // Keep the header
    const header = container.querySelector('.placeholder-message');
    container.innerHTML = '';
    container.appendChild(header);

    const appsToShow = getRandomApps(12);

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    appsToShow.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';

        const isQueued = installQueue.some(item => item.id === app.id);
        const isInstalled = isAppInstalled(app.id, app.name);

        let buttonHtml = '';
        if (isInstalled) {
            buttonHtml = `<button class="add-btn" disabled style="background: #2d2d2d; color: #4ade80; cursor: default;">${t.btnInstalled}</button>`;
        } else {
            buttonHtml = `
            <button class="add-btn ${isQueued ? 'added' : ''}" onclick="toggleQueue('${app.id}', '${app.name.replace(/'/g, "\\'")}', this)">
                ${isQueued ? t.btnAdded : t.btnAdd}
            </button>`;
        }

        card.innerHTML = `
            <div class="app-name" title="${app.name}">${app.name}</div>
            <div class="app-id" title="${app.id}">${app.id}</div>
            <div class="app-version">${app.version}</div>
            ${buttonHtml}
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// Refresh button listener
document.getElementById('refreshPostInstallBtn').addEventListener('click', () => {
    renderPostInstallApps();
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Switch tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.target;

        // Update refresh button visibility
        const refreshBtn = document.getElementById('refreshPostInstallBtn');
        if (activeTab === 'post-install') {
            refreshBtn.classList.remove('hidden');
        } else {
            refreshBtn.classList.add('hidden');
        }

        // Update search placeholder
        const t = translations[currentLang];

        if (activeTab === 'installed') {
            searchInput.placeholder = t.installedSearchPlaceholder;
            searchInput.disabled = false;
            searchInput.value = '';
            toggleClearIcon();
            // Cache kullanarak tekrar yükleme yapmaktan kaçın
            if (!installedAppsLoaded || allInstalledApps.length === 0) {
                loadInstalledApps();
            } else {
                renderInstalledApps(allInstalledApps);
            }
        } else if (activeTab === 'updates') {
            searchInput.placeholder = '';
            searchInput.disabled = true;
            searchInput.value = '';
            toggleClearIcon();
            // Updates will be loaded by the separate handler
        } else if (activeTab === 'post-install') {
            searchInput.placeholder = t.postInstallSearchPlaceholder;
            searchInput.disabled = false;
            searchInput.value = '';
            toggleClearIcon();
            renderPostInstallApps();
        } else if (activeTab === 'drivers') {
            searchInput.placeholder = '';
            searchInput.disabled = true;
            searchInput.value = '';
            toggleClearIcon();
            loadDriversInfo();
        } else if (activeTab === 'settings') {
            searchInput.placeholder = '';
            searchInput.disabled = true;
            searchInput.value = '';
            toggleClearIcon();
        } else {
            searchInput.placeholder = t.searchPlaceholder;
            searchInput.disabled = false;
            searchInput.value = '';
            toggleClearIcon();
        }

        // Switch views
        Object.values(views).forEach(v => {
            if (v) {
                v.classList.add('hidden-view');
                v.classList.remove('active-view');
            }
        });

        if (views[activeTab]) {
            views[activeTab].classList.remove('hidden-view');
            views[activeTab].classList.add('active-view');
        }
    });
});

let fetchInstalledAppsPromise = null;

async function fetchInstalledApps() {
    if (fetchInstalledAppsPromise) return fetchInstalledAppsPromise;

    fetchInstalledAppsPromise = (async () => {
        try {
            console.log("Fetching installed apps...");
            const result = await window.api.getInstalledApps();
            if (!result.error) {
                parseInstalledApps(result.stdout);
                installedAppsLoaded = true; // Cache flag
            } else {
                console.error("Winget error fetching installed apps:", result.stderr);
            }
        } catch (err) {
            console.error("Failed to fetch installed apps:", err);
        } finally {
            fetchInstalledAppsPromise = null;
        }
    })();

    return fetchInstalledAppsPromise;
}
async function loadInstalledApps() {
    const t = translations[currentLang];
    const container = views.installed;
    container.innerHTML = `<div class="placeholder-message"><p>${t.scanningInstalled}</p><div class="spinner"></div></div>`;

    await fetchInstalledApps();
    renderInstalledApps(allInstalledApps);
}

function isAppInstalled(appId, appName) {
    if (!allInstalledApps || allInstalledApps.length === 0) return false;

    const lowerId = appId.toLowerCase();
    const lowerName = appName ? appName.toLowerCase() : '';

    return allInstalledApps.some(app => {
        const installedId = app.id.toLowerCase();
        const installedName = app.name.toLowerCase();

        // Check ID match
        if (installedId === lowerId) return true;

        // Check Name match
        if (lowerName) {
            // Exact match
            if (installedName === lowerName) return true;

            // Partial match (if name is long enough to avoid false positives)
            // e.g. "Google Chrome" contains "Chrome"
            if (lowerName.length > 3 && installedName.includes(lowerName)) return true;
            // e.g. "Visual Studio Code" vs "Microsoft Visual Studio Code"
            if (installedName.length > 3 && lowerName.includes(installedName)) return true;
        }

        return false;
    });
}

// Initial fetch on startup
fetchInstalledApps();

function parseInstalledApps(stdout) {
    allInstalledApps = []; // Reset list

    const lines = stdout.split('\n');
    const separatorIndex = lines.findIndex(line => line.trim().startsWith('---'));

    if (separatorIndex === -1) return;

    const dataLines = lines.slice(separatorIndex + 1);

    dataLines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.trim().split(/\s{2,}/);

        if (parts.length >= 2) {
            allInstalledApps.push({
                name: parts[0],
                id: parts[1],
                version: parts[2] || 'Unknown'
            });
        }
    });
}

function renderInstalledApps(apps) {
    const container = views.installed;
    container.innerHTML = '';

    if (apps.length === 0) {
        container.innerHTML = `<div class="placeholder-message">
            <p>Uygulama bulunamadı.</p>
            <button class="secondary-btn" onclick="forceRefreshInstalledApps()" style="margin-top: 10px;">Tekrar Dene</button>
        </div>`;
        return;
    }

    // DocumentFragment kullanarak performans artışı
    const fragment = document.createDocumentFragment();

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="app-name" title="${app.name}">${app.name}</div>
            <div class="app-id" title="${app.id}">${app.id}</div>
            <div class="app-version">${app.version}</div>
            <button class="add-btn uninstall-btn" onclick="uninstallApp('${app.id}', '${app.name.replace(/'/g, "\\'")}')">
                🗑️ Kaldır
            </button>
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

// Force refresh installed apps (clears cache)
window.forceRefreshInstalledApps = () => {
    installedAppsLoaded = false;
    allInstalledApps = [];
    loadInstalledApps();
};

function filterInstalledApps(query) {
    if (!query) {
        renderInstalledApps(allInstalledApps);
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allInstalledApps.filter(app =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.id.toLowerCase().includes(lowerQuery)
    );

    renderInstalledApps(filtered);
}

window.uninstallApp = async (id, name) => {
    if (!confirm(`${name} uygulamasını kaldırmak istediğinize emin misiniz?`)) return;

    showLoading(true);
    try {
        await window.api.uninstallApp(id);
        alert(`${name} başarıyla kaldırıldı (veya kaldırma işlemi başlatıldı).`);
        // Cache'i temizle ve listeyi yenile
        installedAppsLoaded = false;
        loadInstalledApps();
    } catch (err) {
        alert(`Hata: ${err.message}`);
    } finally {
        showLoading(false);
    }
};
// Global Error Handling
window.onerror = function (message, source, lineno, colno, error) {
    window.api.logMessage('error', 'Renderer Error', { message, source, lineno, colno, stack: error ? error.stack : '' });
};

window.onunhandledrejection = function (event) {
    window.api.logMessage('error', 'Unhandled Rejection in Renderer', { reason: event.reason });
};

// ... existing code ...

// Add Open Logs Button Logic
const openLogsBtn = document.getElementById('openLogsBtn');
if (openLogsBtn) {
    openLogsBtn.addEventListener('click', async () => {
        const result = await window.api.openLogFile();
        if (result.error) {
            alert('Log dosyası açılamadı: ' + result.error);
        }
    });
}

// =============================================
// UPDATES TAB LOGIC
// =============================================

let upgradableApps = [];
let selectedUpgrades = new Set();
let upgradeIPCListenersRegistered = false; // Prevent duplicate upgrade listeners

// DOM Elements for Updates
const updatesGrid = document.getElementById('updatesGrid');
const updatesSummary = document.getElementById('updatesSummary');
const refreshUpdatesBtn = document.getElementById('refreshUpdatesBtn');
const selectAllUpdatesBtn = document.getElementById('selectAllUpdatesBtn');
const upgradeSelectedBtn = document.getElementById('upgradeSelectedBtn');

// Register upgrade IPC listeners once
function registerUpgradeIPCListeners() {
    if (upgradeIPCListenersRegistered) return;
    upgradeIPCListenersRegistered = true;

    window.api.onUpgradeAppProgress((data) => {
        const safeId = data.appId.replace(/[^a-zA-Z0-9]/g, '_');
        const progressEl = document.getElementById(`progress-update-${safeId}`);
        const progressFill = progressEl?.querySelector('.update-progress-fill');
        const progressText = document.getElementById(`progress-text-update-${safeId}`);
        const t = translations[currentLang];

        if (progressFill && progressText) {
            const lowerOutput = data.output.toLowerCase();

            if (lowerOutput.includes('downloading')) {
                progressFill.style.width = '30%';
                progressText.textContent = 'İndiriliyor...';
            } else if (lowerOutput.includes('installing') || lowerOutput.includes('yükleniyor')) {
                progressFill.style.width = '70%';
                progressText.textContent = 'Kuruluyor...';
            } else if (lowerOutput.includes('successfully') || lowerOutput.includes('başarıyla')) {
                progressFill.style.width = '100%';
                progressText.textContent = t.upgradeSuccess;
            }
        }
    });

    window.api.onUpgradeBatchProgress((data) => {
        const safeId = data.appId.replace(/[^a-zA-Z0-9]/g, '_');
        const progressEl = document.getElementById(`progress-update-${safeId}`);
        const progressFill = progressEl?.querySelector('.update-progress-fill');
        const progressText = document.getElementById(`progress-text-update-${safeId}`);
        const t = translations[currentLang];

        if (data.status === 'starting') {
            if (progressEl) progressEl.classList.remove('hidden');
            if (progressFill) progressFill.style.width = '10%';
            if (progressText) progressText.textContent = 'Başlatılıyor...';
        } else if (data.status === 'progress' && data.output) {
            const lowerOutput = data.output.toLowerCase();
            if (lowerOutput.includes('downloading')) {
                if (progressFill) progressFill.style.width = '40%';
                if (progressText) progressText.textContent = 'İndiriliyor...';
            } else if (lowerOutput.includes('installing')) {
                if (progressFill) progressFill.style.width = '70%';
                if (progressText) progressText.textContent = 'Kuruluyor...';
            }
        } else if (data.status === 'success') {
            const app = upgradableApps.find(a => a.id === data.appId);
            if (app) app.status = 'success';
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = t.upgradeSuccess;
        } else if (data.status === 'error') {
            const app = upgradableApps.find(a => a.id === data.appId);
            if (app) app.status = 'error';
            if (progressText) progressText.textContent = t.upgradeFailed;
        }
    });
}

// Register at startup
registerUpgradeIPCListeners();

// Load upgradable apps
async function loadUpgradableApps() {
    const t = translations[currentLang];
    const grid = views.updates?.querySelector('#updatesGrid') || updatesGrid;

    if (!grid) return;

    grid.innerHTML = `
        <div class="no-updates-message">
            <div class="spinner" style="margin: 0 auto;"></div>
            <p style="margin-top: 15px;">${t.scanningUpdates}</p>
        </div>
    `;

    // Clear summary
    if (updatesSummary) {
        updatesSummary.innerHTML = '';
    }

    // Reset selections
    selectedUpgrades.clear();
    updateUpgradeButton();

    try {
        const result = await window.api.getUpgradableApps();

        if (result.error) {
            console.error('Error fetching upgradable apps:', result.stderr);
            grid.innerHTML = `
                <div class="no-updates-message">
                    <div class="icon">❌</div>
                    <h3>Hata Oluştu</h3>
                    <p>${result.stderr || 'Bilinmeyen hata'}</p>
                </div>
            `;
            return;
        }

        parseUpgradableApps(result.stdout);
        renderUpgradableApps();

    } catch (err) {
        console.error('Failed to fetch upgradable apps:', err);
        grid.innerHTML = `
            <div class="no-updates-message">
                <div class="icon">❌</div>
                <h3>Hata Oluştu</h3>
                <p>${err.message}</p>
            </div>
        `;
    }
}

// Parse winget upgrade output
function parseUpgradableApps(stdout) {
    upgradableApps = [];

    const lines = stdout.split('\n');

    // Find the separator line (----)
    const separatorIndex = lines.findIndex(line => line.trim().startsWith('---'));

    if (separatorIndex === -1) {
        // If no data, apps array stays empty
        return;
    }

    // Get the header line to determine column positions
    const headerLine = lines[separatorIndex - 1];
    const separatorLine = lines[separatorIndex];

    // Calculate column positions from separator
    const columnPositions = [];
    let currentPos = 0;
    const separatorParts = separatorLine.split(/(?<=-)(?=\s)|(?<=\s)(?=-)/);

    // Simple approach: split by multiple spaces
    const dataLines = lines.slice(separatorIndex + 1);

    dataLines.forEach(line => {
        if (!line.trim()) return;

        // Check for the "upgrades available" message at the end
        if (line.includes('upgrade') && (line.includes('available') || line.includes('yükseltme'))) {
            return;
        }

        // Skip header-like lines
        if (line.includes('Name') && line.includes('Id') && line.includes('Version')) {
            return;
        }

        // Split by multiple spaces (2+)
        const parts = line.trim().split(/\s{2,}/);

        // We expect: Name, Id, Version, Available, Source
        // Sometimes there's no source, so minimum 4 parts
        if (parts.length >= 4) {
            const name = parts[0];
            const id = parts[1];
            const currentVersion = parts[2];
            let availableVersion = parts[3];
            const source = parts[4] || '';

            // Skip if looks like a header row
            if (name === 'Name' || id === 'Id' || currentVersion === 'Version') {
                return;
            }

            // Skip if availableVersion looks like a source (winget, msstore, etc.)
            const knownSources = ['winget', 'msstore', 'microsoft', 'store'];
            if (knownSources.some(s => availableVersion.toLowerCase() === s)) {
                // Try to use source as available version if it looks like a version
                if (source && /^\d/.test(source)) {
                    availableVersion = source;
                } else {
                    return; // Skip this entry
                }
            }

            // Validate version format (should start with a digit or 'v')
            const isValidVersion = (v) => /^[\dv]/i.test(v) && !knownSources.includes(v.toLowerCase());

            if (!isValidVersion(currentVersion) || !isValidVersion(availableVersion)) {
                return;
            }

            // Filter out items without proper versions
            if (currentVersion && availableVersion &&
                currentVersion !== 'Unknown' &&
                availableVersion !== 'Unknown' &&
                currentVersion !== availableVersion &&
                !currentVersion.includes('Available') &&
                !availableVersion.includes('Source')) {

                // Filter out CJK characters (Chinese, Japanese, Korean)
                if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af]/.test(name)) {
                    return;
                }

                upgradableApps.push({
                    name,
                    id,
                    currentVersion,
                    availableVersion,
                    source,
                    status: 'pending' // pending, upgrading, success, error
                });
            }
        }
    });
}

// Render upgradable apps
function renderUpgradableApps() {
    const t = translations[currentLang];
    const grid = views.updates?.querySelector('#updatesGrid') || updatesGrid;

    if (!grid) return;

    grid.innerHTML = '';

    // Update summary
    renderUpdatesSummary();

    if (upgradableApps.length === 0) {
        grid.innerHTML = `
            <div class="no-updates-message">
                <div class="icon">✅</div>
                <h3>${t.noUpdates}</h3>
                <p>${t.noUpdatesText}</p>
            </div>
        `;
        return;
    }

    upgradableApps.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = `update-card ${selectedUpgrades.has(app.id) ? 'selected' : ''}`;
        card.dataset.appId = app.id;
        card.dataset.index = index;

        const isChecked = selectedUpgrades.has(app.id);
        const isUpgrading = app.status === 'upgrading';
        const isSuccess = app.status === 'success';
        const isError = app.status === 'error';

        // Button text and style based on status
        let buttonText = '⬆️ Güncelle';
        let buttonClass = 'update-btn upgrade-single-btn';
        let buttonDisabled = '';

        if (isUpgrading) {
            buttonText = '⏳ Güncelleniyor...';
            buttonClass = 'update-btn upgrade-single-btn';
            buttonDisabled = 'disabled';
        } else if (isSuccess) {
            buttonText = '✅ Tamamlandı';
            buttonClass = 'update-btn upgrade-single-btn';
            buttonDisabled = 'disabled';
        } else if (isError) {
            buttonText = '❌ Hata';
            buttonClass = 'update-btn upgrade-single-btn';
            buttonDisabled = '';
        }

        card.innerHTML = `
            <div class="update-card-header">
                <input type="checkbox" 
                       class="update-checkbox" 
                       id="check-${app.id.replace(/[^a-zA-Z0-9]/g, '_')}"
                       ${isChecked ? 'checked' : ''}
                       ${isUpgrading || isSuccess ? 'disabled' : ''}
                       onchange="toggleUpdateSelection('${app.id}', this)">
                <div class="update-info">
                    <div class="update-name" title="${app.name}">${app.name}</div>
                    <div class="update-id" title="${app.id}">${app.id}</div>
                </div>
            </div>
            <div class="version-comparison">
                <div class="version-old">
                    <span class="version-label">${t.currentVersion}</span>
                    <span class="version-value">${app.currentVersion}</span>
                </div>
                <span class="version-arrow">→</span>
                <div class="version-new">
                    <span class="version-label">${t.newVersion}</span>
                    <span class="version-value">${app.availableVersion}</span>
                </div>
            </div>
            <div class="update-progress ${isUpgrading ? '' : 'hidden'}" id="progress-update-${app.id.replace(/[^a-zA-Z0-9]/g, '_')}">
                <div class="update-progress-fill" style="width: 0%"></div>
            </div>
            <div class="update-progress-text" id="progress-text-update-${app.id.replace(/[^a-zA-Z0-9]/g, '_')}"></div>
            <div class="update-actions">
                <button class="${buttonClass}" 
                        onclick="upgradeSingleApp('${app.id}')"
                        ${buttonDisabled}
                        style="${isSuccess ? 'background: #22c55e;' : isError ? 'background: #ef4444;' : ''}">
                    ${buttonText}
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Render updates summary
function renderUpdatesSummary() {
    if (!updatesSummary) return;

    const t = translations[currentLang];

    updatesSummary.innerHTML = `
        <div class="summary-card">
            <span class="summary-icon">📦</span>
            <div class="summary-content">
                <span class="summary-value">${upgradableApps.length}</span>
                <span class="summary-label">${t.totalUpdates}</span>
            </div>
        </div>
        <div class="summary-card">
            <span class="summary-icon">☑️</span>
            <div class="summary-content">
                <span class="summary-value" id="selectedCount">${selectedUpgrades.size}</span>
                <span class="summary-label">${t.selectedUpdates}</span>
            </div>
        </div>
    `;
}

// Toggle update selection
window.toggleUpdateSelection = (appId, checkbox) => {
    if (checkbox.checked) {
        selectedUpgrades.add(appId);
    } else {
        selectedUpgrades.delete(appId);
    }

    // Update card styling
    const card = checkbox.closest('.update-card');
    if (card) {
        card.classList.toggle('selected', checkbox.checked);
    }

    // Update summary and button
    updateSelectedCount();
    updateUpgradeButton();
};

// Update selected count display
function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = selectedUpgrades.size;
    }
}

// Update upgrade button state
function updateUpgradeButton() {
    if (upgradeSelectedBtn) {
        upgradeSelectedBtn.disabled = selectedUpgrades.size === 0;
        const t = translations[currentLang];
        upgradeSelectedBtn.textContent = `🚀 ${t.upgradeSelected} (${selectedUpgrades.size})`;
    }
}

// Select/Deselect all
if (selectAllUpdatesBtn) {
    selectAllUpdatesBtn.addEventListener('click', () => {
        const t = translations[currentLang];
        const allSelected = selectedUpgrades.size === upgradableApps.filter(a => a.status === 'pending').length;

        if (allSelected) {
            // Deselect all
            selectedUpgrades.clear();
            selectAllUpdatesBtn.textContent = `☑️ ${t.selectAll}`;
        } else {
            // Select all pending
            upgradableApps.forEach(app => {
                if (app.status === 'pending') {
                    selectedUpgrades.add(app.id);
                }
            });
            selectAllUpdatesBtn.textContent = `☐ ${t.deselectAll}`;
        }

        // Update checkboxes
        document.querySelectorAll('.update-checkbox').forEach(cb => {
            const appId = cb.closest('.update-card')?.dataset.appId;
            if (appId) {
                const app = upgradableApps.find(a => a.id === appId);
                if (app && app.status === 'pending') {
                    cb.checked = selectedUpgrades.has(appId);
                    cb.closest('.update-card')?.classList.toggle('selected', cb.checked);
                }
            }
        });

        updateSelectedCount();
        updateUpgradeButton();
    });
}

// Refresh updates button
if (refreshUpdatesBtn) {
    refreshUpdatesBtn.addEventListener('click', loadUpgradableApps);
}

// Upgrade single app
window.upgradeSingleApp = async (appId) => {
    const t = translations[currentLang];
    const app = upgradableApps.find(a => a.id === appId);
    if (!app) return;

    app.status = 'upgrading';
    renderUpgradableApps();

    const safeId = appId.replace(/[^a-zA-Z0-9]/g, '_');
    const progressEl = document.getElementById(`progress-update-${safeId}`);

    if (progressEl) {
        progressEl.classList.remove('hidden');
    }

    try {
        // IPC listener zaten global olarak kayıtlı, burada tekrar kaydetmeye gerek yok
        const result = await window.api.upgradeApp(appId);

        const progressFill = progressEl?.querySelector('.update-progress-fill');
        const progressText = document.getElementById(`progress-text-update-${safeId}`);

        if (result.error) {
            app.status = 'error';
            if (progressText) progressText.textContent = t.upgradeFailed;
        } else {
            app.status = 'success';
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = t.upgradeSuccess;
        }

    } catch (err) {
        app.status = 'error';
        console.error('Upgrade error:', err);
    }

    renderUpgradableApps();
};

// Upgrade selected apps
if (upgradeSelectedBtn) {
    upgradeSelectedBtn.addEventListener('click', async () => {
        if (selectedUpgrades.size === 0) return;

        const t = translations[currentLang];
        const appIds = Array.from(selectedUpgrades);

        // Confirm
        if (!confirm(`${selectedUpgrades.size} uygulama güncellenecek. Devam edilsin mi?`)) {
            return;
        }

        // Mark all as upgrading
        appIds.forEach(appId => {
            const app = upgradableApps.find(a => a.id === appId);
            if (app) app.status = 'upgrading';
        });
        renderUpgradableApps();

        // Disable buttons during upgrade
        upgradeSelectedBtn.disabled = true;
        if (refreshUpdatesBtn) refreshUpdatesBtn.disabled = true;
        if (selectAllUpdatesBtn) selectAllUpdatesBtn.disabled = true;

        // IPC listener zaten global olarak kayıtlı (registerUpgradeIPCListeners)

        try {
            const results = await window.api.upgradeSelectedApps(appIds);

            // Update status based on results
            results.forEach(r => {
                const app = upgradableApps.find(a => a.id === r.appId);
                if (app) {
                    app.status = r.success ? 'success' : 'error';
                }
            });

            // Show summary
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            alert(`Güncelleme tamamlandı!\n\n✅ Başarılı: ${successCount}\n❌ Başarısız: ${failCount}`);

        } catch (err) {
            console.error('Batch upgrade error:', err);
            alert('Güncelleme sırasında bir hata oluştu: ' + err.message);
        }

        // Re-enable buttons
        if (refreshUpdatesBtn) refreshUpdatesBtn.disabled = false;
        if (selectAllUpdatesBtn) selectAllUpdatesBtn.disabled = false;

        // Clear selections and re-render
        selectedUpgrades.clear();
        renderUpgradableApps();
    });
}

// Update existing tab switch logic to include updates
const originalTabsLogic = () => {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;

            if (target === 'updates') {
                // Load updates when tab is clicked
                if (upgradableApps.length === 0) {
                    loadUpgradableApps();
                }
            }
        });
    });
};

// Call on DOM load - wait a bit to ensure tabs are initialized
setTimeout(() => {
    // Add updates tab handler
    const updatesTab = document.querySelector('.nav-tab[data-target="updates"]');
    if (updatesTab) {
        updatesTab.addEventListener('click', () => {
            loadUpgradableApps();
        });
    }

    // Update the existing upgrade button to switch to updates tab
    if (upgradeBtn) {
        // Remove old event listener and add new one
        const newUpgradeBtn = upgradeBtn.cloneNode(true);
        upgradeBtn.parentNode.replaceChild(newUpgradeBtn, upgradeBtn);

        newUpgradeBtn.addEventListener('click', () => {
            // Switch to updates tab
            const updatesTab = document.querySelector('.nav-tab[data-target="updates"]');
            if (updatesTab) {
                updatesTab.click();
            }
        });
    }
}, 100);

// =============================================
// NOTIFICATION SETTINGS LOGIC
// =============================================

// Load notification settings on startup
async function loadNotificationSettings() {
    try {
        const settings = await window.api.getNotificationSettings();

        const toggle = document.getElementById('notificationEnabledToggle');
        if (toggle) {
            toggle.checked = settings.enabled;
        }

        updateLastScanInfo(settings.lastScanTime);
    } catch (err) {
        console.error('Failed to load notification settings:', err);
    }
}

// Update last scan info display
function updateLastScanInfo(lastScanTime) {
    const infoEl = document.getElementById('lastScanInfo');
    if (!infoEl) return;

    const t = translations[currentLang];

    if (lastScanTime) {
        const date = new Date(lastScanTime);
        const formattedDate = date.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        infoEl.textContent = `Son tarama: ${formattedDate}`;
    } else {
        infoEl.textContent = 'Henüz tarama yapılmadı';
    }
}

// Notification toggle handler
const notificationToggle = document.getElementById('notificationEnabledToggle');
if (notificationToggle) {
    notificationToggle.addEventListener('change', async () => {
        try {
            await window.api.setNotificationSettings({
                enabled: notificationToggle.checked
            });
        } catch (err) {
            console.error('Failed to save notification settings:', err);
        }
    });
}

// Test notification button
const testNotificationBtn = document.getElementById('testNotificationBtn');
if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', async () => {
        try {
            testNotificationBtn.disabled = true;
            testNotificationBtn.textContent = '⏳ Gönderiliyor...';
            await window.api.testNotification();
            testNotificationBtn.textContent = '✅ Gönderildi!';
            setTimeout(() => {
                testNotificationBtn.disabled = false;
                testNotificationBtn.textContent = '🔔 Test Bildirimi';
            }, 2000);
        } catch (err) {
            console.error('Failed to send test notification:', err);
            testNotificationBtn.disabled = false;
            testNotificationBtn.textContent = '🔔 Test Bildirimi';
        }
    });
}

// Force scan button
const forceScanBtn = document.getElementById('forceScanBtn');
if (forceScanBtn) {
    forceScanBtn.addEventListener('click', async () => {
        try {
            forceScanBtn.disabled = true;
            forceScanBtn.textContent = '⏳ Taranıyor...';
            await window.api.triggerUpdateScan();

            // Reload settings to update last scan time
            const settings = await window.api.getNotificationSettings();
            updateLastScanInfo(settings.lastScanTime);

            forceScanBtn.textContent = '✅ Tamamlandı!';
            setTimeout(() => {
                forceScanBtn.disabled = false;
                forceScanBtn.textContent = '🔍 Şimdi Tara';
            }, 2000);
        } catch (err) {
            console.error('Failed to trigger update scan:', err);
            forceScanBtn.disabled = false;
            forceScanBtn.textContent = '🔍 Şimdi Tara';
        }
    });
}

// Listen for switch to updates tab (from notification click)
if (window.api.onSwitchToUpdatesTab) {
    window.api.onSwitchToUpdatesTab(() => {
        const updatesTab = document.querySelector('.nav-tab[data-target="updates"]');
        if (updatesTab) {
            updatesTab.click();
        }
    });
}

// Load notification settings on startup
loadNotificationSettings();

// Close settings button
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        // Switch back to search tab (default)
        const searchTab = document.querySelector('.nav-tab[data-target="search"]');
        if (searchTab) {
            searchTab.click();
        }
    });
}

// App Update Handlers
const checkAppUpdateBtn = document.getElementById('checkAppUpdateBtn');
const manualDownloadBtn = document.getElementById('manualDownloadBtn');
const updateStatusInfo = document.getElementById('updateStatusInfo');

// Load current version on startup
async function loadAppVersion() {
    try {
        const state = await window.api.getAppUpdateState();
        const versionEl = document.getElementById('currentAppVersion');
        if (versionEl && state.currentVersion) {
            versionEl.textContent = 'v' + state.currentVersion;
        }
    } catch (err) {
        console.error('Failed to load app version:', err);
    }
}
loadAppVersion();

// Check for app updates button
if (checkAppUpdateBtn) {
    checkAppUpdateBtn.addEventListener('click', async () => {
        checkAppUpdateBtn.disabled = true;
        checkAppUpdateBtn.textContent = '⏳ Kontrol ediliyor...';
        updateStatusInfo.textContent = 'Güncelleme kontrol ediliyor...';

        try {
            await window.api.checkForAppUpdates();
        } catch (err) {
            updateStatusInfo.textContent = 'Hata: ' + err.message;
            updateStatusInfo.style.color = '#f87171';
        } finally {
            checkAppUpdateBtn.disabled = false;
            checkAppUpdateBtn.textContent = '🔍 Güncelleme Kontrol Et';
        }
    });
}

// Manual download button
if (manualDownloadBtn) {
    manualDownloadBtn.addEventListener('click', async () => {
        await window.api.openDownloadPage();
    });
}

// Listen for update status changes
if (window.api.onUpdateStatus) {
    window.api.onUpdateStatus((data) => {
        if (!updateStatusInfo) return;

        switch (data.status) {
            case 'checking':
                updateStatusInfo.textContent = 'Güncelleme kontrol ediliyor...';
                updateStatusInfo.style.color = '#60a5fa';
                break;
            case 'available':
                updateStatusInfo.innerHTML = `<span style="color: #4ade80;">✅ Yeni sürüm mevcut: v${data.version}</span>`;
                break;
            case 'not-available':
                updateStatusInfo.innerHTML = '<span style="color: #4ade80;">✅ Uygulama güncel!</span>';
                break;
            case 'downloading':
                updateStatusInfo.innerHTML = `<span style="color: #60a5fa;">📥 İndiriliyor: ${data.percent.toFixed(1)}%</span>`;
                break;
            case 'downloaded':
                updateStatusInfo.innerHTML = `<span style="color: #4ade80;">✅ v${data.version} indirildi! Yeniden başlatın.</span>`;
                break;
            case 'error':
                updateStatusInfo.innerHTML = `<span style="color: #f87171;">❌ Hata: ${data.message}</span>`;
                break;
        }
    });
}
