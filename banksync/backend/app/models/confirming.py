from typing import Optional, List
from decimal import Decimal
from datetime import date
from sqlalchemy import String, Text, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
import enum
import uuid

from app.db.session import Base
from app.models.base import UUIDMixin, TimestampMixin


class ConfirmingStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    PAID = "paid"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class ConfirmingOrder(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "confirming_orders"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    order_number: Mapped[str] = mapped_column(String(100), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(255), nullable=False)
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    supplier_nif: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    supplier_iban: Mapped[Optional[str]] = mapped_column(String(34), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    vat_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    early_payment_discount: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    payment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[ConfirmingStatus] = mapped_column(
        SAEnum(ConfirmingStatus), default=ConfirmingStatus.DRAFT
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phc_purchase_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    company: Mapped["Company"] = relationship("Company", back_populates="confirming_orders")
