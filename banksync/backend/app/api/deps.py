from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.services.auth_service import get_user_by_id

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilizador não encontrado ou inativo")
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user


async def require_superadmin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(status_code=403, detail="Apenas superadmin")
    return current_user
