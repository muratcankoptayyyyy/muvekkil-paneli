from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"      # Beklemede
    COMPLETED = "completed"  # Tamamlandı
    FAILED = "failed"        # Başarısız
    REFUNDED = "refunded"    # İade edildi

class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True)  # External payment ID (İyzico, etc.)
    
    amount = Column(Float, nullable=False)
    currency = Column(String, default="TRY")
    description = Column(Text)
    
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    method = Column(SQLEnum(PaymentMethod), nullable=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    
    # Payment provider details
    provider_response = Column(Text, nullable=True)  # JSON response from payment provider
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Payment {self.payment_id}>"
