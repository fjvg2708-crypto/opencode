from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime
from app.models.banking import ConnectionStatus, AccountType, TransactionType


class BankConnectionCreate(BaseModel):
    provider_name: str
    provider_code: Optional[str] = None


class BankConnectionResponse(BaseModel):
    id: str
    company_id: str
    provider_name: str
    provider_code: Optional[str]
    status: ConnectionStatus
    last_sync_at: Optional[datetime]
    consent_expires_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class SaltEdgeConnectResponse(BaseModel):
    connect_url: str
    connection_id: Optional[str] = None


class BankAccountCreate(BaseModel):
    name: str
    iban: Optional[str] = None
    account_number: Optional[str] = None
    currency: str = "EUR"
    account_type: AccountType = AccountType.CHECKING
    bank_name: Optional[str] = None
    is_manual: bool = True


class BankAccountUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    bank_name: Optional[str] = None


class BankAccountResponse(BaseModel):
    id: str
    company_id: str
    name: str
    iban: Optional[str]
    account_number: Optional[str]
    currency: str
    account_type: AccountType
    balance: Decimal
    available_balance: Optional[Decimal]
    bank_name: Optional[str]
    is_active: bool
    is_manual: bool
    last_synced_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionResponse(BaseModel):
    id: str
    account_id: str
    amount: Decimal
    currency: str
    transaction_type: TransactionType
    description: Optional[str]
    category: Optional[str]
    counterparty_name: Optional[str]
    counterparty_iban: Optional[str]
    value_date: Optional[date]
    booking_date: date
    balance_after: Optional[Decimal]
    reference: Optional[str]
    is_pending: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionFilter(BaseModel):
    account_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    transaction_type: Optional[TransactionType] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    search: Optional[str] = None
    page: int = 1
    page_size: int = 50
