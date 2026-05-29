from typing import List, Dict, Any
from decimal import Decimal
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.banking import BankAccount, Transaction, TransactionType
from app.models.factoring import FactoringInvoice, FactoringStatus
from app.models.confirming import ConfirmingOrder, ConfirmingStatus
from app.models.company import Company
from app.schemas.dashboard import (
    DashboardResponse, AccountSummary, TransactionSummary,
    CashFlowPoint, FactoringSummary, ConfirmingSummary
)


async def get_dashboard(db: AsyncSession, company_id: str) -> DashboardResponse:
    company = await db.get(Company, company_id)
    if not company:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    # Accounts summary
    accs_result = await db.execute(
        select(func.count(BankAccount.id), func.coalesce(func.sum(BankAccount.balance), 0))
        .where(and_(BankAccount.company_id == company_id, BankAccount.is_active == True))
    )
    acc_count, total_balance = accs_result.one()

    # Transactions last 30 days
    thirty_days_ago = date.today() - timedelta(days=30)
    txn_result = await db.execute(
        select(
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.amount).filter(Transaction.transaction_type == TransactionType.CREDIT), 0),
            func.coalesce(func.sum(Transaction.amount).filter(Transaction.transaction_type == TransactionType.DEBIT), 0),
        )
        .join(BankAccount, Transaction.account_id == BankAccount.id)
        .where(
            and_(
                BankAccount.company_id == company_id,
                Transaction.booking_date >= thirty_days_ago,
            )
        )
    )
    txn_count, total_credits, total_debits = txn_result.one()

    # Cash flow last 30 days grouped by day
    cf_result = await db.execute(
        select(
            Transaction.booking_date,
            func.coalesce(func.sum(Transaction.amount).filter(Transaction.transaction_type == TransactionType.CREDIT), 0),
            func.coalesce(func.sum(Transaction.amount).filter(Transaction.transaction_type == TransactionType.DEBIT), 0),
        )
        .join(BankAccount, Transaction.account_id == BankAccount.id)
        .where(
            and_(
                BankAccount.company_id == company_id,
                Transaction.booking_date >= thirty_days_ago,
            )
        )
        .group_by(Transaction.booking_date)
        .order_by(Transaction.booking_date)
    )
    cash_flow = [
        CashFlowPoint(
            date=row[0],
            credits=Decimal(str(row[1])),
            debits=Decimal(str(row[2])),
            balance=Decimal(str(row[1])) - Decimal(str(row[2])),
        )
        for row in cf_result.all()
    ]

    # Factoring
    fact_result = await db.execute(
        select(
            func.count(FactoringInvoice.id),
            func.coalesce(func.sum(FactoringInvoice.net_amount), 0),
            func.coalesce(func.sum(FactoringInvoice.net_amount).filter(
                FactoringInvoice.status.in_([FactoringStatus.DRAFT, FactoringStatus.SUBMITTED])
            ), 0),
            func.coalesce(func.sum(FactoringInvoice.advanced_amount), 0),
        )
        .where(FactoringInvoice.company_id == company_id)
    )
    fact_row = fact_result.one()

    # Confirming
    conf_result = await db.execute(
        select(
            func.count(ConfirmingOrder.id),
            func.coalesce(func.sum(ConfirmingOrder.net_amount), 0),
            func.coalesce(func.sum(ConfirmingOrder.net_amount).filter(
                ConfirmingOrder.status.in_([ConfirmingStatus.DRAFT, ConfirmingStatus.SENT])
            ), 0),
            func.coalesce(func.sum(ConfirmingOrder.net_amount).filter(
                ConfirmingOrder.status == ConfirmingStatus.PAID
            ), 0),
        )
        .where(ConfirmingOrder.company_id == company_id)
    )
    conf_row = conf_result.one()

    # Top counterparties
    cp_result = await db.execute(
        select(
            Transaction.counterparty_name,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(BankAccount, Transaction.account_id == BankAccount.id)
        .where(
            and_(
                BankAccount.company_id == company_id,
                Transaction.counterparty_name.isnot(None),
                Transaction.booking_date >= thirty_days_ago,
            )
        )
        .group_by(Transaction.counterparty_name)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(10)
    )
    top_counterparties = [
        {"name": r[0], "total": float(r[1]), "count": r[2]}
        for r in cp_result.all()
    ]

    # Category breakdown
    cat_result = await db.execute(
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(BankAccount, Transaction.account_id == BankAccount.id)
        .where(
            and_(
                BankAccount.company_id == company_id,
                Transaction.booking_date >= thirty_days_ago,
            )
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(10)
    )
    category_breakdown = [
        {"category": r[0] or "Sem categoria", "total": float(r[1]), "count": r[2]}
        for r in cat_result.all()
    ]

    return DashboardResponse(
        company_id=str(company_id),
        company_name=company.name,
        accounts=AccountSummary(
            total_accounts=acc_count,
            total_balance=Decimal(str(total_balance)),
        ),
        transactions_30d=TransactionSummary(
            total_credits=Decimal(str(total_credits)),
            total_debits=Decimal(str(total_debits)),
            net_flow=Decimal(str(total_credits)) - Decimal(str(total_debits)),
            transaction_count=txn_count,
        ),
        cash_flow=cash_flow,
        factoring=FactoringSummary(
            total_invoices=fact_row[0],
            total_amount=Decimal(str(fact_row[1])),
            pending_amount=Decimal(str(fact_row[2])),
            advanced_amount=Decimal(str(fact_row[3])),
        ),
        confirming=ConfirmingSummary(
            total_orders=conf_row[0],
            total_amount=Decimal(str(conf_row[1])),
            pending_amount=Decimal(str(conf_row[2])),
            paid_amount=Decimal(str(conf_row[3])),
        ),
        top_counterparties=top_counterparties,
        category_breakdown=category_breakdown,
    )
