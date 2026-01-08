# 🔄 Güncelleme Yayınlama Rehberi

Bu rehber, Güvenli Yükleyici uygulamasının yeni sürümlerini nasıl yayınlayacağınızı açıklar.

## 📋 Ön Gereksinimler

1. **GitHub Hesabı** - Repository oluşturulmuş olmalı
2. **GitHub Token** - Repository'e erişim için
3. **Git** - Versiyon kontrolü için

## 🚀 Güncelleme Yayınlama Adımları

### 1. GitHub'da Repository Oluştur

```bash
# Yeni repository oluştur: guvenli_uygulama
# https://github.com/USERNAME/guvenli_uygulama
```

### 2. package.json'ı Güncelle

`package.json` dosyasındaki şu alanları kendi bilgilerinle değiştir:

```json
{
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/guvenli_uygulama.git"
  },
  "build": {
    "publish": {
      "owner": "YOUR_USERNAME",
      "repo": "guvenli_uygulama"
    }
  }
}
```

### 3. updater.js'i Güncelle

`src/main/services/updater.js` dosyasındaki `YOUR_USERNAME` ifadelerini değiştir.

### 4. GitHub Token Oluştur

1. GitHub → Settings → Developer settings → Personal access tokens
2. "Generate new token (classic)" tıkla
3. Scope: `repo` (full control)
4. Token'ı kopyala

### 5. Environment Variable Ayarla

```bash
# Windows PowerShell
$env:GH_TOKEN = "your_github_token_here"

# Veya kalıcı olarak
[Environment]::SetEnvironmentVariable("GH_TOKEN", "your_token", "User")
```

### 6. Versiyon Numarasını Güncelle

```bash
# package.json'da version'ı güncelle
# Örnek: "2.14.0" → "2.15.0"
```

### 7. Build ve Publish

```bash
# Draft release oluştur (test için)
npm run release:draft

# Yayınla
npm run release
```

## 📦 Güncelleme Akışı

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  npm run build  │ ──► │  GitHub Release │ ──► │  Kullanıcılar   │
│                 │     │   (otomatik)    │     │  indirsin      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🔧 Kullanıcı Tarafı

Uygulama açıldığında otomatik olarak güncelleme kontrolü yapar:

1. **Otomatik Kontrol** - Başlangıçta 10 sn sonra, ardından her 4 saatte
2. **Manuel Kontrol** - Ayarlar → "Güncelleme Kontrol Et" butonu
3. **İndirme** - Kullanıcı onayı ile arka planda indirilir
4. **Kurulum** - Uygulama kapatılınca otomatik kurulur

## 📁 Release Dosyaları

Build sonrası `dist/` klasöründe şu dosyalar oluşur:

```
dist/
├── Güvenli Yükleyici Setup 2.15.0.exe    # Ana installer
├── Güvenli Yükleyici-2.15.0-win.exe      # Full installer
├── latest.yml                             # Auto-updater için metadata
└── ...
```

## ⚠️ Önemli Notlar

- **Code Signing**: Uyarıları önlemek için kod imzalama sertifikası gerekebilir
- **Semantic Versioning**: MAJOR.MINOR.PATCH formatını kullan
- **Release Notes**: GitHub release sayfasında değişiklikleri yaz

## 🔄 Hızlı Güncelleme Komutu

```bash
# 1. Versiyon güncelle (package.json)
# 2. Commit ve tag
git add .
git commit -m "Release v2.15.0"
git tag v2.15.0

# 3. Push
git push && git push --tags

# 4. Build ve publish
npm run release
```

## 🆘 Sorun Giderme

### Token Hatası
```
Error: GH_TOKEN is not set
```
→ Environment variable ayarla

### Publish Hatası
```
Error: Cannot publish
```
→ Repository ayarlarını kontrol et, token yetkilerini kontrol et

### Build Hatası
```
Error: Cannot find module
```
→ `npm install` çalıştır
