from pydantic import BaseModel
from typing import List, Dict, Optional
from decimal import Decimal
from datetime import date


class AccountSummary(BaseModel):
    total_accounts: int
    total_balance: Decimal
    currency: str = "EUR"


class TransactionSummary(BaseModel):
    total_credits: Decimal
    total_debits: Decimal
    net_flow: Decimal
    transaction_count: int


class CashFlowPoint(BaseModel):
    date: date
    credits: Decimal
    debits: Decimal
    balance: Decimal


class FactoringSummary(BaseModel):
    total_invoices: int
    total_amount: Decimal
    pending_amount: Decimal
    advanced_amount: Decimal


class ConfirmingSummary(BaseModel):
    total_orders: int
    total_amount: Decimal
    pending_amount: Decimal
    paid_amount: Decimal


class DashboardResponse(BaseModel):
    company_id: str
    company_name: str
    accounts: AccountSummary
    transactions_30d: TransactionSummary
    cash_flow: List[CashFlowPoint]
    factoring: FactoringSummary
    confirming: ConfirmingSummary
    top_counterparties: List[Dict]
    category_breakdown: List[Dict]
