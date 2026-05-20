from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import date

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.banking import BankConnection, BankAccount, Transaction, ConnectionStatus
from app.schemas.banking import (
    BankConnectionCreate, BankConnectionResponse,
    BankAccountCreate, BankAccountUpdate, BankAccountResponse,
    TransactionResponse, SaltEdgeConnectResponse
)
from app.services.salt_edge_service import salt_edge_service

router = APIRouter(prefix="/banking", tags=["Banca"])


# --- Connections ---

@router.get("/{company_id}/connections", response_model=List[BankConnectionResponse])
async def list_connections(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankConnection).where(BankConnection.company_id == company_id)
    )
    return result.scalars().all()


@router.post("/{company_id}/connections/salt-edge", response_model=SaltEdgeConnectResponse)
async def create_salt_edge_connection(
    company_id: str,
    data: BankConnectionCreate,
    return_to: str = Query(default="http://localhost:3000/banking/callback"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    customer_id = f"company_{company_id}"
    try:
        await salt_edge_service.create_customer(customer_id)
    except Exception:
        pass  # customer may already exist

    session = await salt_edge_service.create_connect_session(
        customer_id=customer_id,
        return_to=return_to,
        provider_code=data.provider_code,
    )
    connection = BankConnection(
        company_id=company_id,
        salt_edge_customer_id=customer_id,
        provider_name=data.provider_name,
        provider_code=data.provider_code,
        status=ConnectionStatus.PENDING,
    )
    db.add(connection)
    await db.commit()
    return SaltEdgeConnectResponse(
        connect_url=session.get("connect_url", ""),
        connection_id=str(connection.id),
    )


@router.post("/{company_id}/connections/salt-edge/callback")
async def salt_edge_callback(
    company_id: str,
    connection_id: str,
    salt_edge_connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conn = await db.get(BankConnection, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Ligação não encontrada")
    conn.salt_edge_connection_id = salt_edge_connection_id
    conn.status = ConnectionStatus.ACTIVE
    await db.commit()

    # Sync accounts
    accounts = await salt_edge_service.get_accounts(salt_edge_connection_id)
    for acc in accounts:
        bank_acc = BankAccount(
            company_id=company_id,
            connection_id=connection_id,
            salt_edge_account_id=acc.get("id"),
            name=acc.get("name", "Conta"),
            iban=acc.get("extra", {}).get("iban"),
            currency=acc.get("currency_code", "EUR"),
            balance=acc.get("balance", 0),
            available_balance=acc.get("extra", {}).get("available_amount"),
            bank_name=conn.provider_name,
        )
        db.add(bank_acc)
    await db.commit()
    return {"message": "Ligação ativada e contas sincronizadas"}


@router.get("/{company_id}/connections/providers")
async def list_providers(
    company_id: str,
    country: str = Query(default="PT"),
    current_user: User = Depends(get_current_user),
):
    return await salt_edge_service.get_providers(country)


@router.post("/{company_id}/connections/{connection_id}/sync")
async def sync_connection(
    company_id: str,
    connection_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conn = await db.get(BankConnection, connection_id)
    if not conn or not conn.salt_edge_connection_id:
        raise HTTPException(status_code=404, detail="Ligação não encontrada")
    await salt_edge_service.refresh_connection(conn.salt_edge_connection_id)
    return {"message": "Sincronização iniciada"}


# --- Accounts ---

@router.get("/{company_id}/accounts", response_model=List[BankAccountResponse])
async def list_accounts(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankAccount).where(
            and_(BankAccount.company_id == company_id, BankAccount.is_active == True)
        )
    )
    return result.scalars().all()


@router.post("/{company_id}/accounts", response_model=BankAccountResponse)
async def create_manual_account(
    company_id: str,
    data: BankAccountCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    account = BankAccount(company_id=company_id, **data.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.put("/{company_id}/accounts/{account_id}", response_model=BankAccountResponse)
async def update_account(
    company_id: str,
    account_id: str,
    data: BankAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    account = await db.get(BankAccount, account_id)
    if not account or str(account.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(account, k, v)
    await db.commit()
    await db.refresh(account)
    return account


# --- Transactions ---

@router.get("/{company_id}/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    company_id: str,
    account_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Transaction)
        .join(BankAccount, Transaction.account_id == BankAccount.id)
        .where(BankAccount.company_id == company_id)
    )
    if account_id:
        q = q.where(Transaction.account_id == account_id)
    if start_date:
        q = q.where(Transaction.booking_date >= start_date)
    if end_date:
        q = q.where(Transaction.booking_date <= end_date)
    if search:
        q = q.where(
            or_(
                Transaction.description.ilike(f"%{search}%"),
                Transaction.counterparty_name.ilike(f"%{search}%"),
            )
        )
    q = q.order_by(Transaction.booking_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()
