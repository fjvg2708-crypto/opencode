from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from decimal import Decimal

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.factoring import FactoringInvoice, FactoringBatch, FactoringStatus, FactoringBatchStatus
from app.schemas.factoring import (
    FactoringInvoiceCreate, FactoringInvoiceUpdate, FactoringInvoiceResponse,
    FactoringBatchCreate, FactoringBatchResponse,
)

router = APIRouter(prefix="/factoring", tags=["Factoring"])


@router.get("/{company_id}/invoices", response_model=List[FactoringInvoiceResponse])
async def list_invoices(
    company_id: str,
    status: Optional[FactoringStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(FactoringInvoice).where(FactoringInvoice.company_id == company_id)
    if status:
        q = q.where(FactoringInvoice.status == status)
    q = q.order_by(FactoringInvoice.invoice_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/{company_id}/invoices", response_model=FactoringInvoiceResponse)
async def create_invoice(
    company_id: str,
    data: FactoringInvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice = FactoringInvoice(company_id=company_id, **data.model_dump())
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.get("/{company_id}/invoices/{invoice_id}", response_model=FactoringInvoiceResponse)
async def get_invoice(
    company_id: str,
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice = await db.get(FactoringInvoice, invoice_id)
    if not invoice or str(invoice.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Fatura não encontrada")
    return invoice


@router.put("/{company_id}/invoices/{invoice_id}", response_model=FactoringInvoiceResponse)
async def update_invoice(
    company_id: str,
    invoice_id: str,
    data: FactoringInvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice = await db.get(FactoringInvoice, invoice_id)
    if not invoice or str(invoice.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Fatura não encontrada")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(invoice, k, v)
    if data.advance_rate and invoice.net_amount:
        invoice.advanced_amount = invoice.net_amount * data.advance_rate / 100
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.delete("/{company_id}/invoices/{invoice_id}")
async def delete_invoice(
    company_id: str,
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice = await db.get(FactoringInvoice, invoice_id)
    if not invoice or str(invoice.company_id) != company_id:
        raise HTTPException(status_code=404, detail="Fatura não encontrada")
    if invoice.status not in (FactoringStatus.DRAFT,):
        raise HTTPException(status_code=400, detail="Só é possível eliminar faturas em rascunho")
    await db.delete(invoice)
    await db.commit()
    return {"message": "Fatura eliminada"}


# --- Batches ---

@router.get("/{company_id}/batches", response_model=List[FactoringBatchResponse])
async def list_batches(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FactoringBatch)
        .where(FactoringBatch.company_id == company_id)
        .order_by(FactoringBatch.created_at.desc())
    )
    batches = result.scalars().all()
    response = []
    for batch in batches:
        count_res = await db.execute(
            select(func.count(FactoringInvoice.id))
            .where(FactoringInvoice.batch_id == batch.id)
        )
        count = count_res.scalar_one()
        r = FactoringBatchResponse.model_validate(batch)
        r.invoice_count = count
        response.append(r)
    return response


@router.post("/{company_id}/batches", response_model=FactoringBatchResponse)
async def create_batch(
    company_id: str,
    data: FactoringBatchCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    batch = FactoringBatch(
        company_id=company_id,
        batch_number=data.batch_number,
        factor_name=data.factor_name,
        notes=data.notes,
    )
    db.add(batch)
    await db.flush()

    total = Decimal("0")
    for inv_id in data.invoice_ids:
        inv = await db.get(FactoringInvoice, inv_id)
        if inv and str(inv.company_id) == company_id:
            inv.batch_id = batch.id
            inv.status = FactoringStatus.SUBMITTED
            total += inv.net_amount or Decimal("0")

    batch.total_amount = total
    await db.commit()
    await db.refresh(batch)
    r = FactoringBatchResponse.model_validate(batch)
    r.invoice_count = len(data.invoice_ids)
    return r
