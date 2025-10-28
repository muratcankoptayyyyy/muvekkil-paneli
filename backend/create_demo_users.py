"""
Demo kullanıcıları oluştur
"""
from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import get_password_hash

def create_demo_users():
    db = SessionLocal()
    
    try:
        # Admin kullanıcısı kontrolü
        admin = db.query(User).filter(User.email == "admin@koptay.av.tr").first()
        if not admin:
            admin = User(
                email="admin@koptay.av.tr",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin Kullanıcı",
                phone="0532 123 4567",
                user_type="admin",
                is_active=True
            )
            db.add(admin)
            print("✅ Admin kullanıcısı oluşturuldu")
            print("   Email: admin@koptay.av.tr")
            print("   Şifre: admin123")
        else:
            print("ℹ️  Admin kullanıcısı zaten mevcut")
        
        # Demo bireysel müşteri
        individual = db.query(User).filter(User.tc_kimlik == "12345678901").first()
        if not individual:
            individual = User(
                email="ahmet@example.com",
                hashed_password=get_password_hash("123456"),
                full_name="Ahmet Yılmaz",
                phone="0532 111 2233",
                tc_kimlik="12345678901",
                user_type="individual",
                is_active=True
            )
            db.add(individual)
            print("✅ Bireysel müşteri oluşturuldu")
            print("   TC Kimlik: 12345678901")
            print("   Şifre: 123456")
        else:
            print("ℹ️  Bireysel müşteri zaten mevcut")
        
        # Demo kurumsal müşteri
        corporate = db.query(User).filter(User.tax_number == "1234567890").first()
        if not corporate:
            corporate = User(
                email="info@ornek.com",
                hashed_password=get_password_hash("123456"),
                full_name="Mehmet Demir",
                phone="0532 444 5566",
                tax_number="1234567890",
                company_name="Örnek A.Ş.",
                user_type="corporate",
                is_active=True
            )
            db.add(corporate)
            print("✅ Kurumsal müşteri oluşturuldu")
            print("   Vergi Kimlik: 1234567890")
            print("   Şifre: 123456")
        else:
            print("ℹ️  Kurumsal müşteri zaten mevcut")
        
        db.commit()
        print("\n✨ Demo kullanıcılar hazır!")
        print("\n🔐 Giriş Bilgileri:")
        print("=" * 50)
        print("ADMIN:")
        print("  Kullanıcı Adı: admin (özel admin girişi)")
        print("  Şifre: admin123")
        print("\nBİREYSEL MÜŞTERİ:")
        print("  Kullanıcı Adı: 12345678901")
        print("  Şifre: 123456")
        print("\nKURUMSAL MÜŞTERİ:")
        print("  Kullanıcı Adı: 1234567890")
        print("  Şifre: 123456")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_users()
