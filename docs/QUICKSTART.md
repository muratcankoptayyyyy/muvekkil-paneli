# Koptay Müvekkil Paneli - Hızlı Başlangıç

## ✅ Yapılanlar

### Backend:
- ✅ FastAPI uygulama yapısı
- ✅ SQLAlchemy modelleri (User, Case, Document, Task, Payment, Notification, Timeline)
- ✅ Pydantic schemas
- ✅ Authentication API (register, login, logout, me)
- ✅ Cases API (CRUD operations)
- ✅ JWT token based authentication
- ✅ Alembic migration yapılandırması
- ✅ Docker support

### Frontend:
- ✅ React + TypeScript + Vite yapısı
- ✅ Tailwind CSS
- ✅ React Query
- ✅ Zustand state management
- ✅ Axios API client
- ✅ TypeScript type definitions
- ✅ Router yapısı

## 🚀 İlk Kurulum

### 1. Backend Kurulumu

```powershell
# Backend klasörüne gidin
cd C:\Users\KOPTAY\Desktop\muvekkil-paneli\backend

# Python sanal ortamı oluşturun
python -m venv venv

# Sanal ortamı aktifleştirin
.\venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# .env dosyası oluşturun
copy .env.example .env
```

**.env dosyasını düzenleyin:**
```env
DATABASE_URL=postgresql://koptay_user:koptay_secure_password_2024@localhost:5432/muvekkil_panel
SECRET_KEY=your-very-secure-secret-key-min-32-characters-long-here
REDIS_URL=redis://localhost:6379/0
# ... diğer ayarlar
```

**PostgreSQL veritabanı oluşturun:**
```sql
CREATE DATABASE muvekkil_panel;
CREATE USER koptay_user WITH PASSWORD 'koptay_secure_password_2024';
GRANT ALL PRIVILEGES ON DATABASE muvekkil_panel TO koptay_user;
```

**Veritabanı migration:**
```powershell
# İlk migration oluşturun
alembic revision --autogenerate -m "Initial migration"

# Migration'ı uygulayın
alembic upgrade head
```

**Backend'i başlatın:**
```powershell
uvicorn main:app --reload
```

Backend şu adreste çalışacak: http://localhost:8000
API Docs: http://localhost:8000/docs

### 2. Frontend Kurulumu

```powershell
# Yeni terminal açın
cd C:\Users\KOPTAY\Desktop\muvekkil-paneli\frontend

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
copy .env.example .env

# Frontend'i başlatın
npm run dev
```

Frontend şu adreste çalışacak: http://localhost:5173

## 🐳 Docker ile Kurulum (Alternatif)

```powershell
# Ana dizinde
cd C:\Users\KOPTAY\Desktop\muvekkil-paneli

# Tüm servisleri başlat
docker-compose up -d

# Migration çalıştır
docker-compose exec backend alembic upgrade head
```

## 📝 Sıradaki Adımlar

### Kısa Vadede:
1. ✅ **Authentication sistemi test edilecek**
2. ✅ **Frontend sayfaları oluşturulacak** (LoginPage, DashboardPage, vb.)
3. **Documents API** eklenecek
4. **Payments API** eklenecek
5. **Notifications API** eklenecek

### Orta Vadede:
6. **Dosya yükleme servisi** (MinIO entegrasyonu)
7. **Email servisi** (SMTP)
8. **SMS servisi** (Netgsm)
9. **Payment gateway** (İyzico/PayTR)
10. **Push notifications** (Firebase)

### Uzun Vadede:
11. **Celery tasks** (async işlemler)
12. **Unit ve integration testler**
13. **Production deployment**
14. **Mobile app** (React Native)

## 🧪 Test Etme

### Backend API Test (curl ile):

**Register:**
```powershell
curl -X POST "http://localhost:8000/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User",
    "user_type": "individual"
  }'
```

**Login:**
```powershell
curl -X POST "http://localhost:8000/api/auth/login" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=test@example.com&password=SecurePass123"
```

**Get Current User:**
```powershell
curl -X GET "http://localhost:8000/api/auth/me" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Önemli Notlar

1. **SECRET_KEY**: Mutlaka güçlü bir secret key kullanın (production'da)
2. **Database**: PostgreSQL kurulu ve çalışır durumda olmalı
3. **Redis**: Celery için gerekli (şimdilik opsiyonel)
4. **CORS**: Frontend'in backend'e erişebilmesi için CORS ayarları yapıldı

## 🔧 Sorun Giderme

### "alembic command not found"
```powershell
pip install alembic
```

### "Import hatası"
```powershell
# Python path'i ekleyin
$env:PYTHONPATH = "C:\Users\KOPTAY\Desktop\muvekkil-paneli\backend"
```

### "Database connection error"
- PostgreSQL'in çalıştığından emin olun
- .env dosyasındaki DATABASE_URL'i kontrol edin

## 📚 Daha Fazla Bilgi

- Backend API Docs: http://localhost:8000/docs
- Architecture: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- Full Setup Guide: [docs/SETUP.md](../docs/SETUP.md)
