from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    """Tüm sistemdeki kritik işlemlerin kaydını tutar"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Kim yaptı
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")
    
    # Ne yapıldı
    action = Column(String, nullable=False)  # CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, UPLOAD
    resource_type = Column(String, nullable=False)  # CASE, DOCUMENT, PAYMENT, USER
    resource_id = Column(Integer, nullable=True)  # İlgili kaydın ID'si
    
    # Detaylar
    description = Column(Text)  # İnsan okunabilir açıklama
    changes = Column(JSON, nullable=True)  # Yapılan değişikliklerin JSON'u
    
    # Metadata
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Zaman damgası
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog {self.action} on {self.resource_type}#{self.resource_id}>"
