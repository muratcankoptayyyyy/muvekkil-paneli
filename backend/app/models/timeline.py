from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TimelineEventType(str, enum.Enum):
    HEARING = "HEARING"      # Duruşma
    REPORT = "REPORT"        # Bilirkişi Raporu
    DECISION = "DECISION"    # Karar (Ara karar, gerekçeli karar)
    PAYMENT = "PAYMENT"      # Ödeme
    DOCUMENT = "DOCUMENT"    # Evrak
    GENERIC = "GENERIC"      # Diğer

class TimelineEvent(Base):
    """Dava sürecindeki olayların kronolojik takibi için"""
    __tablename__ = "timeline_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    event_type = Column(SQLEnum(TimelineEventType), default=TimelineEventType.GENERIC, nullable=False)
    stage_id = Column(String, nullable=True) # Linked to a stage in Case.stages JSON
    
    event_date = Column(DateTime(timezone=True), nullable=False)
    
    # Foreign Keys
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Relationships
    case = relationship("Case", back_populates="timeline_events")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<TimelineEvent {self.title}>"
