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


class FactoringStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    ADVANCED = "advanced"
    COLLECTED = "collected"
    CANCELLED = "cancelled"


class FactoringBatchStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FactoringInvoice(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "factoring_invoices"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    batch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("factoring_batches.id", ondelete="SET NULL"), nullable=True
    )
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False)
    debtor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    debtor_nif: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    debtor_iban: Mapped[Optional[str]] = mapped_column(String(34), nullable=True)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    vat_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    advance_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    advanced_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    fee_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[FactoringStatus] = mapped_column(
        SAEnum(FactoringStatus), default=FactoringStatus.DRAFT
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phc_invoice_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    company: Mapped["Company"] = relationship("Company", back_populates="factoring_invoices")
    batch: Mapped[Optional["FactoringBatch"]] = relationship(
        "FactoringBatch", back_populates="invoices"
    )


class FactoringBatch(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "factoring_batches"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    batch_number: Mapped[str] = mapped_column(String(100), nullable=False)
    factor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_advanced: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[FactoringBatchStatus] = mapped_column(
        SAEnum(FactoringBatchStatus), default=FactoringBatchStatus.DRAFT
    )
    submission_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    invoices: Mapped[List["FactoringInvoice"]] = relationship(
        "FactoringInvoice", back_populates="batch"
    )
