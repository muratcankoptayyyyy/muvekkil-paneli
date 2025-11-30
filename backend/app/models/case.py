from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class CaseStatus(str, enum.Enum):
    PENDING = "pending"          # Beklemede
    IN_PROGRESS = "in_progress"  # Devam ediyor
    WAITING_COURT = "waiting_court"  # Mahkeme bekliyor
    COMPLETED = "completed"      # Tamamlandı
    ARCHIVED = "archived"        # Arşivlendi

class CaseType(str, enum.Enum):
    CIVIL = "civil"              # Hukuk
    CRIMINAL = "criminal"        # Ceza
    COMMERCIAL = "commercial"    # Ticaret
    LABOR = "labor"              # İş
    ADMINISTRATIVE = "administrative"  # İdare
    EXECUTION = "execution"      # İcra
    OTHER = "other"              # Diğer

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    case_type = Column(SQLEnum(CaseType), nullable=False)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.PENDING)
    
    court_name = Column(String, nullable=True)
    file_number = Column(String, nullable=True)
    
    # Stages configuration for this case
    stages = Column(JSON, nullable=True)
    
    # Client (User)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client = relationship("User", back_populates="cases")
    
    # Dates
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    next_hearing_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="case")
    tasks = relationship("Task", back_populates="case")
    timeline_events = relationship("TimelineEvent", back_populates="case")
    
    def __repr__(self):
        return f"<Case {self.case_number}>"
