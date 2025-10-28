# 🚀 Koptay Müvekkil Paneli - Deployment Rehberi

## Vercel + Render ile Ücretsiz Deployment

### 1. Hazırlık

#### Frontend için gerekli dosyalar:
```json
// package.json - build script kontrolü
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### Backend için Production ayarları:
```python
# backend/app/core/config.py - Production modifikasyonu gerekli
```

### 2. Frontend Deployment (Vercel)

#### Adım 1: Vercel hesabı oluşturun
- https://vercel.com/signup
- GitHub ile giriş yapın

#### Adım 2: GitHub'a push yapın
```powershell
cd C:\Users\KOPTAY\Desktop\PROJELER\muvekkil-paneli

# Git repo oluşturun (eğer yoksa)
git init
git add .
git commit -m "Initial commit"

# GitHub'da repo oluşturun ve push yapın
git remote add origin https://github.com/KULLANICI_ADINIZ/muvekkil-paneli.git
git branch -M main
git push -u origin main
```

#### Adım 3: Vercel'de deploy edin
1. Vercel dashboard'da "New Project"
2. GitHub repo'nuzu seçin
3. Build ayarları:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Adım 4: Environment Variables
```env
VITE_API_URL=https://YOUR_BACKEND_URL.onrender.com
```

### 3. Backend Deployment (Render)

#### Adım 1: Render hesabı oluşturun
- https://render.com/register
- GitHub ile giriş yapın

#### Adım 2: PostgreSQL Database oluşturun
1. Render dashboard'da "New PostgreSQL"
2. Database adı: `muvekkil-panel-db`
3. **Ücretsiz tier** seçin
4. Database URL'ini kaydedin

#### Adım 3: Web Service oluşturun
1. "New Web Service"
2. GitHub repo'nuzu bağlayın
3. Ayarlar:
   - **Name**: `muvekkil-panel-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Adım 4: Environment Variables
```env
DATABASE_URL=postgresql://username:password@hostname:port/database
SECRET_KEY=your-very-secure-secret-key-minimum-32-characters
DEBUG=False
CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

### 4. Database Migration

Render'da deploy edildikten sonra:
```bash
# Render shell'de çalıştırın
alembic upgrade head

# Demo user oluşturun
python create_demo_users.py
```

### 5. Domain Ayarları (Opsiyonel)

#### Custom Domain
1. **Vercel**: Settings > Domains > Add domain
2. **Render**: Settings > Custom Domains > Add domain

#### DNS Ayarları
- A record: Render IP'si
- CNAME: Vercel domain'i

## 🔧 Production Optimizasyonları

### Frontend (Vercel)
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### Backend (Render)
```python
# requirements.txt - Production dependencies
fastapi[all]==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
# ... diğer bağımlılıklar
```

```python
# main.py - Production ayarları
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )
```

## 💰 Maliyet Hesabı

### Ücretsiz Tier Limitleri:
- **Vercel**: 100GB bandwidth/ay
- **Render**: 750 saat/ay (sürekli çalışabilir)
- **PostgreSQL**: 1GB storage, 1 milyon row

### Ücretli Geçiş:
- **Vercel Pro**: $20/ay (unlimited bandwidth)
- **Render Standard**: $7/ay (daha fazla kaynak)
- **PostgreSQL Standard**: $7/ay (4GB storage)

## 🔒 Güvenlik Notları

1. **SECRET_KEY**: Production'da mutlaka değiştirin
2. **CORS**: Sadece domain'lerinizi ekleyin
3. **Database**: SSL connection kullanın
4. **API Keys**: Environment variables'da saklayın

## 📊 Monitoring

### Logs
- **Vercel**: Function logs
- **Render**: Service logs
- **Render DB**: Query logs

### Performance
- **Vercel Analytics**: Ücretsiz
- **Render Metrics**: Resource kullanımı

## 🚀 Go Live Checklist

- [ ] GitHub'a kod push edildi
- [ ] Vercel'de frontend deploy edildi
- [ ] Render'da backend deploy edildi
- [ ] PostgreSQL database oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Database migration çalıştırıldı
- [ ] Demo user oluşturuldu
- [ ] CORS ayarları yapıldı
- [ ] Custom domain bağlandı (opsiyonel)
- [ ] SSL certificate aktif
- [ ] Test kullanıcısı ile giriş test edildi

## 🆘 Troubleshooting

### "Build failed" hatası
```bash
# Vercel logs kontrol edin
vercel logs

# Local'de build test edin
cd frontend
npm run build
```

### "Database connection error"
```python
# Render logs kontrol edin
# DATABASE_URL formatını doğrulayın
# SSL ayarlarını kontrol edin
```

### "CORS error"
```python
# backend/main.py - CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Platform documentation'larını kontrol edin
2. Logs'ları inceleyin  
3. Community forumlarına sorun

---

**Başarılar! 🎉**