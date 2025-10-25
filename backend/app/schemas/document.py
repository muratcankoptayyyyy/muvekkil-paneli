from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.document import DocumentType

class DocumentBase(BaseModel):
    description: Optional[str] = None
    document_type: DocumentType = DocumentType.OTHER
    is_visible_to_client: bool = True

class DocumentCreate(DocumentBase):
    case_id: Optional[int] = None

class DocumentUpdate(BaseModel):
    description: Optional[str] = None
    document_type: Optional[DocumentType] = None
    is_visible_to_client: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    user_id: int
    case_id: Optional[int] = None
    uploaded_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
