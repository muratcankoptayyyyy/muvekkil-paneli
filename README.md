# Koptay Müvekkil Paneli

Bireysel ve kurumsal müvekkiller için kapsamlı avukatlık dosya takip ve yönetim sistemi.

## 🎯 Özellikler

### Bireysel Müvekkiller İçin:
- 📄 Dosya ve evrak görüntüleme
- 📊 Dava süreci takibi (şematik görünüm)
- ✅ Yapılan ve yapılacak işler listesi
- 🔔 Bildirim sistemi (Email, SMS, Push)
- 💳 Online ödeme yapma

### Kurumsal Müvekkiller İçin:
- 📁 Çoklu dosya yönetimi
- 📈 Uyuşmazlık takibi ve raporlama
- 👥 Çoklu kullanıcı yetkilendirmesi
- 📊 Detaylı analitik ve raporlar
- 🔄 Toplu işlem yapabilme

## 🛠️ Teknoloji Yığını

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication
- Celery + Redis (Async tasks)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Zustand

### Diğer Servisler
- MinIO / AWS S3 (Dosya depolama)
- İyzico / PayTR (Ödeme)
- Firebase (Push notifications)
- SMTP (Email)

## 📁 Proje Yapısı

```
muvekkil-paneli/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docker/           # Docker yapılandırmaları
├── docs/             # Dokümantasyon
└── scripts/          # Yardımcı scriptler
```

## 🚀 Kurulum

(Kurulum adımları eklenecek)

## 📝 Lisans

Tüm hakları saklıdır - Koptay Hukuk Bürosu
