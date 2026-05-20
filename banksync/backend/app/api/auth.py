from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshRequest,
    TwoFASetupResponse, TwoFAVerifyRequest, UserCreate, UserResponse,
    PasswordChange
)
from app.services.auth_service import (
    authenticate_user, create_tokens, create_user,
    setup_2fa, enable_2fa, disable_2fa, get_user_by_id
)
from app.core.security import decode_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, needs_2fa = await authenticate_user(db, data.email, data.password, data.totp_code)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    if needs_2fa:
        return TokenResponse(
            access_token="",
            refresh_token="",
            requires_2fa=True,
        )
    return create_tokens(str(user.id))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    user = await get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilizador inativo")
    return create_tokens(str(user.id))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=UserResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await create_user(db, data)


@router.post("/2fa/setup", response_model=TwoFASetupResponse)
async def setup_two_fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await setup_2fa(db, current_user)
    return TwoFASetupResponse(**result)


@router.post("/2fa/enable")
async def enable_two_fa(
    data: TwoFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enable_2fa(db, current_user, data.code)
    return {"message": "2FA ativado com sucesso"}


@router.post("/2fa/disable")
async def disable_two_fa(
    data: TwoFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await disable_2fa(db, current_user, data.code)
    return {"message": "2FA desativado"}


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"message": "Senha alterada com sucesso"}
