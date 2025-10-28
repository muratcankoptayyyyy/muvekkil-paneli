# 🆓 Tamamen Ücretsiz Deployment Rehberi
## Railway + Vercel + Supabase Kombinasyonu

### 🎯 Neden Bu Kombinasyon?

| Platform | Ücretsiz Limit | Dosya Depolama | Ödeme API |
|----------|----------------|----------------|-----------|
| **Railway** | 500 saat/ay + $5 kredi | ✅ Volume mount | ✅ API desteği |
| **Vercel** | Unlimited frontend | ❌ Static only | ✅ API routes |
| **Supabase** | 500MB database + 1GB storage | ✅ 1GB dosya | ✅ Edge functions |

### 📊 200 Aktif Kullanıcı için Yeterlilik

- **Railway**: 500 saat = sürekli çalışabilir (30*24=720 saat ama $5 kredi ile fazlası kapanır)
- **Supabase**: 1GB dosya depolama (200 kullanıcı için başlangıçta yeterli)
- **Vercel**: Unlimited (frontend için mükemmel)

---

## 🚀 Adım Adım Kurulum

### 1. Supabase Setup (Database + Storage)

#### Hesap Oluşturma:
1. https://supabase.com/dashboard
2. "New Project" → Organization oluşturun
3. Database password belirleyin
4. Region: "Southeast Asia" (Türkiye'ye en yakın)

#### Storage Bucket Oluşturma:
```sql
-- Supabase SQL Editor'da çalıştırın
-- Documents bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policy (authenticated users only)
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'documents');

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'documents');
```

#### Database Schema:
Supabase otomatik olarak auth tabloları oluşturur. Ek tablolarımızı ekleyelim:

```sql
-- Cases table
CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    case_number VARCHAR(50) UNIQUE,
    case_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    priority VARCHAR(10) DEFAULT 'medium',
    client_id UUID REFERENCES auth.users(id),
    lawyer_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    file_path VARCHAR(500),
    case_id UUID REFERENCES cases(id),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    case_id UUID REFERENCES cases(id),
    client_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) aktifleştir
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cases" ON cases
FOR ALL USING (client_id = auth.uid() OR lawyer_id = auth.uid());

CREATE POLICY "Users can view own documents" ON documents
FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "Users can view own payments" ON payments
FOR ALL USING (client_id = auth.uid());
```

### 2. Railway Setup (Backend API)

#### Hesap Oluşturma:
1. https://railway.app/
2. GitHub ile giriş yapın
3. "New Project" → "Deploy from GitHub repo"

#### Project Ayarları:
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Environment Variables (Railway):
```env
# Supabase bağlantısı
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Security
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
DEBUG=False

# CORS
CORS_ORIGINS=["https://your-app.vercel.app"]

# File Storage (Supabase Storage)
STORAGE_PROVIDER=supabase
SUPABASE_BUCKET_NAME=documents

# Payment (İyzico Test)
IYZICO_API_KEY=your-test-api-key
IYZICO_SECRET_KEY=your-test-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### 3. Vercel Setup (Frontend)

#### Deployment:
1. https://vercel.com/new
2. GitHub repo'nuzu seçin
3. Root Directory: `frontend`
4. Build Settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Environment Variables (Vercel):
```env
VITE_API_URL=https://your-app.railway.app
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💾 Dosya Yükleme Sistemi (Supabase Storage)

### Backend'de Supabase Storage entegrasyonu:

```python
# backend/app/services/storage.py
from supabase import create_client, Client
from app.core.config import settings
import uuid
from typing import Optional

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    
    async def upload_document(self, file_content: bytes, filename: str, case_id: str) -> str:
        """Dosyayı Supabase Storage'a yükle"""
        file_path = f"cases/{case_id}/{uuid.uuid4()}_{filename}"
        
        result = self.supabase.storage.from_("documents").upload(
            file_path, file_content
        )
        
        if result.error:
            raise Exception(f"Upload failed: {result.error}")
            
        return file_path
    
    def get_download_url(self, file_path: str) -> str:
        """Dosya indirme URL'i oluştur"""
        result = self.supabase.storage.from_("documents").create_signed_url(
            file_path, 3600  # 1 saat geçerli
        )
        return result.get('signedURL')
    
    def delete_document(self, file_path: str) -> bool:
        """Dosyayı sil"""
        result = self.supabase.storage.from_("documents").remove([file_path])
        return not result.error

# Kullanım örneği
storage_service = StorageService()
```

### Dosya Upload API:

```python
# backend/app/api/endpoints/documents.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.storage import StorageService
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()
storage_service = StorageService()

@router.post("/upload")
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Dosya boyutu kontrolü (10MB limit)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(400, "Dosya boyutu 10MB'dan büyük olamaz")
    
    # Dosya türü kontrolü
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "application/msword"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "Desteklenmeyen dosya türü")
    
    try:
        content = await file.read()
        file_path = await storage_service.upload_document(
            content, file.filename, case_id
        )
        
        # Database'e kaydet
        # ... document record creation
        
        return {"message": "Dosya başarıyla yüklendi", "file_path": file_path}
        
    except Exception as e:
        raise HTTPException(500, f"Upload hatası: {str(e)}")

@router.get("/download/{document_id}")
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    # Database'den dosya bilgisini al
    # ... get document record
    
    download_url = storage_service.get_download_url(file_path)
    return {"download_url": download_url}
```

---

## 💳 Ödeme Sistemi (İyzico Test)

### İyzico Test Entegrasyonu:

```python
# backend/app/services/payment.py
import iyzipay
from app.core.config import settings

class PaymentService:
    def __init__(self):
        self.options = {
            'api_key': settings.IYZICO_API_KEY,
            'secret_key': settings.IYZICO_SECRET_KEY,
            'base_url': settings.IYZICO_BASE_URL
        }
    
    def create_payment(self, amount: float, case_id: str, user_data: dict):
        request = {
            'locale': iyzipay.Locale.TR.value,
            'conversationId': case_id,
            'price': str(amount),
            'paidPrice': str(amount),
            'currency': iyzipay.Currency.TRY.value,
            'installment': '1',
            'basketId': f'B{case_id}',
            'paymentChannel': iyzipay.PaymentChannel.WEB.value,
            'paymentGroup': iyzipay.PaymentGroup.PRODUCT.value,
            'paymentCard': {
                # Test kartı bilgileri frontend'den gelecek
                'cardHolderName': user_data['card_holder'],
                'cardNumber': user_data['card_number'],
                'expireMonth': user_data['expire_month'],
                'expireYear': user_data['expire_year'],
                'cvc': user_data['cvc']
            },
            'buyer': {
                'id': user_data['user_id'],
                'name': user_data['name'],
                'surname': user_data['surname'],
                'email': user_data['email'],
                'identityNumber': '11111111111',  # Test için
                'registrationAddress': 'İstanbul',
                'city': 'İstanbul',
                'country': 'Turkey'
            },
            'basketItems': [{
                'id': f'BI{case_id}',
                'name': 'Hukuki Danışmanlık',
                'category1': 'Hukuk',
                'itemType': iyzipay.BasketItemType.VIRTUAL.value,
                'price': str(amount)
            }]
        }
        
        payment = iyzipay.Payment().create(request, self.options)
        return payment
```

### Test Kredi Kartı Bilgileri:
```
Kart Numarası: 5528790000000008
CVV: 123
Son Kullanma: 12/2030
Kart Sahibi: Test User
```

---

## 📊 Maliyet ve Limit Analizi

### Railway Limitleri:
- ✅ 500 saat/ay (sürekli çalışabilir)
- ✅ $5 kredi (fazla kullanım için)
- ✅ 1GB RAM
- ✅ 1GB disk

### Supabase Limitleri:
- ✅ 500MB PostgreSQL
- ✅ 1GB Storage
- ✅ 2 milyon Edge Function çağrısı
- ✅ 50MB veritabanı boyutu

### Vercel Limitleri:
- ✅ Unlimited build
- ✅ 100GB bandwidth
- ✅ Unlimited domain

### 200 Kullanıcı Senaryosu:
- **Dosya depolama**: Kullanıcı başına 5MB = 1GB (✅ yeterli)
- **Database**: Kullanıcı başına 250KB = 50MB (✅ yeterli)
- **API çağrıları**: Aylık ~100K çağrı (✅ yeterli)

---

## 🔄 Alternatif Plan (Eğer limitler aşılırsa)

### 1. Astra DB (DataStax) - Ücretsiz
- 5GB database
- Ücretsiz forever

### 2. PlanetScale - Ücretsiz Tier
- 1GB database
- 1 milyar read/month

### 3. Cloudflare R2 - Storage
- 10GB ücretsiz
- Çıkış trafiği ücretsiz

---

## ✅ Deployment Checklist

### Hazırlık:
- [ ] GitHub repo oluşturuldu
- [ ] Supabase project kuruldu
- [ ] Railway hesabı açıldı
- [ ] Vercel hesabı açıldı

### Backend (Railway):
- [ ] Environment variables ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] File upload test edildi
- [ ] Payment test edildi

### Frontend (Vercel):
- [ ] Build başarılı
- [ ] Environment variables ayarlandı
- [ ] API bağlantısı test edildi

### Test:
- [ ] Kullanıcı kayıt/giriş
- [ ] Dosya yükleme/indirme
- [ ] Ödeme işlemi (test kartı ile)
- [ ] Mobil uyumluluk

---

## 🎉 Go Live!

Bu kombinasyonla projeniz **tamamen ücretsiz** olarak yayınlanabilir ve 200 aktif kullanıcıya kadar rahatça hizmet verebilir!

**Başlamaya hazır mısınız?** 🚀