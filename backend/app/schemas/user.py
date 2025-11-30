from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    user_type: UserType = UserType.INDIVIDUAL

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    tc_kimlik: Optional[str] = None
    tax_number: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    bank_account_info: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    tc_kimlik: Optional[str] = None
    tax_number: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    bank_account_info: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None
    tc_kimlik: Optional[str] = None
    tax_number: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    bank_account_info: Optional[str] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
