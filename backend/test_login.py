"""Test login functionality"""
from app.core.security import verify_password
from app.models.user import User
from app.core.database import SessionLocal

db = SessionLocal()

# Test admin user
admin = db.query(User).filter(User.email == "admin@koptay.av.tr").first()
print(f"Admin user found: {admin is not None}")
if admin:
    print(f"Admin email: {admin.email}")
    print(f"Admin user_type: {admin.user_type}")
    print(f"Admin is_active: {admin.is_active}")
    print(f"Password hash starts with: {admin.hashed_password[:20]}...")
    pwd_check = verify_password("admin123", admin.hashed_password)
    print(f"Password 'admin123' verification: {pwd_check}")

print("\n" + "="*50)

# Test client user
client = db.query(User).filter(User.tc_kimlik == "16469655934").first()
print(f"Client user found: {client is not None}")
if client:
    print(f"Client TC: {client.tc_kimlik}")
    print(f"Client email: {client.email}")
    print(f"Client user_type: {client.user_type}")
    print(f"Client is_active: {client.is_active}")
    pwd_check = verify_password("123456", client.hashed_password)
    print(f"Password '123456' verification: {pwd_check}")

db.close()
