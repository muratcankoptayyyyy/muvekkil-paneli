from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated, Optional
import pyotp
import qrcode
import io
import base64

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginResponse, Token, UserUpdate

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    otp_code: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Kullanıcı girişi
    - Admin/Avukat için: username = email adresi
    - Müşteriler için: username = TC Kimlik No veya Vergi Kimlik No
    """
    
    user = None
    
    # Email formatında mı kontrol et (@ işareti varsa email)
    if "@" in form_data.username:
        # Email ile giriş (admin/lawyer)
        user = db.query(User).filter(User.email == form_data.username).first()
    else:
        # TC Kimlik veya Vergi No ile kullanıcı ara (client)
        user = db.query(User).filter(
            (User.tc_kimlik == form_data.username) | (User.tax_number == form_data.username)
        ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız aktif değil. Lütfen avukatınızla iletişime geçin."
        )

    # 2FA Check
    if user.is_2fa_enabled:
        if not otp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="2FA code required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(otp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA code",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini getir"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mevcut kullanıcı bilgilerini güncelle"""
    
    # Email değişiyorsa kontrol et
    if user_update.email and user_update.email != current_user.email:
        existing_email = db.query(User).filter(User.email == user_update.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kullanımda"
            )
        current_user.email = user_update.email

    # Diğer alanları güncelle
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Email zaten işlendi, çıkar
    if "email" in update_data:
        del update_data["email"]
        
    # Hassas alanları güncelleme (password, user_type vs)
    # UserUpdate şemasında zaten sadece izin verilen alanlar olmalı
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Kullanıcı çıkışı"""
    # In a real application, you might want to blacklist the token
    return {"message": "Successfully logged out"}

@router.post("/create-user", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Yeni kullanıcı oluştur (Sadece admin)
    Admin tarafından müvekkiller için kullanıcı hesabı oluşturulur.
    """
    # Sadece admin kullanıcı oluşturabilir
    if current_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece admin kullanıcı oluşturabilir"
        )
    
    # TC Kimlik kontrolü (bireysel kullanıcılar için)
    if user_data.tc_kimlik:
        existing_tc = db.query(User).filter(User.tc_kimlik == user_data.tc_kimlik).first()
        if existing_tc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu TC Kimlik numarası zaten kayıtlı"
            )
    
    # Vergi numarası kontrolü (kurumsal kullanıcılar için)
    if user_data.tax_number:
        existing_tax = db.query(User).filter(User.tax_number == user_data.tax_number).first()
        if existing_tax:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu vergi numarası zaten kayıtlı"
            )
    
    # Email kontrolü
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu email adresi zaten kayıtlı"
            )
    
    # Yeni kullanıcı oluştur
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        user_type=user_data.user_type,
        tc_kimlik=user_data.tc_kimlik,
        tax_number=user_data.tax_number,
        company_name=user_data.company_name,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/2fa/setup")
async def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate 2FA secret and QR code"""
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
    
    # Generate secret if not exists
    if not current_user.totp_secret:
        current_user.totp_secret = pyotp.random_base32()
        db.commit()
    
    # Generate QR code
    totp = pyotp.TOTP(current_user.totp_secret)
    provisioning_uri = totp.provisioning_uri(name=current_user.email, issuer_name="Muvekkil Paneli")
    
    # Create QR code image
    img = qrcode.make(provisioning_uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "secret": current_user.totp_secret,
        "qr_code": f"data:image/png;base64,{img_str}",
        "provisioning_uri": provisioning_uri
    }

@router.post("/2fa/verify")
async def verify_2fa_setup(
    code: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA setup and enable it"""
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
    
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not initiated")
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if totp.verify(code):
        current_user.is_2fa_enabled = True
        db.commit()
        return {"message": "2FA enabled successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid code")

@router.post("/2fa/disable")
async def disable_2fa(
    code: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA"""
    if not current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if totp.verify(code):
        current_user.is_2fa_enabled = False
        current_user.totp_secret = None # Optional: clear secret
        db.commit()
        return {"message": "2FA disabled successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid code")
