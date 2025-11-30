from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.timeline import TimelineEvent
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.schemas.timeline import TimelineEventResponse, TimelineEventCreate
from app.api.endpoints.auth import get_current_user
from app.services.notification import create_notification, notify_admins
from app.models.notification import NotificationType, NotificationPriority
from app.utils.case_stages import get_default_stages

router = APIRouter()

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Yeni dosya/dava oluştur"""
    
    # Check if case number already exists
    existing_case = db.query(Case).filter(Case.case_number == case_data.case_number).first()
    if existing_case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case number already exists"
        )
    
    # Determine client_id
    client_id = current_user.id
    if current_user.user_type in ["admin", "lawyer"]:
        if case_data.client_id:
            # Verify client exists
            client = db.query(User).filter(User.id == case_data.client_id).first()
            if not client:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Client not found"
                )
            client_id = case_data.client_id
        else:
            # Admin/Lawyer must specify client_id (or we could default to themselves, but that's weird for a case)
            # Let's allow them to create for themselves if they really want, but usually they shouldn't.
            # For now, let's keep it flexible: if not provided, use current_user.id (which might be the lawyer)
            pass

    # Create new case
    case_dict = case_data.model_dump(exclude={"client_id"})
    
    # Set default stages based on case type
    stages = get_default_stages(case_data.case_type)
    
    db_case = Case(
        **case_dict,
        client_id=client_id,
        stages=stages
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    # Bildirim oluştur
    if db_case.client_id:
        await create_notification(
            db=db,
            user_id=db_case.client_id,
            title="Yeni Dava Dosyası Açıldı",
            message=f"{db_case.case_number} numaralı dava dosyanız oluşturuldu.",
            type=NotificationType.CASE_UPDATE,
            priority=NotificationPriority.HIGH,
            related_entity_type="case",
            related_entity_id=db_case.id
        )
    
    # Adminlere de bildirim gönder (oluşturan kişi admin değilse)
    if not current_user.is_admin:
        await notify_admins(
            db=db,
            title="Yeni Dava Başvurusu",
            message=f"{current_user.full_name} yeni bir dava dosyası oluşturdu: {db_case.case_number}",
            type=NotificationType.CASE_UPDATE,
            priority=NotificationPriority.MEDIUM,
            related_entity_type="case",
            related_entity_id=db_case.id
        )

    return db_case

@router.get("/", response_model=CaseListResponse)
async def get_cases(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının dosyalarını listele"""
    
    query = db.query(Case)
    
    # Admins and lawyers can see all cases
    if current_user.user_type not in ["admin", "lawyer"]:
        query = query.filter(Case.client_id == current_user.id)
    
    total = query.count()
    cases = query.offset(skip).limit(limit).all()
    
    return {
        "cases": cases,
        "total": total
    }

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dosya detayını getir"""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Check permissions
    if current_user.user_type not in ["admin", "lawyer"] and case.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this case"
        )
    
    return case

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case_update: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dosya bilgilerini güncelle"""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Only admins and lawyers can update cases
    if current_user.user_type not in ["admin", "lawyer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this case"
        )
    
    # Update case
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)
    
    db.commit()
    db.refresh(case)
    
    return case

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dosyayı sil"""
    
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Only admins can delete cases
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete cases"
        )
    
    db.delete(case)
    db.commit()
    
    return None

@router.get("/{case_id}/timeline", response_model=List[TimelineEventResponse])
async def get_case_timeline(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dosya zaman çizelgesini getir"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.user_type not in ["admin", "lawyer"] and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(TimelineEvent.event_date.desc()).all()

@router.post("/{case_id}/timeline", response_model=TimelineEventResponse)
async def create_timeline_event(
    case_id: int,
    event_data: TimelineEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dosyaya yeni olay ekle (Sadece Admin/Avukat)"""
    if current_user.user_type not in ["admin", "lawyer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    db_event = TimelineEvent(**event_data.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return db_event
