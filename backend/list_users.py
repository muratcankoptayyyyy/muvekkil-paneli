#!/usr/bin/env python3
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
print("=" * 80)
print("TÜM KULLANICILAR")
print("=" * 80)
for u in users:
    print(f"ID: {u.id}")
    print(f"  Email: {u.email}")
    print(f"  Full Name: {u.full_name}")
    print(f"  TC Kimlik: {u.tc_kimlik}")
    print(f"  Tax Number: {u.tax_number}")
    print(f"  User Type: {u.user_type}")
    print(f"  Is Active: {u.is_active}")
    print("-" * 40)
db.close()
