from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import get_password_hash

def create_admin_koptay():
    db = SessionLocal()
    
    try:
        email = "muratcan@koptay.av.tr"
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"ℹ️  Kullanıcı bulundu: {user.full_name} ({user.user_type})")
            user.user_type = "admin"
            user.hashed_password = get_password_hash("admin123")
            print(f"✅ Kullanıcı yetkisi 'admin' olarak güncellendi.")
            print(f"✅ Şifre 'admin123' olarak güncellendi.")
        else:
            user = User(
                email=email,
                hashed_password=get_password_hash("admin123"),
                full_name="Murat Can Koptay",
                phone="0532 111 2233",
                tc_kimlik="16469655934",
                user_type="admin",
                is_active=True
            )
            db.add(user)
            print(f"✅ Yeni yönetici avukat oluşturuldu: {user.full_name}")

        db.commit()
        print("\n🔐 Giriş Bilgileri:")
        print("=" * 50)
        print(f"  Email: {email}")
        print("  Şifre: admin123")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_koptay()
