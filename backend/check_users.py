from app.core.database import SessionLocal
from app.models.user import User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f'ID={u.id} Email={u.email} TC={u.tc_kimlik} Type={u.user_type} Active={u.is_active}')
db.close()
