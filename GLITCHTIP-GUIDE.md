# 🔍 GlitchTip Kullanım Rehberi

GlitchTip, uygulamanızdaki hataları uzaktan takip etmenizi sağlayan açık kaynak ve ücretsiz bir araçtır.

## 🎯 GlitchTip vs Sentry

| Özellik | GlitchTip | Sentry |
|---------|-----------|--------|
| **Fiyat** | Tamamen Ücretsiz (self-hosted) | 5K event/ay ücretsiz |
| **Açık Kaynak** | ✅ Tam açık kaynak | ⚠️ Kısmi açık kaynak |
| **Self-Hosted** | ✅ Kolay (4 bileşen) | ⚠️ Zor (12+ bileşen) |
| **SDK Uyumluluğu** | ✅ Sentry SDK kullanır | ✅ Native |
| **Kurulum** | 🟢 Basit (Docker Compose) | 🟡 Karmaşık |
| **Veri Kontrolü** | ✅ Tam kontrol | ❌ Cloud'da |

## 📋 İki Kurulum Seçeneği

### Seçenek 1: GlitchTip Cloud (Önerilen - Hızlı Başlangıç)

1. **https://glitchtip.com** adresine git
2. **"Get Started"** tıkla
3. E-posta ile kaydol (ücretsiz)
4. Proje oluştur (Platform: **JavaScript/Electron**)
5. **DSN**'i kopyala

**Ücretsiz Plan:**
- 1,000 hata/ay
- Sınırsız proje
- Email destek

**Ücretli Planlar:**
- $15/ay - 100,000 hata
- $50/ay - 500,000 hata
- $250/ay - 3,000,000 hata

### Seçenek 2: Self-Hosted (Tamamen Ücretsiz & Sınırsız)

Kendi sunucunuzda GlitchTip kurmak için **GLITCHTIP-SETUP-GUIDE.md** dosyasını okuyun.

**Avantajları:**
- ✅ Tamamen ücretsiz
- ✅ Sınırsız hata takibi
- ✅ Tam veri kontrolü
- ✅ GDPR uyumlu
- ✅ Kendi sunucunuzda

## 🔑 DSN'i Uygulamaya Ekle

`src/main/services/sentry.js` dosyasını aç ve DSN'i güncelle:

```javascript
// ÖNCE:
const GLITCHTIP_DSN = 'YOUR_GLITCHTIP_DSN_HERE';

// SONRA (GlitchTip Cloud):
const GLITCHTIP_DSN = 'https://xxxxxxxx@app.glitchtip.com/1234';

// veya SONRA (Self-Hosted):
const GLITCHTIP_DSN = 'http://xxxxxxxx@your-server-ip:8000/1';
```

## ✅ Test Et

Uygulamayı başlat:
```bash
npm start
```

Console'da şu mesajı göreceksin:
```
[GlitchTip] Initialized successfully
```

### Test Hatası Gönder

`src/main/main.js` dosyasına geçici olarak test kodu ekle:

```javascript
// Test için (sonra sil!)
app.whenReady().then(async () => {
    // ... mevcut kod ...

    // Test hatası
    setTimeout(() => {
        throw new Error('GlitchTip test hatası - Bu mesajı görüyorsan çalışıyor! 🎉');
    }, 5000);
});
```

Uygulamayı çalıştır ve 5 saniye bekle. GlitchTip dashboard'unda hata görünecek.

## 📊 Dashboard Kullanımı

GlitchTip Dashboard'da görebileceklerin:

| Özellik | Açıklama |
|---------|----------|
| **Issues** | Tüm hatalar ve çökümler |
| **Events** | Her hatanın detaylı olayları |
| **Uptime** | Site uptime monitoring (opsiyonel) |
| **Performance** | Performans metrikleri |
| **Breadcrumbs** | Hatadan önceki adımlar |
| **Stack Trace** | Detaylı hata izleme |

## 🎯 Otomatik Yakalanan Hatalar

Güvenli Yükleyici'de otomatik olarak yakalanan hatalar:

- ✅ **Uncaught Exceptions** - Yakalanmamış hatalar
- ✅ **Unhandled Promise Rejections** - Promise hataları
- ✅ **logger.error()** çağrıları
- ✅ **Console error/warn** mesajları
- ✅ **Render process crash** - UI çökmeleri
- ✅ **Winget komut hataları**
- ✅ **IPC iletişim hataları**

## 📧 Bildirimler (Self-Hosted)

E-posta bildirimleri almak için `.env` dosyasında SMTP ayarla:

```bash
# Gmail örneği
EMAIL_URL=smtp://youremail@gmail.com:app-password@smtp.gmail.com:587/?tls=True

# Outlook
EMAIL_URL=smtp://youremail@outlook.com:password@smtp-mail.outlook.com:587/?tls=True
```

Dashboard'da:
1. **Settings** → **Alerts**
2. Yeni alert kuralı oluştur
3. E-posta adresini ekle

## 🔍 Hata Detayları

Her hata için görebileceğin bilgiler:

```javascript
{
  "message": "Winget komutu başarısız",
  "level": "error",
  "platform": "win32",
  "arch": "x64",
  "electron_version": "39.2.4",
  "node_version": "18.x",
  "app_version": "2.16.0",
  "breadcrumbs": [
    "User clicked 'Install' button",
    "Started winget install command",
    "Exit code: 1"
  ],
  "stack_trace": "..."
}
```

## 🔒 Gizlilik & Güvenlik

**GlitchTip Cloud:**
- Kullanıcı bilgileri anonimdir
- Sadece hata bilgisi gönderilir
- GDPR uyumludur
- EU sunucularında barındırılır

**Self-Hosted:**
- ✅ Tüm veriler sizde kalır
- ✅ Tam kontrol
- ✅ Kendi politikalarınız
- ✅ İnternet gerektirmez (local network)

## 📈 Performans İzleme

GlitchTip sadece hata takibi yapmaz, aynı zamanda performans metrikleri de sunar:

```javascript
// src/main/services/sentry.js dosyasında
tracesSampleRate: 0.1, // %10 işlemleri izle
```

İzlenen metrikler:
- Uygulama başlatma süresi
- Winget komut süreleri
- IPC çağrı süreleri
- Render process performansı

## 🛠️ Debugging İpuçları

### 1. Breadcrumbs Ekle

```javascript
const glitchTipService = require('./services/sentry');

glitchTipService.addBreadcrumb('Kullanıcı arama yaptı', 'user-action', {
    query: 'vscode',
    resultCount: 5
});
```

### 2. User Context Ayarla

```javascript
glitchTipService.setUser({
    id: 'anonymous-user-123',
    username: 'Windows User'
});
```

### 3. Manuel Hata Gönder

```javascript
try {
    // Riskli kod
    await wingetService.installApp('invalid-app');
} catch (error) {
    glitchTipService.captureError(error, {
        tags: { operation: 'install' },
        extra: { appId: 'invalid-app' }
    });
}
```

## 🔄 Sentry'den GlitchTip'e Geçiş

**Güzel haber:** GlitchTip, Sentry SDK'sını kullanır, yani kod değişikliği gerekmez!

Tek yapman gereken:
1. ✅ DSN'i değiştir (zaten yaptık)
2. ✅ Uygulamayı test et
3. ✅ Eski Sentry projesini sil (opsiyonel)

## 📦 Veritabanı Yedekleme (Self-Hosted)

Düzenli backup almayı unutma:

```bash
# Otomatik backup script
docker-compose exec postgres pg_dump -U postgres glitchtip > backup_$(date +%Y%m%d).sql

# Cron job ile günlük backup (Linux)
0 2 * * * cd /path/to/glitchtip && docker-compose exec postgres pg_dump -U postgres glitchtip > backup_$(date +\%Y\%m\%d).sql
```

## 🆘 Sorun Giderme

### DSN yanlış formatda

```
❌ YOUR_GLITCHTIP_DSN_HERE
❌ glitchtip.com/project
✅ https://abc123@app.glitchtip.com/1
✅ http://abc123@192.168.1.100:8000/1
```

### Console'da "[GlitchTip] Not configured"

`src/main/services/sentry.js:14` satırında DSN'i kontrol et.

### Hatalar gözükmüyor

1. DSN doğru mu?
2. İnternet bağlantısı var mı? (cloud için)
3. `NODE_ENV=development` mı? (development'da gönderilmez)
4. Console'da "[GlitchTip] Initialized successfully" yazıyor mu?

### Self-hosted erişilemiyor

```bash
# Servislerin durumu
docker-compose ps

# Logları kontrol et
docker-compose logs web

# Port açık mı?
netstat -an | findstr 8000
```

## 📚 Faydalı Linkler

- [GlitchTip Resmi Site](https://glitchtip.com)
- [GlitchTip Dokümantasyon](https://glitchtip.com/documentation)
- [GlitchTip GitHub](https://github.com/glitchtip/glitchtip)
- [Sentry SDK Dokümantasyon](https://docs.sentry.io/platforms/javascript/guides/electron/)
- [Self-Hosted Kurulum Rehberi](./GLITCHTIP-SETUP-GUIDE.md)

## 💡 Pro Tips

1. **Development'da Devre Dışı**: Development modda hatalar gönderilmez, sadece production'da
2. **Rate Limiting**: Çok fazla hata varsa, aynı hata gruplanır
3. **Source Maps**: JavaScript minify edildiyse, source maps kullan
4. **Releases**: Her versiyon için release oluştur, hataları versiyona göre takip et

## ✅ Kurulum Kontrol Listesi

- [ ] GlitchTip hesabı oluşturuldu (cloud veya self-hosted)
- [ ] Proje oluşturuldu
- [ ] DSN kopyalandı
- [ ] `src/main/services/sentry.js:14` dosyasında DSN güncellendi
- [ ] Uygulama test edildi
- [ ] Test hatası gönderildi
- [ ] Dashboard'da hata görüldü
- [ ] E-posta bildirimleri ayarlandı (opsiyonel)

## 🎉 Tamamlandı!

Artık tüm hatalar otomatik olarak GlitchTip'e gönderilecek. Dashboard'dan gerçek zamanlı olarak kullanıcılarınızın karşılaştığı sorunları görebilirsiniz.

**Sorularınız için:**
- GitHub Issues: https://github.com/aykuttepe/guvenli_uygulama/issues
- GlitchTip Community: https://glitchtip.com/community
