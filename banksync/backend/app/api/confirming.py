from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.confirming import ConfirmingOrder, ConfirmingStatus
from app.schemas.confirming import (
    ConfirmingOrderCreate, ConfirmingOrderUpdate, ConfirmingOrderResponse
)

router = APIRouter(prefix="/confirming", tags=["Confirming"])


@router.get("/{company_id}/orders", response_model=List[ConfirmingOrderResponse])
async def list_orders(
    company_id: str,
    status: Optional[ConfirmingStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(ConfirmingOrder).where(ConfirmingOrder.company_id == company_id)
    if status:
        q = q.where(ConfirmingOrder.status == status)
    q = q.order_by(ConfirmingOrder.due_date.asc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{company_id}/orders", response_model=ConfirmingOrderResponse)
async def create_order(
    company_id: str,
    data: ConfirmingOrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = ConfirmingOrder(company_id=company_id, **data.model_dump())
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/{company_id}/orders/{order_id}", response_model=ConfirmingOrderResponse)
async def get_order(
    company_id: str,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(ConfirmingOrder, order_id)
    if not order or str(order.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    return order


@router.put("/{company_id}/orders/{order_id}", response_model=ConfirmingOrderResponse)
async def update_order(
    company_id: str,
    order_id: str,
    data: ConfirmingOrderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(ConfirmingOrder, order_id)
    if not order or str(order.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(order, k, v)
    await db.commit()
    await db.refresh(order)
    return order


@router.delete("/{company_id}/orders/{order_id}")
async def delete_order(
    company_id: str,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(ConfirmingOrder, order_id)
    if not order or str(order.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    if order.status not in (ConfirmingStatus.DRAFT,):
        raise HTTPException(status_code=400, detail="Só é possível eliminar ordens em rascunho")
    await db.delete(order)
    await db.commit()
    return {"message": "Ordem eliminada"}


@router.post("/{company_id}/orders/{order_id}/send")
async def send_to_bank(
    company_id: str,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await db.get(ConfirmingOrder, order_id)
    if not order or str(order.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Ordem não encontrada")
    if order.status != ConfirmingStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Ordem já enviada")
    order.status = ConfirmingStatus.SENT
    await db.commit()
    return {"message": "Ordem enviada ao banco"}
