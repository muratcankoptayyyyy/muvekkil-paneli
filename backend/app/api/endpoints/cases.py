from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.api.endpoints.auth import get_current_user

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
    
    # Create new case
    db_case = Case(
        **case_data.model_dump(),
        client_id=current_user.id
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
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
