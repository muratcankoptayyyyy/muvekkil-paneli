# Koptay Müvekkil Paneli - Kurulum Rehberi

## Gereksinimler

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (opsiyonel)

## Hızlı Başlangıç (Docker ile)

### 1. Repository'yi klonlayın
```bash
git clone <repository-url>
cd muvekkil-paneli
```

### 2. Environment değişkenlerini ayarlayın

Backend için:
```bash
cd backend
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değerleri doldurun
```

Frontend için:
```bash
cd ../frontend
cp .env.example .env
```

### 3. Docker ile başlatın
```bash
# Ana dizinde
docker-compose up -d
```

Bu komut şunları başlatacak:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (port 9000, 9001)
- Backend API (port 8000)
- Frontend (port 5173)
- Celery Worker

### 4. Veritabanı migrasyonlarını çalıştırın
```bash
docker-compose exec backend alembic upgrade head
```

### 5. Uygulamaya erişin
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001

## Manuel Kurulum (Docker olmadan)

### Backend Kurulumu

1. PostgreSQL'i yükleyin ve veritabanı oluşturun:
```sql
CREATE DATABASE muvekkil_panel;
CREATE USER koptay_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE muvekkil_panel TO koptay_user;
```

2. Redis'i yükleyin ve başlatın

3. Python sanal ortamı oluşturun:
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

4. Bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

5. .env dosyasını düzenleyin

6. Veritabanı migrasyonlarını çalıştırın:
```bash
alembic upgrade head
```

7. Backend'i başlatın:
```bash
uvicorn main:app --reload
```

### Frontend Kurulumu

1. Node.js bağımlılıklarını yükleyin:
```bash
cd frontend
npm install
```

2. .env dosyasını düzenleyin

3. Frontend'i başlatın:
```bash
npm run dev
```

## Celery Worker'ı Başlatma

Arka plan görevleri için (email, SMS, bildirimler):

```bash
cd backend
celery -A app.celery_app worker --loglevel=info
```

## Üretim Deployment

### Backend (Uvicorn + Gunicorn)
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Build)
```bash
cd frontend
npm run build
# dist/ klasörünü Nginx veya başka bir web server'a deploy edin
```

## İlk Kullanıcı Oluşturma

API üzerinden bir admin kullanıcısı oluşturmak için:

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@koptay.av.tr",
    "password": "SecurePassword123!",
    "full_name": "Admin User",
    "user_type": "admin"
  }'
```

## Test Etme

Backend testleri:
```bash
cd backend
pytest
```

## Sorun Giderme

### Port zaten kullanımda hatası
- PostgreSQL: 5432 portunu kontrol edin
- Backend: 8000 portunu kontrol edin
- Frontend: 5173 portunu kontrol edin

### Veritabanı bağlantı hatası
- PostgreSQL'in çalıştığını kontrol edin
- .env dosyasındaki DATABASE_URL'i kontrol edin

### MinIO bağlantı hatası
- MinIO'nun çalıştığını kontrol edin: http://localhost:9001
- Credentials'ları kontrol edin

## Daha Fazla Bilgi

- API Dokümantasyonu: http://localhost:8000/docs
- Proje Yapısı: /docs/architecture.md
- Katkıda Bulunma: /docs/contributing.md
