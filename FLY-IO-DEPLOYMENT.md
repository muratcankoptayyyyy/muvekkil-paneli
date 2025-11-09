# Fly.io Deployment Rehberi

## 1. Fly.io CLI Kurulumu

```powershell
# Windows için
iwr https://fly.io/install.ps1 -useb | iex
```

## 2. Giriş Yap

```powershell
fly auth login
```

## 3. Uygulama Oluştur

```powershell
cd C:\Users\KOPTAY\Desktop\PROJELER\muvekkil-paneli
fly launch --name muvekkil-paneli --region fra
```

## 4. PostgreSQL Database Oluştur

```powershell
fly postgres create --name muvekkil-db --region fra
fly postgres attach muvekkil-db --app muvekkil-paneli
```

## 5. Environment Variables Ekle

```powershell
fly secrets set SECRET_KEY="your-secret-key-here"
```

## 6. Deploy Et

```powershell
fly deploy
```

## 7. Database'i Başlat

```powershell
fly ssh console
python backend/create_demo_users.py
exit
```

## Giriş Bilgileri

- TC: 16469655934
- Şifre: 123456

## Faydalı Komutlar

```powershell
fly status              # Uygulama durumu
fly logs               # Canlı loglar
fly ssh console        # SSH bağlantısı
fly open               # Uygulamayı aç
```
