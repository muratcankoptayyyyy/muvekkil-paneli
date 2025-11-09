from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.case import Case
from app.api.endpoints.auth import get_current_user
from app.core.permissions import (
    can_manage_payments,
    is_admin_or_lawyer,
    log_audit
)
from pydantic import BaseModel

router = APIRouter()

# Schemas
class PaymentCreate(BaseModel):
    amount: float
    currency: str = "TRY"
    description: str
    case_id: Optional[int] = None
    client_id: int
    method: Optional[PaymentMethod] = None

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    status: Optional[PaymentStatus] = None
    method: Optional[PaymentMethod] = None

# ============ ADMIN/LAWYER ENDPOINTS ============

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_payment_request(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Ödeme talebi oluştur (Admin/Lawyer)
    
    Kullanım:
    - Avukatlık ücreti
    - Bilirkişi ücreti
    - Dava masrafları
    """
    if not can_manage_payments(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and lawyers can create payment requests"
        )
    
    # Client kontrolü
    client = db.query(User).filter(User.id == payment_data.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Case kontrolü (opsiyonel)
    if payment_data.case_id:
        case = db.query(Case).filter(Case.id == payment_data.case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
        
        # Case'in client'ı ile uyuşmalı
        if case.client_id != payment_data.client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Case does not belong to the specified client"
            )
    
    # Payment ID oluştur
    import uuid
    payment_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"
    
    # Ödeme kaydı oluştur
    payment = Payment(
        payment_id=payment_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        description=payment_data.description,
        status=PaymentStatus.PENDING,
        method=payment_data.method,
        user_id=payment_data.client_id,
        case_id=payment_data.case_id
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="CREATE",
        resource_type="PAYMENT",
        resource_id=payment.id,
        description=f"Created payment request: {payment.payment_id} for client {client.full_name} - {payment.description}",
        changes=payment_data.model_dump(),
        request=request
    )
    
    return {
        "id": payment.id,
        "payment_id": payment.payment_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "description": payment.description,
        "status": payment.status.value,
        "client_id": payment.user_id,
        "case_id": payment.case_id,
        "created_at": payment.created_at.isoformat() if payment.created_at else None
    }

@router.put("/{payment_id}", status_code=status.HTTP_200_OK)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Ödeme bilgilerini güncelle (Admin/Lawyer)"""
    if not can_manage_payments(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and lawyers can update payments"
        )
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Eski değerleri kaydet
    old_values = {
        "amount": payment.amount,
        "status": payment.status.value if payment.status else None,
        "description": payment.description
    }
    
    # Güncelle
    update_data = payment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    # Status COMPLETED olursa tarihi ekle
    if payment_update.status == PaymentStatus.COMPLETED and not payment.completed_at:
        payment.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(payment)
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="UPDATE",
        resource_type="PAYMENT",
        resource_id=payment_id,
        description=f"Updated payment: {payment.payment_id}",
        changes={"old": old_values, "new": update_data},
        request=request
    )
    
    return {
        "id": payment.id,
        "payment_id": payment.payment_id,
        "amount": payment.amount,
        "status": payment.status.value,
        "message": "Payment updated successfully"
    }

@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Ödeme talebi sil (Sadece Admin)"""
    if not is_admin_or_lawyer(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete payments"
        )
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    payment_ref = payment.payment_id
    
    db.delete(payment)
    db.commit()
    
    # Audit log
    await log_audit(
        db=db,
        user=current_user,
        action="DELETE",
        resource_type="PAYMENT",
        resource_id=payment_id,
        description=f"Deleted payment: {payment_ref}",
        request=request
    )
    
    return None

@router.get("/all", response_model=List[dict])
async def get_all_payments(
    client_id: Optional[int] = None,
    status: Optional[PaymentStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tüm ödemeleri listele (Admin/Lawyer)"""
    if not is_admin_or_lawyer(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and lawyers can view all payments"
        )
    
    query = db.query(Payment)
    
    if client_id:
        query = query.filter(Payment.user_id == client_id)
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "payment_id": p.payment_id,
            "amount": p.amount,
            "currency": p.currency,
            "description": p.description,
            "status": p.status.value,
            "method": p.method.value if p.method else None,
            "client_id": p.user_id,
            "case_id": p.case_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "completed_at": p.completed_at.isoformat() if p.completed_at else None
        }
        for p in payments
    ]

# ============ CLIENT ENDPOINTS ============

@router.get("/my-payments", response_model=List[dict])
async def get_my_payments(
    status: Optional[PaymentStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Müvekkilin kendi ödemelerini görüntüle"""
    query = db.query(Payment).filter(Payment.user_id == current_user.id)
    
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "payment_id": p.payment_id,
            "amount": p.amount,
            "currency": p.currency,
            "description": p.description,
            "status": p.status.value,
            "case_id": p.case_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "completed_at": p.completed_at.isoformat() if p.completed_at else None
        }
        for p in payments
    ]

@router.get("/{payment_id}/details")
async def get_payment_details(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ödeme detayı"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Erişim kontrolü
    if not is_admin_or_lawyer(current_user) and payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own payments"
        )
    
    return {
        "id": payment.id,
        "payment_id": payment.payment_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "description": payment.description,
        "status": payment.status.value,
        "method": payment.method.value if payment.method else None,
        "case_id": payment.case_id,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
        "completed_at": payment.completed_at.isoformat() if payment.completed_at else None
    }
