import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    user_type = Column(String, default="individual")
    phone = Column(String)
    tc_kimlik = Column(String, unique=True)
    tax_number = Column(String, unique=True)
    company_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime)

# Schemas
class UserResponse(BaseModel):
    id: int
    email: str | None = None
    full_name: str
    user_type: str
    tc_kimlik: str | None = None
    is_active: bool
    
    class Config:
        from_attributes = True
        orm_mode = True

# App
app = FastAPI(title="Koptay Müvekkil Paneli API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# Routes
@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # TC Kimlik veya Vergi No ile kullanıcı ara
    user = db.query(User).filter(
        (User.tc_kimlik == form_data.username) | (User.tax_number == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="TC Kimlik No veya şifre hatalı"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hesap aktif değil")
    
    access_token = create_access_token(data={"sub": user.email})
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type,
            "tc_kimlik": user.tc_kimlik,
            "is_active": user.is_active
        }
    }

@app.get("/")
def root():
    return {"message": "Koptay Müvekkil Paneli API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/test-db")
def test_db():
    try:
        db = SessionLocal()
        result = db.execute("SELECT 1")
        db.close()
        return {"status": "Database connected!", "database_url_set": bool(os.getenv("DATABASE_URL"))}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e), "database_url_set": bool(os.getenv("DATABASE_URL"))}

# Vercel handler
handler = Mangum(app)