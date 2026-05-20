from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User, UserCompany, UserRole
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter(prefix="/companies", tags=["Empresas"])


@router.get("", response_model=List[CompanyResponse])
async def list_companies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == UserRole.SUPERADMIN:
        result = await db.execute(select(Company).where(Company.is_active == True))
        return result.scalars().all()
    result = await db.execute(
        select(Company)
        .join(UserCompany, Company.id == UserCompany.company_id)
        .where(
            UserCompany.user_id == current_user.id,
            UserCompany.is_active == True,
            Company.is_active == True,
        )
    )
    return result.scalars().all()


@router.post("", response_model=CompanyResponse)
async def create_company(
    data: CompanyCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Company).where(Company.nif == data.nif))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="NIF já registado")
    company = Company(**data.model_dump())
    db.add(company)
    await db.flush()
    membership = UserCompany(
        user_id=current_user.id,
        company_id=company.id,
        role=UserRole.ADMIN,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    data: CompanyUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(company, k, v)
    await db.commit()
    await db.refresh(company)
    return company


@router.post("/{company_id}/users/{user_id}")
async def add_user_to_company(
    company_id: str,
    user_id: str,
    role: UserRole = UserRole.VIEWER,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(UserCompany).where(
            UserCompany.company_id == company_id,
            UserCompany.user_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Utilizador já pertence a esta empresa")
    membership = UserCompany(user_id=user_id, company_id=company_id, role=role)
    db.add(membership)
    await db.commit()
    return {"message": "Utilizador adicionado"}
