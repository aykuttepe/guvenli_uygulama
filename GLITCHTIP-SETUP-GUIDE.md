# GlitchTip Self-Hosted Kurulum Rehberi

GlitchTip, Sentry'nin açık kaynak ve ücretsiz alternatifidir. Bu rehber, GlitchTip'i kendi sunucunuzda Docker ile kurmanızı sağlar.

## 📋 Gereksinimler

- Docker ve Docker Compose kurulu bir sunucu (Linux/Windows/Mac)
- En az 2GB RAM
- En az 10GB disk alanı
- Bir domain adı (opsiyonel, ama önerilen)

## 🚀 Kurulum Adımları

### 1. Docker Compose Dosyası Oluştur

Sunucunuzda bir klasör oluşturun ve içine `docker-compose.yml` dosyası ekleyin:

```bash
mkdir glitchtip
cd glitchtip
```

`docker-compose.yml` dosyasını oluşturun:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_HOST_AUTH_METHOD: "trust"  # Geliştirme için, production'da şifre kullanın
      POSTGRES_DB: glitchtip
    restart: unless-stopped
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: unless-stopped

  web:
    image: glitchtip/glitchtip:latest
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}  # Güvenli bir anahtar oluşturun
      PORT: 8000
      EMAIL_URL: consolemail://  # Geliştirme için, production'da SMTP kullanın
      GLITCHTIP_DOMAIN: ${GLITCHTIP_DOMAIN:-http://localhost:8000}
      DEFAULT_FROM_EMAIL: noreply@yourdomain.com
      CELERY_WORKER_AUTOSCALE: "1,3"
      CELERY_WORKER_MAX_TASKS_PER_CHILD: "10000"
    restart: unless-stopped
    volumes:
      - uploads:/code/uploads

  worker:
    image: glitchtip/glitchtip:latest
    command: ./bin/run-celery-with-beat.sh
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres@postgres:5432/glitchtip
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      EMAIL_URL: consolemail://
      GLITCHTIP_DOMAIN: ${GLITCHTIP_DOMAIN:-http://localhost:8000}
      DEFAULT_FROM_EMAIL: noreply@yourdomain.com
      CELERY_WORKER_AUTOSCALE: "1,3"
      CELERY_WORKER_MAX_TASKS_PER_CHILD: "10000"
    restart: unless-stopped
    volumes:
      - uploads:/code/uploads

  migrate:
    image: glitchtip/glitchtip:latest
    depends_on:
      - postgres
    command: "./manage.py migrate"
    environment:
      DATABASE_URL: postgresql://postgres@postgres:5432/glitchtip
      SECRET_KEY: ${SECRET_KEY}

volumes:
  postgres-data:
  uploads:
```

### 2. Environment Değişkenlerini Ayarla

`.env` dosyası oluşturun:

```bash
# Güvenli bir SECRET_KEY oluşturun (en az 50 karakter)
SECRET_KEY=your-very-long-and-random-secret-key-here-at-least-50-chars

# Domain adresiniz (http:// veya https:// ile başlamalı)
GLITCHTIP_DOMAIN=http://your-server-ip:8000
# veya
# GLITCHTIP_DOMAIN=https://glitchtip.yourdomain.com
```

**SECRET_KEY oluşturmak için:**

```bash
# Linux/Mac
openssl rand -hex 32

# veya Python ile
python3 -c "import secrets; print(secrets.token_hex(32))"

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 50 | % {[char]$_})
```

### 3. GlitchTip'i Başlat

```bash
# Servisleri başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f
```

İlk başlatmada migrate servisi veritabanını hazırlayacak. Tamamlandıktan sonra:

```
http://your-server-ip:8000
```

adresinden GlitchTip'e erişebilirsiniz.

### 4. Admin Kullanıcı Oluştur

```bash
docker-compose run --rm web ./manage.py createsuperuser
```

Email ve şifre girişi yapın.

### 5. GlitchTip'e Giriş Yap ve Proje Oluştur

1. Tarayıcıda `http://your-server-ip:8000` açın
2. Oluşturduğunuz admin hesabıyla giriş yapın
3. **"Create a new project"** tıklayın
4. Platform olarak **"Electron"** veya **"JavaScript"** seçin
5. Proje adı verin: `Guvenli Yukleyici`
6. **DSN (Data Source Name)** kopyalayın

DSN şu formatta olacak:
```
http://[key]@your-server-ip:8000/[project-id]
```

## 🔧 Production için Öneriler

### HTTPS Kurulumu (Nginx ile)

`nginx.conf` örneği:

```nginx
server {
    listen 80;
    server_name glitchtip.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL sertifikası için Let's Encrypt kullanın:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d glitchtip.yourdomain.com
```

### Email Ayarları

`.env` dosyasında SMTP ayarlarını yapın:

```bash
# Gmail örneği
EMAIL_URL=smtp://username:password@smtp.gmail.com:587/?tls=True

# veya diğer SMTP servisleri
EMAIL_URL=smtp://username:password@smtp.yourprovider.com:587/?tls=True
```

### Veritabanı Şifresi

Production'da mutlaka PostgreSQL şifresi kullanın:

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: your-strong-password
    POSTGRES_DB: glitchtip

web:
  environment:
    DATABASE_URL: postgresql://postgres:your-strong-password@postgres:5432/glitchtip
```

### Backup

Düzenli olarak veritabanı yedeği alın:

```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U postgres glitchtip > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U postgres glitchtip < backup_20260110.sql
```

## 📊 Güvenli Yükleyici Entegrasyonu

GlitchTip kurulumunuz tamamlandıktan sonra, uygulamanızda aşağıdaki değişiklikleri yapın:

### `src/main/services/sentry.js` dosyasını güncelleyin:

```javascript
// GLITCHTIP_DSN değişkenini kendi DSN'inizle değiştirin
const GLITCHTIP_DSN = 'http://[key]@your-server-ip:8000/[project-id]';
```

GlitchTip, Sentry SDK'sı ile %100 uyumlu olduğu için başka bir değişiklik gerekmez!

## 🔍 Test

Uygulamanızı çalıştırın ve bir hata oluşturun:

```javascript
// Test için main.js'e ekleyin
throw new Error('GlitchTip test error');
```

GlitchTip dashboard'unda hata görünmelidir.

## 📈 İzleme ve Yönetim

### Servis Durumunu Kontrol Etme

```bash
docker-compose ps
```

### Logları İzleme

```bash
# Tüm servislerin logları
docker-compose logs -f

# Sadece web servisinin logları
docker-compose logs -f web
```

### Servisleri Yeniden Başlatma

```bash
docker-compose restart
```

### Güncelleme

```bash
docker-compose pull
docker-compose up -d
```

## ⚙️ Gelişmiş Ayarlar

### Worker Sayısını Artırma

Çok sayıda hata alıyorsanız, worker sayısını artırın:

```yaml
worker:
  environment:
    CELERY_WORKER_AUTOSCALE: "3,6"  # min,max
```

### Redis Persistence

Redis verilerini kalıcı hale getirin:

```yaml
redis:
  command: redis-server --appendonly yes
  volumes:
    - redis-data:/data

volumes:
  redis-data:
```

## 🆘 Sorun Giderme

### Port 8000 kullanımda

Farklı bir port kullanın:

```yaml
web:
  ports:
    - "9000:8000"  # Dış:İç
```

### Migration hataları

```bash
docker-compose down
docker-compose run --rm migrate
docker-compose up -d
```

### Veritabanı bağlantı hatası

PostgreSQL'in hazır olmasını bekleyin:

```bash
docker-compose logs postgres
```

## 📚 Faydalı Linkler

- [GlitchTip Resmi Dokümantasyon](https://glitchtip.com/documentation)
- [GlitchTip GitHub](https://github.com/glitchtip/glitchtip)
- [Sentry SDK Dokümantasyonu](https://docs.sentry.io/platforms/javascript/guides/electron/)

## 💰 Maliyet

GlitchTip self-hosted tamamen **ücretsiz**tir. Sadece sunucu maliyetiniz vardır:

- VPS (2GB RAM): ~$5-10/ay
- veya kendi bilgisayarınızda Docker ile: **$0**

## ✅ Sonraki Adımlar

1. ✅ GlitchTip kuruldu
2. ✅ Proje oluşturuldu ve DSN alındı
3. ⬜ Güvenli Yükleyici'ye DSN eklendi
4. ⬜ Test hatası gönderildi
5. ⬜ Production'a alındı

Artık Güvenli Yükleyici uygulamanıza DSN'i ekleyerek GlitchTip entegrasyonunu tamamlayabilirsiniz!
