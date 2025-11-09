from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Koptay Müvekkil Paneli"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    DATABASE_URL: str
    
    @property
    def database_url(self) -> str:
        """Fix postgres:// to postgresql:// for SQLAlchemy 2.0"""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url
    
    # Supabase (for free deployment)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    
    # Redis (optional for free tier)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MinIO/S3 (for paid deployment)
    MINIO_ENDPOINT: str = ""
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET_NAME: str = "muvekkil-documents"
    MINIO_SECURE: bool = False
    
    # Storage Provider Selection
    STORAGE_PROVIDER: str = "supabase"  # "supabase" or "minio"
    SUPABASE_BUCKET_NAME: str = "documents"
    
    # Email (optional for free tier)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    
    # SMS (optional for free tier)
    SMS_PROVIDER: str = "netgsm"
    NETGSM_USERNAME: str = ""
    NETGSM_PASSWORD: str = ""
    
    # Payment (İyzico - test mode for free)
    IYZICO_API_KEY: str = ""
    IYZICO_SECRET_KEY: str = ""
    IYZICO_BASE_URL: str = "https://sandbox-api.iyzipay.com"  # Test environment
    
    # Firebase (optional)
    FIREBASE_CREDENTIALS_PATH: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.railway.app",
        "https://*.fly.dev",
        "https://muvekkil-frontend.fly.dev"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
