from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.models.confirming import ConfirmingStatus


class ConfirmingOrderCreate(BaseModel):
    order_number: str
    bank_name: str
    supplier_name: str
    supplier_nif: Optional[str] = None
    supplier_iban: Optional[str] = None
    invoice_number: str
    invoice_date: date
    due_date: date
    gross_amount: Decimal
    vat_amount: Decimal = Decimal("0")
    net_amount: Decimal
    early_payment_discount: Optional[Decimal] = None
    notes: Optional[str] = None
    phc_purchase_id: Optional[str] = None


class ConfirmingOrderUpdate(BaseModel):
    supplier_iban: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[ConfirmingStatus] = None
    payment_date: Optional[date] = None
    early_payment_discount: Optional[Decimal] = None
    notes: Optional[str] = None


class ConfirmingOrderResponse(BaseModel):
    id: str
    company_id: str
    order_number: str
    bank_name: str
    supplier_name: str
    supplier_nif: Optional[str]
    supplier_iban: Optional[str]
    invoice_number: str
    invoice_date: date
    due_date: date
    gross_amount: Decimal
    vat_amount: Decimal
    net_amount: Decimal
    early_payment_discount: Optional[Decimal]
    payment_date: Optional[date]
    status: ConfirmingStatus
    notes: Optional[str]
    phc_purchase_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
