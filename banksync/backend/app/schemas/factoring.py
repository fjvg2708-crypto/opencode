from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime
from app.models.factoring import FactoringStatus, FactoringBatchStatus


class FactoringInvoiceCreate(BaseModel):
    invoice_number: str
    debtor_name: str
    debtor_nif: Optional[str] = None
    debtor_iban: Optional[str] = None
    invoice_date: date
    due_date: date
    gross_amount: Decimal
    vat_amount: Decimal = Decimal("0")
    net_amount: Decimal
    advance_rate: Optional[Decimal] = None
    notes: Optional[str] = None
    phc_invoice_id: Optional[str] = None


class FactoringInvoiceUpdate(BaseModel):
    debtor_name: Optional[str] = None
    due_date: Optional[date] = None
    advance_rate: Optional[Decimal] = None
    status: Optional[FactoringStatus] = None
    notes: Optional[str] = None


class FactoringInvoiceResponse(BaseModel):
    id: str
    company_id: str
    batch_id: Optional[str]
    invoice_number: str
    debtor_name: str
    debtor_nif: Optional[str]
    debtor_iban: Optional[str]
    invoice_date: date
    due_date: date
    gross_amount: Decimal
    vat_amount: Decimal
    net_amount: Decimal
    advance_rate: Optional[Decimal]
    advanced_amount: Optional[Decimal]
    fee_amount: Optional[Decimal]
    status: FactoringStatus
    notes: Optional[str]
    phc_invoice_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class FactoringBatchCreate(BaseModel):
    batch_number: str
    factor_name: str
    invoice_ids: List[str]
    notes: Optional[str] = None


class FactoringBatchResponse(BaseModel):
    id: str
    company_id: str
    batch_number: str
    factor_name: str
    total_amount: Decimal
    total_advanced: Optional[Decimal]
    status: FactoringBatchStatus
    submission_date: Optional[date]
    notes: Optional[str]
    invoice_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
