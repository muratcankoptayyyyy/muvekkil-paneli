from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TaskStatus(str, enum.Enum):
    TODO = "todo"                # Yapılacak
    IN_PROGRESS = "in_progress"  # Devam ediyor
    COMPLETED = "completed"      # Tamamlandı
    CANCELLED = "cancelled"      # İptal

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM)
    
    is_visible_to_client = Column(Boolean, default=True)
    
    # Foreign Keys
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    
    # Relationships
    case = relationship("Case", back_populates="tasks")
    
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Task {self.title}>"
