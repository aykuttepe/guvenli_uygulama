# Geliştirme Notları

## Versiyonlama Kuralı
- **Her kod değişikliğinde** `package.json` dosyasındaki `version` alanı artırılmalıdır.
- Örnek: 2.13.6 -> 2.13.7
- Bu kural, uygulamanın sürekli güncel kalmasını ve kullanıcıların değişiklikleri (update) alabilmesini sağlamak içindir.

## Loglama
- Uygulama hataları `logger.js` üzerinden `app_logs.txt` dosyasına yazılır.
- Ayarlar menüsünden log dosyasına erişilebilir.
