from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io

from app.core.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentType
from app.models.case import Case
from app.api.endpoints.auth import get_current_user
from app.services.notification import create_notification, notify_admins
from app.models.notification import NotificationType, NotificationPriority
from app.core.permissions import (
    can_access_document,
    can_upload_document,
    is_admin_or_lawyer,
    log_audit
)

router = APIRouter()

# Allowed file types
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls', '.txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[int] = None,
    document_type: DocumentType = DocumentType.OTHER,
    description: Optional[str] = None,
    is_visible_to_client: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Evrak yükle
    
    - Admin/Lawyer: Herhangi bir dosyaya evrak yükleyebilir
    - Client: Sadece kendi dosyalarına yükleyebilir
    """
    if not can_upload_document(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload documents"
        )
    
    # Dosya uzantısı kontrolü
    import os
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Dosya boyutu kontrolü
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024} MB"
        )
    
    # Case kontrolü
    if case_id:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Client ise sadece kendi dosyasına yükleyebilir
        if not is_admin_or_lawyer(current_user) and case.client_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload documents to your own cases"
            )
    
    # Basit dosya depolama (local storage)
    # Production'da MinIO/S3 kullanılacak
    import uuid
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    upload_dir = "./uploads/documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Database kaydı
    document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=f"documents/{unique_filename}",
        file_size=len(file_content),
        mime_type=file.content_type or "application/octet-stream",
        document_type=document_type,
        description=description,
        is_visible_to_client=is_visible_to_client,
        user_id=current_user.id,
        case_id=case_id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Bildirim oluştur
    if case_id:
        # Eğer bir davaya yüklendiyse
        case = db.query(Case).filter(Case.id == case_id).first()
        if case:
            # Yükleyen admin/avukat ise müvekkile bildirim gönder
            if is_admin_or_lawyer(current_user) and case.client_id and is_visible_to_client:
                await create_notification(
                    db=db,
                    user_id=case.client_id,
                    title="Yeni Evrak Yüklendi",
                    message=f"{case.case_number} numaralı dosyanıza yeni bir evrak yüklendi: {file.filename}",
                    type=NotificationType.DOCUMENT_UPLOAD,
                    priority=NotificationPriority.MEDIUM,
                    related_entity_type="document",
                    related_entity_id=document.id,
                    case_id=case.id
                )
            
            # Yükleyen müvekkil ise adminlere bildirim gönder
            elif not is_admin_or_lawyer(current_user):
                await notify_admins(
                    db=db,
                    title="Müvekkil Evrak Yükledi",
                    message=f"{current_user.full_name}, {case.case_number} numaralı dosyaya evrak yükledi: {file.filename}",
                    type=NotificationType.DOCUMENT_UPLOAD,
                    priority=NotificationPriority.MEDIUM,
                    related_entity_type="document",
                    related_entity_id=document.id,
                    case_id=case.id
                )
    else:
        # Dava dışı evrak yüklendiyse ve yükleyen client ise adminlere bildir
        if not is_admin_or_lawyer(current_user):
            await notify_admins(
                db=db,
                title="Müvekkil Evrak Yükledi",
                message=f"{current_user.full_name} sisteme yeni bir evrak yükledi: {file.filename}",
                type=NotificationType.DOCUMENT_UPLOAD,
                priority=NotificationPriority.MEDIUM,
                related_entity_type="document",
                related_entity_id=document.id
            )

    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="UPLOAD",
        resource_type="DOCUMENT",
        resource_id=document.id,
        description=f"Uploaded document: {file.filename} (Case: {case_id or 'N/A'})",
        request=request
    )
    
    return {
        "id": document.id,
        "filename": document.original_filename,
        "file_size": document.file_size,
        "document_type": document.document_type,
        "message": "Document uploaded successfully"
    }

@router.get("/", response_model=List[dict])
async def get_documents(
    case_id: Optional[int] = None,
    document_type: Optional[DocumentType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evrakları listele"""
    query = db.query(Document)
    
    # Admin/Lawyer tüm evrakları görebilir
    # Client sadece kendine görünür evrakları görebilir
    if not is_admin_or_lawyer(current_user):
        query = query.filter(
            (Document.user_id == current_user.id) |
            (
                (Document.case_id.in_(
                    db.query(Case.id).filter(Case.client_id == current_user.id)
                )) &
                (Document.is_visible_to_client == True)
            )
        )
    
    # Filtreler
    if case_id:
        query = query.filter(Document.case_id == case_id)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    
    documents = query.all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.original_filename,
            "file_size": doc.file_size,
            "document_type": doc.document_type.value,
            "description": doc.description,
            "case_id": doc.case_id,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            "is_visible_to_client": doc.is_visible_to_client
        }
        for doc in documents
    ]

@router.get("/{document_id}")
async def get_document_detail(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evrak detayı"""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Erişim kontrolü
    if not can_access_document(current_user, document):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this document"
        )
    
    return {
        "id": document.id,
        "filename": document.original_filename,
        "file_size": document.file_size,
        "mime_type": document.mime_type,
        "document_type": document.document_type.value,
        "description": document.description,
        "case_id": document.case_id,
        "uploaded_at": document.uploaded_at.isoformat() if document.uploaded_at else None,
        "is_visible_to_client": document.is_visible_to_client
    }

@router.get("/download/{document_id}")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Evrak indir"""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Erişim kontrolü
    if not can_access_document(current_user, document):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to download this document"
        )
    
    # Dosyayı oku
    import os
    file_path = os.path.join("./uploads", document.file_path)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="DOWNLOAD",
        resource_type="DOCUMENT",
        resource_id=document.id,
        description=f"Downloaded document: {document.original_filename}",
        request=request
    )
    
    with open(file_path, "rb") as f:
        file_content = f.read()
    
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=document.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{document.original_filename}"'
        }
    )

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Evrak sil (Sadece Admin/Lawyer)"""
    if not is_admin_or_lawyer(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and lawyers can delete documents"
        )
    
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Dosyayı diskten sil
    import os
    file_path = os.path.join("./uploads", document.file_path)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    filename = document.original_filename
    
    # Database'den sil
    db.delete(document)
    db.commit()
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="DELETE",
        resource_type="DOCUMENT",
        resource_id=document_id,
        description=f"Deleted document: {filename}",
        request=request
    )
    
    return None
