from typing import Optional, List
from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship

from app.db.session import Base
from app.models.base import UUIDMixin, TimestampMixin


class Company(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    nif: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    phc_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user_memberships: Mapped[List["UserCompany"]] = relationship(
        "UserCompany", back_populates="company", cascade="all, delete-orphan"
    )
    bank_connections: Mapped[List["BankConnection"]] = relationship(
        "BankConnection", back_populates="company", cascade="all, delete-orphan"
    )
    bank_accounts: Mapped[List["BankAccount"]] = relationship(
        "BankAccount", back_populates="company", cascade="all, delete-orphan"
    )
    factoring_invoices: Mapped[List["FactoringInvoice"]] = relationship(
        "FactoringInvoice", back_populates="company", cascade="all, delete-orphan"
    )
    confirming_orders: Mapped[List["ConfirmingOrder"]] = relationship(
        "ConfirmingOrder", back_populates="company", cascade="all, delete-orphan"
    )
    file_imports: Mapped[List["FileImport"]] = relationship(
        "FileImport", back_populates="company", cascade="all, delete-orphan"
    )
