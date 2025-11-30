from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.timeline import TimelineEventType

class TimelineEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    event_type: TimelineEventType = TimelineEventType.GENERIC
    stage_id: Optional[str] = None

class TimelineEventCreate(TimelineEventBase):
    case_id: int

class TimelineEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    event_type: Optional[TimelineEventType] = None
    stage_id: Optional[str] = None

class TimelineEventResponse(TimelineEventBase):
    id: int
    case_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
