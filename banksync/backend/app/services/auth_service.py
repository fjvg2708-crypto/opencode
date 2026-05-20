from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, generate_totp_secret,
    get_totp_uri, generate_qr_code, verify_totp
)
from app.schemas.auth import UserCreate


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email já registado")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str, totp_code: Optional[str] = None
) -> Tuple[Optional[User], bool]:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None, False
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Conta desativada")
    if user.totp_enabled:
        if not totp_code:
            return user, True  # needs 2FA
        if not verify_totp(user.totp_secret, totp_code):
            raise HTTPException(status_code=401, detail="Código 2FA inválido")
    return user, False


async def setup_2fa(db: AsyncSession, user: User) -> dict:
    secret = generate_totp_secret()
    uri = get_totp_uri(secret, user.email)
    qr = generate_qr_code(uri)
    user.totp_secret = secret
    await db.commit()
    return {"secret": secret, "qr_code": qr, "uri": uri}


async def enable_2fa(db: AsyncSession, user: User, code: str) -> bool:
    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA não configurado")
    if not verify_totp(user.totp_secret, code):
        raise HTTPException(status_code=400, detail="Código inválido")
    user.totp_enabled = True
    await db.commit()
    return True


async def disable_2fa(db: AsyncSession, user: User, code: str) -> bool:
    if not user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA não está ativo")
    if not verify_totp(user.totp_secret, code):
        raise HTTPException(status_code=400, detail="Código inválido")
    user.totp_enabled = False
    user.totp_secret = None
    await db.commit()
    return True


def create_tokens(user_id: str) -> dict:
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
        "requires_2fa": False,
    }
