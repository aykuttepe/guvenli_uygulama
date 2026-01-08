# 🔍 Sentry Kurulum Rehberi

Sentry, uygulamanızdaki hataları uzaktan takip etmenizi sağlar.

## 📋 Adım 1: Sentry Hesabı Oluştur

1. **https://sentry.io** adresine git
2. **"Get Started Free"** tıkla
3. GitHub/Google ile kaydol

## 📦 Adım 2: Proje Oluştur

1. Sentry Dashboard'a gir
2. **"Create Project"** tıkla
3. Platform: **Electron** seç
4. Project name: `guvenli-yukleyici`
5. **"Create Project"** tıkla

## 🔑 Adım 3: DSN'i Al

Proje oluşturduktan sonra, DSN gösterilecek. Şu formatta olacak:

```
https://xxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567
```

## ⚙️ Adım 4: DSN'i Uygulamaya Ekle

`src/main/services/sentry.js` dosyasını aç ve şu satırı güncelle:

```javascript
// ÖNCE:
const SENTRY_DSN = 'YOUR_SENTRY_DSN_HERE';

// SONRA:
const SENTRY_DSN = 'https://xxxxxxxx@o123456.ingest.sentry.io/1234567';
```

## ✅ Test Et

Uygulamayı başlat:
```bash
npm start
```

Console'da şu mesajı göreceksin:
```
[Sentry] Initialized successfully
```

## 📊 Dashboard Kullanımı

Sentry Dashboard'da görebileceklerin:

| Özellik | Açıklama |
|---------|----------|
| **Issues** | Tüm hatalar ve çökümler |
| **Releases** | Sürüm bazlı hata takibi |
| **Users** | Etkilenen kullanıcı sayısı |
| **Performance** | Performans metrikleri |
| **Breadcrumbs** | Hatadan önceki adımlar |

## 🎯 Otomatik Yakalanan Hatalar

- ✅ Uncaught Exceptions (yakalanmamış hatalar)
- ✅ Unhandled Promise Rejections
- ✅ logger.error() çağrıları
- ✅ Console error/warn mesajları

## 📧 Bildirimler

Sentry'de e-posta bildirimleri ayarlayabilirsin:

1. Settings → Notifications
2. "Issue Alert Settings" → E-posta adresini ekle
3. İlk hata geldiğinde e-posta alacaksın

## 🔒 Gizlilik

- Kullanıcı bilgileri anonimdir
- Sadece hata bilgisi gönderilir
- GDPR uyumludur

## 📈 Fiyatlandırma

| Plan | Limit | Fiyat |
|------|-------|-------|
| **Developer** | 5K event/ay | Ücretsiz |
| Team | 100K event/ay | $26/ay |
| Business | 500K event/ay | $80/ay |

Küçük-orta ölçekli uygulamalar için **Developer (Ücretsiz)** plan yeterlidir.
