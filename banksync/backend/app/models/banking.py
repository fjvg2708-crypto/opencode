from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime
from sqlalchemy import String, Boolean, Text, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import mapped_column, Mapped, relationship
import enum
import uuid

from app.db.session import Base
from app.models.base import UUIDMixin, TimestampMixin


class ConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class AccountType(str, enum.Enum):
    CHECKING = "checking"
    SAVINGS = "savings"
    CREDIT = "credit"
    INVESTMENT = "investment"
    OTHER = "other"


class TransactionType(str, enum.Enum):
    DEBIT = "debit"
    CREDIT = "credit"


class BankConnection(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bank_connections"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    salt_edge_connection_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    salt_edge_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[ConnectionStatus] = mapped_column(
        SAEnum(ConnectionStatus), default=ConnectionStatus.PENDING
    )
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    consent_expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    company: Mapped["Company"] = relationship("Company", back_populates="bank_connections")
    bank_accounts: Mapped[List["BankAccount"]] = relationship(
        "BankAccount", back_populates="connection", cascade="all, delete-orphan"
    )


class BankAccount(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bank_accounts"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    connection_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bank_connections.id", ondelete="SET NULL"), nullable=True
    )
    salt_edge_account_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    iban: Mapped[Optional[str]] = mapped_column(String(34), nullable=True)
    account_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    account_type: Mapped[AccountType] = mapped_column(
        SAEnum(AccountType), default=AccountType.CHECKING
    )
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    available_balance: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    bank_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_manual: Mapped[bool] = mapped_column(Boolean, default=False)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    company: Mapped["Company"] = relationship("Company", back_populates="bank_accounts")
    connection: Mapped[Optional["BankConnection"]] = relationship(
        "BankConnection", back_populates="bank_accounts"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )


class Transaction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transactions"

    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bank_accounts.id", ondelete="CASCADE"), nullable=False
    )
    salt_edge_transaction_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR")
    transaction_type: Mapped[TransactionType] = mapped_column(SAEnum(TransactionType), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    counterparty_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    counterparty_iban: Mapped[Optional[str]] = mapped_column(String(34), nullable=True)
    value_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    balance_after: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_pending: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    account: Mapped["BankAccount"] = relationship("BankAccount", back_populates="transactions")
