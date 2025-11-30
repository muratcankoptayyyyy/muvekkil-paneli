from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import secrets
import string
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserType
from app.models.case import Case, CaseStatus, CaseType
from app.models.document import Document
from app.models.payment import Payment, PaymentStatus
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.schemas.user import UserResponse, UserBase
from app.api.endpoints.auth import get_current_user
from app.core.permissions import (
    is_admin_or_lawyer,
    can_view_all_clients,
    PermissionDenied,
    log_audit
)

router = APIRouter()

# ============ MÜVEKKİL YÖNETİMİ ============

@router.get("/clients", response_model=List[UserResponse])
async def get_all_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    user_type: Optional[UserType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Tüm müvekkilleri listele (Admin/Avukat için)
    
    - search: Ad, email, TC veya vergi numarası ile arama
    - user_type: Müvekkil tipine göre filtreleme
    """
    if not can_view_all_clients(current_user):
        raise PermissionDenied("Only admins and lawyers can view all clients")
    
    query = db.query(User).filter(
        User.user_type.in_([UserType.INDIVIDUAL, UserType.CORPORATE])
    )
    
    # Filtreleme
    if user_type:
        query = query.filter(User.user_type == user_type)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (User.tc_kimlik.ilike(search_filter)) |
            (User.tax_number.ilike(search_filter)) |
            (User.company_name.ilike(search_filter))
        )
    
    clients = query.offset(skip).limit(limit).all()
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="VIEW",
        resource_type="CLIENT_LIST",
        description=f"Viewed clients list (count: {len(clients)})",
        request=request
    )
    
    return clients

@router.get("/clients/{client_id}", response_model=UserResponse)
async def get_client_detail(
    client_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Müvekkil detaylarını getir"""
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()
    
    client = db.query(User).filter(User.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="VIEW",
        resource_type="CLIENT",
        resource_id=client_id,
        description=f"Viewed client details: {client.full_name}",
        request=request
    )
    
    return client

# ============ DOSYA YÖNETİMİ ============

@router.get("/cases", response_model=List[CaseResponse])
async def get_all_cases(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    status: Optional[CaseStatus] = None,
    case_type: Optional[CaseType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Tüm dosyaları listele (Admin/Avukat için)
    
    - client_id: Belirli bir müvekkile ait dosyalar
    - status: Dosya durumuna göre filtrele
    - case_type: Dosya tipine göre filtrele
    """
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()
    
    query = db.query(Case)
    
    # Filtreler
    if client_id:
        query = query.filter(Case.client_id == client_id)
    if status:
        query = query.filter(Case.status == status)
    if case_type:
        query = query.filter(Case.case_type == case_type)
    
    cases = query.offset(skip).limit(limit).all()
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="VIEW",
        resource_type="CASE_LIST",
        description=f"Viewed all cases (count: {len(cases)})",
        request=request
    )
    
    return cases

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case_for_client(
    case_data: CaseCreate,
    client_id: int = Query(..., description="Müvekkil ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Müvekkil için yeni dosya oluştur (Admin/Avukat)
    """
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()
    
    # Müvekkili kontrol et
    client = db.query(User).filter(User.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Dosya numarası kontrolü
    existing_case = db.query(Case).filter(Case.case_number == case_data.case_number).first()
    if existing_case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case number already exists"
        )
    
    # Dosya oluştur
    db_case = Case(
        **case_data.model_dump(),
        client_id=client_id
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="CREATE",
        resource_type="CASE",
        resource_id=db_case.id,
        description=f"Created case {db_case.case_number} for client {client.full_name}",
        changes=case_data.model_dump(),
        request=request
    )
    
    return db_case

@router.put("/cases/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case_update: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Dosya bilgilerini güncelle (Admin/Avukat)"""
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()
    
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Eski değerleri kaydet (audit için)
    old_values = {
        "status": case.status.value if case.status else None,
        "next_hearing_date": case.next_hearing_date.isoformat() if case.next_hearing_date else None,
        "court_name": case.court_name
    }
    
    # Güncelle
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)
    
    db.commit()
    db.refresh(case)
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="UPDATE",
        resource_type="CASE",
        resource_id=case_id,
        description=f"Updated case {case.case_number}",
        changes={"old": old_values, "new": update_data},
        request=request
    )
    
    return case

@router.delete("/cases/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Dosyayı sil (Sadece Admin)"""
    if current_user.user_type != UserType.ADMIN:
        raise PermissionDenied("Only admins can delete cases")
    
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    case_number = case.case_number
    
    db.delete(case)
    db.commit()
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="DELETE",
        resource_type="CASE",
        resource_id=case_id,
        description=f"Deleted case {case_number}",
        request=request
    )
    
    return None

# ============ İSTATİSTİKLER ============

@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Genel istatistikler (Admin/Avukat için)
    """
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()
    
    total_clients = db.query(User).filter(
        User.user_type.in_([UserType.INDIVIDUAL, UserType.CORPORATE])
    ).count()
    
    total_cases = db.query(Case).count()
    active_cases = db.query(Case).filter(
        Case.status.in_([CaseStatus.IN_PROGRESS, CaseStatus.WAITING_COURT])
    ).count()
    
    total_documents = db.query(Document).count()
    
    pending_payments = db.query(Payment).filter(
        Payment.status == PaymentStatus.PENDING
    ).count()
    
    return {
        "total_clients": total_clients,
        "total_cases": total_cases,
        "active_cases": active_cases,
        "total_documents": total_documents,
        "pending_payments": pending_payments
    }

class ClientCreateRequest(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    user_type: UserType = UserType.INDIVIDUAL
    tc_kimlik: Optional[str] = None
    tax_number: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    bank_account_info: Optional[str] = None

@router.post("/clients", response_model=dict)
async def create_client(
    client_in: ClientCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Yeni müvekkil oluştur (Admin/Avukat)
    Otomatik geçici şifre oluşturur ve döner.
    """
    if not is_admin_or_lawyer(current_user):
        raise PermissionDenied()

    # Check if email exists if provided
    if client_in.email:
        if db.query(User).filter(User.email == client_in.email).first():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
    else:
        # Generate dummy email if not provided
        # Format: no-email-{tc_or_tax_or_random}@noemail.koptay.av.tr
        identifier = client_in.tc_kimlik or client_in.tax_number or secrets.token_hex(4)
        client_in.email = f"no-email-{identifier}@noemail.koptay.av.tr"
        
        # Check if this dummy email exists (unlikely but possible)
        while db.query(User).filter(User.email == client_in.email).first():
             identifier = secrets.token_hex(4)
             client_in.email = f"no-email-{identifier}@noemail.koptay.av.tr"
    
    # TC Kimlik veya Vergi No kontrolü
    if client_in.tc_kimlik:
        if db.query(User).filter(User.tc_kimlik == client_in.tc_kimlik).first():
            raise HTTPException(
                status_code=400,
                detail="Bu TC Kimlik numarası zaten kayıtlı"
            )
    
    if client_in.tax_number:
        if db.query(User).filter(User.tax_number == client_in.tax_number).first():
            raise HTTPException(
                status_code=400,
                detail="Bu Vergi Kimlik numarası zaten kayıtlı"
            )
    
    # Generate temporary password (8 chars: letters + digits)
    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for i in range(8))
    hashed_password = get_password_hash(temp_password)
    
    user_data = client_in.model_dump()
    user = User(
        **user_data,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=True,  # Admin created, so verified
        must_change_password=True  # İlk girişte şifre değiştirmek zorunda
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="CREATE",
        resource_type="CLIENT",
        resource_id=user.id,
        description=f"Created client {user.full_name}",
        request=request
    )
    
    return {
        "user": user,
        "temp_password": temp_password
    }
