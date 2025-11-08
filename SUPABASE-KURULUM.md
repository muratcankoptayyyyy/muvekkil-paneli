# Supabase Manuel Kurulum Rehberi

## Sorun: SQL Editor "Failed to fetch" hatası veriyor

### Çözüm 1: Table Editor'dan Manuel Oluştur

1. Supabase Dashboard'a git: https://supabase.com/dashboard/project/octxkhlhhfinyiyoghza
2. Sol menüden **"Table Editor"** seç
3. **"Create a new table"** butonuna tıkla

#### Users Tablosu Ayarları:
- **Name:** `users`
- **Enable Row Level Security (RLS):** Şimdilik KAPALI bırak ✗

#### Kolonları Ekle (Add Column):

| Column Name      | Type                  | Default Value | Primary | Unique | Nullable |
|------------------|-----------------------|---------------|---------|--------|----------|
| id               | int8 (Serial)         | AUTO          | ✓       |        | ✗        |
| email            | text                  | NULL          |         | ✓      | ✓        |
| full_name        | text                  | NULL          |         |        | ✗        |
| hashed_password  | text                  | NULL          |         |        | ✗        |
| user_type        | text                  | 'individual'  |         |        | ✗        |
| phone            | text                  | NULL          |         |        | ✓        |
| tc_kimlik        | text (varchar 11)     | NULL          |         | ✓      | ✓        |
| tax_number       | text (varchar 10)     | NULL          |         | ✓      | ✓        |
| company_name     | text                  | NULL          |         |        | ✓        |
| is_active        | bool                  | true          |         |        | ✗        |
| is_verified      | bool                  | false         |         |        | ✗        |
| last_login       | timestamptz           | NULL          |         |        | ✓        |
| created_at       | timestamptz           | now()         |         |        | ✗        |
| updated_at       | timestamptz           | now()         |         |        | ✓        |

4. **Save** butonuna tıkla

---

### Çözüm 2: psql ile Bağlan (Terminal'den)

```powershell
# PostgreSQL connection string:
psql "postgresql://postgres.octxkhlhhfinyiyoghza:#Bq5_N)J&4_Ku7)@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

Bağlandıktan sonra SQL'leri çalıştır:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'individual',
    phone VARCHAR(20),
    tc_kimlik VARCHAR(11) UNIQUE,
    tax_number VARCHAR(10) UNIQUE,
    company_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (email, full_name, hashed_password, user_type, tc_kimlik, phone, is_active, is_verified) 
VALUES (
    'muratcan@koptay.av.tr', 
    'Murat Can Koptay', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBxVzFe1p2', 
    'individual', 
    '16469655934', 
    '0532 111 2233', 
    true, 
    true
);

\q  -- Çıkış
```

---

### Çözüm 3: Backend'den Oluştur

Backend'deki `create_demo_users.py` script'ini kullan:

```powershell
cd C:\Users\KOPTAY\Desktop\PROJELER\muvekkil-paneli\backend
..\..\.venv\Scripts\Activate.ps1
python create_demo_users.py
```

Bu script veritabanına bağlanıp tabloları ve kullanıcıları oluşturur.

---

## Giriş Bilgileri

**Site URL:** https://muvekkil-paneli-6d9wn7gkp-murat-can-koptays-projects.vercel.app

**Giriş:**
- TC Kimlik No: `16469655934`
- Şifre: `password123`

---

## Sorun Devam Ediyorsa

1. Supabase Dashboard → Settings → Database → Connection String'i kontrol et
2. Vercel'deki `DATABASE_URL` environment variable'ını kontrol et
3. Supabase'de RLS (Row Level Security) KAPALI olduğundan emin ol
