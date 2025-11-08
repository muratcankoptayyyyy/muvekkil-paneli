# Vercel Postgres Kurulum Rehberi

## Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/murat-can-koptays-projects/muvekkil-paneli adresine git
2. Üst menüden **"Storage"** sekmesine tıkla
3. **"Create Database"** butonuna tıkla
4. **"Postgres"** seç
5. Database ismi: `muvekkil-db` (ya da istediğin isim)
6. Region: **Singapore** (ap-southeast-1) seç (Supabase ile aynı region)
7. **"Create"** butonuna tıkla

## Adım 2: Database'e Bağlan

Database oluşturulduktan sonra:
1. **".env.local"** sekmesine tıkla
2. Tüm environment variable'ları otomatik olarak Vercel projenize ekler

## Adım 3: SQL Çalıştır

1. Storage → muvekkil-db → **"Data"** sekmesi
2. **"Query"** butonuna tıkla
3. Aşağıdaki SQL'i yapıştır:

```sql
-- Kullanıcı tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    user_type TEXT DEFAULT 'individual',
    phone TEXT,
    tc_kimlik TEXT UNIQUE,
    tax_number TEXT UNIQUE,
    company_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Senin kullanıcın
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
```

4. **"Run Query"** butonuna tıkla

## Adım 4: Deploy Et

Terminal'de:
```bash
vercel --prod
```

## Adım 5: Giriş Yap!

- TC Kimlik No: `16469655934`
- Şifre: `password123`

✅ Hazır!
