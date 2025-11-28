from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.case import CaseStatus, CaseType

class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    case_type: CaseType
    court_name: Optional[str] = None
    file_number: Optional[str] = None

class CaseCreate(CaseBase):
    case_number: str
    next_hearing_date: Optional[datetime] = None
    client_id: Optional[int] = None  # Admin/Lawyer can specify client


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    court_name: Optional[str] = None
    file_number: Optional[str] = None
    next_hearing_date: Optional[datetime] = None

class CaseResponse(CaseBase):
    id: int
    case_number: str
    status: CaseStatus
    client_id: int
    start_date: datetime
    next_hearing_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CaseListResponse(BaseModel):
    cases: List[CaseResponse]
    total: int
