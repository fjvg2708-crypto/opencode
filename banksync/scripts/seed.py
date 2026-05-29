#!/usr/bin/env python3
"""Seed inicial da base de dados com dados de exemplo."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import AsyncSessionLocal, engine, Base
from app.models import *
from app.core.security import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create superadmin
        from sqlalchemy import select
        existing = await db.execute(select(User).where(User.email == "admin@dg-banksync.pt"))
        if not existing.scalar_one_or_none():
            admin = User(
                email="admin@dg-banksync.pt",
                full_name="Administrador DG",
                hashed_password=hash_password("Admin@12345"),
                role=UserRole.SUPERADMIN,
                is_active=True,
            )
            db.add(admin)
            await db.flush()

            # Create sample company
            company = Company(
                name="DG Holding, Lda.",
                nif="500123456",
                email="contabilidade@dg-holding.pt",
                phone="+351 21 000 0000",
                address="Av. da Liberdade, 100, 1250-145 Lisboa",
            )
            db.add(company)
            await db.flush()

            membership = UserCompany(
                user_id=admin.id,
                company_id=company.id,
                role=UserRole.SUPERADMIN,
            )
            db.add(membership)

            # Sample manual bank account
            account = BankAccount(
                company_id=company.id,
                name="Conta Principal CGD",
                iban="PT50003300001234567890123",
                bank_name="Caixa Geral de Depósitos",
                currency="EUR",
                balance=125000.00,
                available_balance=124500.00,
                is_manual=True,
                is_active=True,
            )
            db.add(account)

            await db.commit()
            print("✓ Seed concluído!")
            print("  Email: admin@dg-banksync.pt")
            print("  Senha: Admin@12345")
        else:
            print("✓ Base de dados já tem dados de seed")


if __name__ == "__main__":
    asyncio.run(seed())
