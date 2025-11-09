from functools import wraps
from fastapi import HTTPException, status, Request
from typing import List, Callable
from app.models.user import User, UserType
from app.models.audit_log import AuditLog
from sqlalchemy.orm import Session

class PermissionDenied(HTTPException):
    """İzin reddedildi exception"""
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

def require_roles(allowed_roles: List[UserType]):
    """
    Decorator: Sadece belirtilen rollerdeki kullanıcılar erişebilir
    
    Kullanım:
        @require_roles([UserType.ADMIN, UserType.LAWYER])
        async def admin_only_endpoint():
            pass
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # current_user'ı kwargs'dan al
            current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated"
                )
            
            if current_user.user_type not in allowed_roles:
                raise PermissionDenied(
                    f"This action requires one of these roles: {[r.value for r in allowed_roles]}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def is_admin(user: User) -> bool:
    """Kullanıcı admin mi kontrol et"""
    return user.user_type == UserType.ADMIN

def is_lawyer(user: User) -> bool:
    """Kullanıcı avukat mı kontrol et"""
    return user.user_type == UserType.LAWYER

def is_admin_or_lawyer(user: User) -> bool:
    """Kullanıcı admin veya avukat mı kontrol et"""
    return user.user_type in [UserType.ADMIN, UserType.LAWYER]

def is_client(user: User) -> bool:
    """Kullanıcı müvekkil mi kontrol et"""
    return user.user_type in [UserType.INDIVIDUAL, UserType.CORPORATE]

def can_access_case(user: User, case) -> bool:
    """
    Kullanıcı bu dosyaya erişebilir mi?
    - Admin/Lawyer: Tüm dosyalara erişebilir
    - Client: Sadece kendi dosyalarına erişebilir
    """
    if is_admin_or_lawyer(user):
        return True
    
    return case.client_id == user.id

def can_modify_case(user: User, case) -> bool:
    """
    Kullanıcı bu dosyayı değiştirebilir mi?
    - Sadece Admin/Lawyer değiştirebilir
    """
    return is_admin_or_lawyer(user)

def can_delete_case(user: User) -> bool:
    """
    Kullanıcı dosya silebilir mi?
    - Sadece Admin silebilir
    """
    return is_admin(user)

def can_access_document(user: User, document) -> bool:
    """
    Kullanıcı bu evrakı görebilir mi?
    """
    # Admin/Lawyer tüm evrakları görebilir
    if is_admin_or_lawyer(user):
        return True
    
    # Müvekkil sadece kendine görünür evrakları görebilir
    if document.user_id == user.id and document.is_visible_to_client:
        return True
    
    # Evrakın dosyasına erişimi varsa ve görünürse
    if document.case and document.case.client_id == user.id and document.is_visible_to_client:
        return True
    
    return False

def can_upload_document(user: User) -> bool:
    """
    Kullanıcı evrak yükleyebilir mi?
    - Admin/Lawyer: Her zaman yükleyebilir
    - Client: Kendi dosyalarına yükleyebilir (endpoint'te kontrol edilecek)
    """
    return True  # Detaylı kontrol endpoint'te yapılacak

def can_manage_payments(user: User) -> bool:
    """
    Kullanıcı ödeme yönetimi yapabilir mi?
    - Sadece Admin/Lawyer ödeme oluşturabilir/güncelleyebilir
    """
    return is_admin_or_lawyer(user)

def can_view_all_clients(user: User) -> bool:
    """
    Kullanıcı tüm müvekkilleri görebilir mi?
    - Sadece Admin/Lawyer
    """
    return is_admin_or_lawyer(user)

async def log_audit(
    db: Session,
    user: User,
    action: str,
    resource_type: str,
    resource_id: int = None,
    description: str = None,
    changes: dict = None,
    request: Request = None
):
    """
    Audit log kaydı oluştur
    
    Args:
        db: Database session
        user: İşlemi yapan kullanıcı
        action: İşlem tipi (CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, UPLOAD)
        resource_type: Kaynak tipi (CASE, DOCUMENT, PAYMENT, USER)
        resource_id: Kaynak ID
        description: İnsan okunabilir açıklama
        changes: Yapılan değişikliklerin detayı
        request: FastAPI Request objesi (IP ve user-agent için)
    """
    audit_log = AuditLog(
        user_id=user.id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        changes=changes,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    
    db.add(audit_log)
    db.commit()
    
    return audit_log
