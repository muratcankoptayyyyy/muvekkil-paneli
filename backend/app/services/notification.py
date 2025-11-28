from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType, NotificationPriority
from app.models.user import User

async def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.IN_APP,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    case_id: int = None,
    link: str = None,
    related_entity_type: str = None,
    related_entity_id: int = None
):
    """
    Yeni bir bildirim oluşturur
    """
    # Link otomatik oluşturma (eğer verilmediyse)
    if not link and related_entity_type and related_entity_id:
        if related_entity_type == "case":
            link = f"/cases/{related_entity_id}"
        elif related_entity_type == "document":
            link = f"/documents?case_id={case_id}" if case_id else "/documents"
        elif related_entity_type == "payment":
            link = f"/payments"

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        case_id=case_id,
        link=link,
        is_read=False,
        is_sent=True # In-app notifications are "sent" immediately
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

async def notify_admins(
    db: Session,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.IN_APP,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    case_id: int = None,
    link: str = None,
    related_entity_type: str = None,
    related_entity_id: int = None
):
    """
    Tüm admin ve avukatlara bildirim gönderir
    """
    admins = db.query(User).filter(User.user_type.in_(["admin", "lawyer"])).all()
    
    for admin in admins:
        await create_notification(
            db=db,
            user_id=admin.id,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            case_id=case_id,
            link=link,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id
        )
