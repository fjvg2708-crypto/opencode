from typing import Optional, List
from sqlalchemy import String, Boolean, Enum as SAEnum
from sqlalchemy.orm import mapped_column, Mapped, relationship
import enum

from app.db.session import Base
from app.models.base import UUIDMixin, TimestampMixin


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.VIEWER)

    # 2FA
    totp_secret: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    totp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    company_memberships: Mapped[List["UserCompany"]] = relationship(
        "UserCompany", back_populates="user", cascade="all, delete-orphan"
    )


class UserCompany(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_companies"

    from sqlalchemy import ForeignKey
    from sqlalchemy.dialects.postgresql import UUID

    user_id: Mapped["uuid.UUID"] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    company_id: Mapped["uuid.UUID"] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.VIEWER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship("User", back_populates="company_memberships")
    company: Mapped["Company"] = relationship("Company", back_populates="user_memberships")
