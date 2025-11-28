from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının bildirimlerini listele"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
        
    # En yeniden eskiye sırala
    query = query.order_by(Notification.created_at.desc())
    
    notifications = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.notification_type.value,
            "priority": n.priority.value,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "case_id": n.case_id
        }
        for n in notifications
    ]

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Okunmamış bildirim sayısını getir"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"count": count}

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bildirimi okundu olarak işaretle"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = datetime.now()
    db.commit()
    
    return {"message": "Marked as read"}

@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tüm bildirimleri okundu olarak işaretle"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update(
        {
            "is_read": True,
            "read_at": datetime.now()
        },
        synchronize_session=False
    )
    
    db.commit()
    
    return {"message": "All marked as read"}
