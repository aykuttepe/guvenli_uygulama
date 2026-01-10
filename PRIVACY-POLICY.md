# Gizlilik Politikası - Güvenli Yükleyici

**Son Güncelleme:** 10 Ocak 2026

## Genel Bakış

Güvenli Yükleyici uygulaması, kullanıcı gizliliğine saygı gösterir ve kişisel verilerinizi korumak için tasarlanmıştır.

## Toplanan Veriler

### Otomatik Olarak Toplanan Veriler

**Hata Raporları (GlitchTip):**
- Uygulama hataları ve çökme raporları
- Hata anında sistem bilgileri (işletim sistemi versiyonu, uygulama versiyonu)
- Hata stack trace'leri
- **KİŞİSEL VERİ İÇERMEZ:** Ad, e-posta, IP adresi gibi kişisel bilgiler toplanmaz

**Amaç:** Uygulama stabilitesini artırmak ve hataları düzeltmek

### Toplanan Teknik Bilgiler

- İşletim sistemi versiyonu (Windows sürümü)
- Uygulama versiyonu
- Yüklü paket listesi (sadece winget paketleri)
- Güncelleme kontrolü zamanları

## Veri Saklama

- **Hata Raporları:** Self-hosted GlitchTip sunucusunda saklanır (https://glitchtip.mytepeapi.com.tr)
- **Lokal Veriler:** Tüm kullanıcı verileri cihazınızda lokal olarak saklanır
- **Saklama Süresi:** Hata raporları 90 gün sonra otomatik silinir

## Veri Paylaşımı

- **3. Taraf Paylaşım:** Hiçbir veri 3. taraflarla paylaşılmaz
- **Reklam Yok:** Uygulama reklam içermez ve reklam ağlarıyla veri paylaşmaz
- **Analitik Yok:** Google Analytics veya benzeri izleme servisleri kullanılmaz

## Veri Güvenliği

- Tüm hata raporları HTTPS ile şifrelenmiş olarak gönderilir
- Self-hosted sunucu kullanıldığı için veriler üçüncü taraf bulut servislerine gitmez
- Lokal veriler Windows kullanıcı klasöründe saklanır

## Kullanıcı Hakları

- **Erişim:** Lokal verilere `%APPDATA%/guvenli_uygulama` klasöründen erişebilirsiniz
- **Silme:** Uygulamayı kaldırdığınızda tüm lokal veriler silinir
- **Hata Raporlarını Kapatma:** Gelecek versiyonda eklenecek

## Winget Entegrasyonu

- Uygulama, yüklü paketleri listelemek için Windows Package Manager (winget) kullanır
- Winget komutları lokal olarak çalışır, hiçbir veri dışarı gönderilmez
- Paket güncelleme kontrolleri Microsoft'un winget depolarına yapılır

## GlitchTip Hata Takibi

- **Self-Hosted:** Hata raporları kendi sunucumuzda saklanır
- **Açık Kaynak:** GlitchTip açık kaynak bir yazılımdır
- **GDPR Uyumlu:** Kişisel veri toplamadığı için GDPR ile uyumludur
- **Sunucu Konumu:** Türkiye

## Değişiklikler

Bu gizlilik politikası güncellenebilir. Önemli değişikliklerde uygulama içinde bildirim yapılacaktır.

## İletişim

Sorularınız için:
- **GitHub:** https://github.com/aykuttepe/guvenli_uygulama/issues
- **E-posta:** [E-posta adresiniz buraya]

## Yasal Uyum

- **KVKK Uyumlu:** Türkiye Kişisel Verilerin Korunması Kanunu'na uygundur
- **GDPR Uyumlu:** Avrupa Birliği Genel Veri Koruma Yönetmeliği ile uyumludur

---

**Not:** Bu uygulama açık kaynaklıdır. Kaynak kodunu inceleyerek veri toplama uygulamalarını doğrulayabilirsiniz.
