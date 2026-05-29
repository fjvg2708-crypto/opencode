from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    nif: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    phc_code: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    phc_code: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    nif: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: bool
    phc_code: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
