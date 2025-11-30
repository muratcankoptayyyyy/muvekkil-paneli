from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserType(str, enum.Enum):
    INDIVIDUAL = "individual"  # Bireysel müvekkil
    CORPORATE = "corporate"    # Kurumsal müvekkil
    ADMIN = "admin"            # Yönetici
    LAWYER = "lawyer"          # Avukat

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    tc_kimlik = Column(String, unique=True, nullable=True)  # Bireysel için
    tax_number = Column(String, unique=True, nullable=True)  # Kurumsal için
    company_name = Column(String, nullable=True)  # Kurumsal için
    
    # Contact & Bank Info
    address = Column(String, nullable=True)
    bank_account_info = Column(String, nullable=True)  # IBAN etc.
    
    user_type = Column(SQLEnum(UserType), nullable=False, default=UserType.INDIVIDUAL)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # 2FA
    totp_secret = Column(String, nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)
    
    # Password change requirement
    must_change_password = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    cases = relationship("Case", back_populates="client")
    documents = relationship("Document", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.email}>"
