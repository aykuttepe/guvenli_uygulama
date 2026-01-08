# Güvenli Yükleyici

Windows için winget tabanlı güvenli uygulama yükleyicisi.

## 📁 Proje Yapısı

```
guvenli_uygulama/
├── src/                          # Kaynak kodlar
│   ├── main/                     # Electron ana process
│   │   ├── main.js               # Ana giriş noktası
│   │   ├── services/             # Backend servisleri
│   │   │   ├── winget.js         # Winget komut servisi
│   │   │   └── notification.js   # Bildirim servisi
│   │   └── ipc/                  # IPC Handler'lar
│   │       └── handlers.js       # Tüm IPC handler'lar
│   │
│   ├── preload/                  # Preload scripts
│   │   └── preload.js            # Güvenli köprü
│   │
│   └── renderer/                 # UI (Renderer process)
│       ├── index.html            # Ana HTML
│       ├── styles/               # CSS dosyaları
│       │   ├── main.css          # Ana stiller
│       │   └── variables.css     # CSS değişkenleri
│       └── js/                   # JavaScript
│           └── app.js            # Ana uygulama
│
├── assets/                       # Statik dosyalar
│   └── icon.png                  # Uygulama ikonu
│
├── logger.js                     # Loglama modülü
├── installer.nsh                 # NSIS installer script
├── package.json                  # NPM konfigürasyonu
└── README.md                     # Bu dosya
```

## 🚀 Özellikler

- ✅ Winget ile uygulama arama ve yükleme
- ✅ Yüklü uygulamaları listeleme ve kaldırma
- ✅ Güncellenebilir uygulamaları görüntüleme
- ✅ Seçmeli uygulama güncelleme
- ✅ Günlük otomatik güncelleme taraması
- ✅ Windows bildirimleri
- ✅ Türkçe/İngilizce dil desteği
- ✅ Kurulum sonrası önerilen uygulamalar
- ✅ Sürücü güncelleme rehberi

## 🛠️ Geliştirme

### Gereksinimler

- Node.js 18+
- Windows 10/11
- Winget (Windows Package Manager)

### Kurulum

```bash
npm install
```

### Çalıştırma

```bash
npm start
```

### Build

```bash
npm run build
```

## 📦 Teknolojiler

- **Electron** - Cross-platform masaüstü uygulama
- **Winget** - Windows paket yöneticisi
- **Vanilla JS** - Saf JavaScript (framework yok)
- **CSS3** - Modern stiller

## 📝 Lisans

ISC License
