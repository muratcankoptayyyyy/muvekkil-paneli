from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class DocumentType(str, enum.Enum):
    CONTRACT = "contract"        # Sözleşme
    PETITION = "petition"        # Dilekçe
    DECISION = "decision"        # Karar
    EVIDENCE = "evidence"        # Delil
    CORRESPONDENCE = "correspondence"  # Yazışma
    INVOICE = "invoice"          # Fatura
    OTHER = "other"              # Diğer

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # MinIO path
    file_size = Column(Integer)  # bytes
    mime_type = Column(String)
    
    document_type = Column(SQLEnum(DocumentType), default=DocumentType.OTHER)
    description = Column(Text, nullable=True)
    
    is_visible_to_client = Column(Boolean, default=True)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    case = relationship("Case", back_populates="documents")
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Document {self.original_filename}>"
