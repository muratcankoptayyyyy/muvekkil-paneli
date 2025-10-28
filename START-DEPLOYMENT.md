# 🚀 Deployment Başlangıç Scripti

## 1. GitHub'a Upload

```powershell
# Ana dizine gidin
cd C:\Users\KOPTAY\Desktop\PROJELER\muvekkil-paneli

# Git repo başlatın (eğer yoksa)
git init

# .gitignore oluşturun
echo "node_modules/
__pycache__/
.env
.env.local
.env.production
.venv/
venv/
*.pyc
.DS_Store
dist/
.vercel
.railway" > .gitignore

# Tüm dosyaları ekleyin
git add .

# İlk commit
git commit -m "Initial commit - Koptay Müvekkil Paneli"

# GitHub'da repo oluşturun: https://github.com/new
# Repo adı: muvekkil-paneli

# Remote ekleyin (KULLANICI_ADINIZI değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/muvekkil-paneli.git

# Push yapın
git branch -M main
git push -u origin main
```

## 2. Supabase Project Kurulumu

### a) Supabase'e kaydolun:
- https://supabase.com/dashboard
- "New project" tıklayın
- Project name: `koptay-muvekkil-paneli`
- Database password: güçlü bir şifre
- Region: `Southeast Asia (Singapore)` - en yakın

### b) Database şemasını oluşturun:
Supabase SQL Editor'da aşağıdaki kodu çalıştırın:

```sql
-- Users profile table (auth.users'ı extend eder)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    user_type VARCHAR(20) CHECK (user_type IN ('individual', 'corporate')) DEFAULT 'individual',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    identity_number VARCHAR(11),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    case_number VARCHAR(50) UNIQUE,
    case_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending', 'archived')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
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
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    iyzico_payment_id VARCHAR(100),
    case_id UUID REFERENCES cases(id),
    client_id UUID REFERENCES auth.users(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id),
    case_id UUID REFERENCES cases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Row Level Security (RLS) aktifleştir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles
CREATE POLICY "Users can view own profile" ON user_profiles
FOR ALL USING (auth.uid() = id);

-- Cases
CREATE POLICY "Users can view own cases" ON cases
FOR ALL USING (client_id = auth.uid() OR lawyer_id = auth.uid());

-- Documents
CREATE POLICY "Users can view case documents" ON documents
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM cases 
        WHERE cases.id = documents.case_id 
        AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
);

CREATE POLICY "Users can upload documents to own cases" ON documents
FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM cases 
        WHERE cases.id = documents.case_id 
        AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
);

-- Payments
CREATE POLICY "Users can view own payments" ON payments
FOR ALL USING (client_id = auth.uid());

-- Tasks
CREATE POLICY "Users can view case tasks" ON tasks
FOR ALL USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM cases 
        WHERE cases.id = tasks.case_id 
        AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications
FOR ALL USING (user_id = auth.uid());

-- Timeline events
CREATE POLICY "Users can view case timeline" ON timeline_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM cases 
        WHERE cases.id = timeline_events.case_id 
        AND (cases.client_id = auth.uid() OR cases.lawyer_id = auth.uid())
    )
);

-- Storage policies
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'documents'
);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    bucket_id = 'documents'
);

CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    bucket_id = 'documents'
);

-- Trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON cases 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### c) API Keys'leri alın:
- Settings > API > Copy:
  - Project URL
  - Anon key
  - Service role key (secret!)

## 3. Railway Setup (Backend)

### a) Railway'e kaydolun:
- https://railway.app/
- GitHub ile giriş yapın

### b) PostgreSQL Database:
- "New Project" > "Provision PostgreSQL"
- Database name: `muvekkil-panel-db`
- Ücretsiz plan seçin
- Connection string'i kaydedin

### c) Web Service:
- "New Service" > "GitHub Repo"
- `muvekkil-paneli` repo'nuzu seçin
- Root Directory: `backend`
- Environment Variables ekleyin:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Security
SECRET_KEY=your-super-secret-key-minimum-32-characters-long-here
DEBUG=False

# CORS (Vercel domain'inizi ekleyin)
CORS_ORIGINS=["https://your-app-name.vercel.app"]

# Storage
STORAGE_PROVIDER=supabase
SUPABASE_BUCKET_NAME=documents

# Payment (İyzico Test)
IYZICO_API_KEY=sandbox-api-key
IYZICO_SECRET_KEY=sandbox-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## 4. Vercel Setup (Frontend)

### a) Vercel'e kaydolun:
- https://vercel.com/
- GitHub ile giriş yapın

### b) Project oluşturun:
- "New Project"
- `muvekkil-paneli` repo'nuzu seçin
- Framework: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### c) Environment Variables:
```env
VITE_API_URL=https://your-backend-name.railway.app
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Koptay Müvekkil Paneli
```

## 5. İyzico Test Hesabı

### a) Test hesabı açın:
- https://sandbox-merchant.iyzipay.com/auth/register
- Test environment için kayıt olun

### b) API Keys alın:
- Dashboard > Settings > API Keys
- API Key ve Secret Key'i Railway environment variables'a ekleyin

### c) Test kartları:
```
Başarılı ödeme:
Kart: 5528790000000008
CVV: 123
Tarih: 12/2030

Yetersiz bakiye:
Kart: 5406670000000009
CVV: 123
Tarih: 12/2030
```

## 6. Domain Ayarları (Opsiyonel)

### Vercel:
- Settings > Domains > Add Domain
- DNS'de CNAME kaydı: your-domain.com → cname.vercel-dns.com

### Railway:
- Settings > Environment > Custom Domain
- DNS'de A kaydı: api.your-domain.com → Railway IP

## 7. Test Checklist

- [ ] Frontend açılıyor mu?
- [ ] Backend API'ye erişim var mı?
- [ ] Kullanıcı kayıt olabiliyor mu?
- [ ] Login çalışıyor mu?
- [ ] Dosya yükleme çalışıyor mu?
- [ ] Test kartı ile ödeme yapılabiliyor mu?

## 8. Go Live! 🎉

Tüm adımlar tamamlandığında projeniz tamamen ücretsiz olarak yayında olacak!

**Sonraki adımlar:**
1. İçerik ve tasarım iyileştirmeleri
2. Gerçek ödeme sistemine geçiş
3. Domain satın alma
4. SSL sertifikası (otomatik)
5. Google Analytics ekleme

**Maliyet:** 
- 200 kullanıcıya kadar: **₺0/ay**
- Büyüdükçe: Railway Pro $5/ay, Vercel Pro $20/ay

Başlamaya hazır mısınız? 🚀