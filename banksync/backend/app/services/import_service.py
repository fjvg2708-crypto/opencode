import os
import csv
import io
from typing import List, Dict, Any, Optional
from datetime import date, datetime
from decimal import Decimal
import pandas as pd

from app.models.banking import Transaction, TransactionType, BankAccount
from app.models.import_file import FileImport, ImportStatus, ImportFileType


def detect_file_type(filename: str, content: bytes) -> ImportFileType:
    ext = filename.lower().rsplit(".", 1)[-1]
    mapping = {
        "ofx": ImportFileType.OFX,
        "qif": ImportFileType.QIF,
        "mt940": ImportFileType.MT940,
        "sta": ImportFileType.MT940,
        "csv": ImportFileType.CSV,
        "xlsx": ImportFileType.XLSX,
        "xls": ImportFileType.XLSX,
        "xml": ImportFileType.CAMT053,
    }
    return mapping.get(ext, ImportFileType.CSV)


def parse_csv(content: bytes, account_id: str) -> List[Dict[str, Any]]:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text), delimiter=";")
    transactions = []
    for row in reader:
        amount_str = row.get("Montante", row.get("Amount", row.get("Valor", "0")))
        amount_str = amount_str.replace(".", "").replace(",", ".").strip()
        try:
            amount = Decimal(amount_str)
        except Exception:
            continue
        t_type = TransactionType.CREDIT if amount >= 0 else TransactionType.DEBIT
        date_str = row.get("Data", row.get("Date", row.get("Data Mov", "")))
        try:
            booking_date = datetime.strptime(date_str.strip(), "%d/%m/%Y").date()
        except Exception:
            try:
                booking_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
            except Exception:
                booking_date = date.today()
        transactions.append({
            "account_id": account_id,
            "amount": abs(amount),
            "currency": "EUR",
            "transaction_type": t_type,
            "description": row.get("Descricao", row.get("Description", row.get("Descrição", ""))),
            "counterparty_name": row.get("Entidade", row.get("Counterparty", "")),
            "booking_date": booking_date,
            "reference": row.get("Referencia", row.get("Reference", "")),
        })
    return transactions


def parse_xlsx(content: bytes, account_id: str) -> List[Dict[str, Any]]:
    df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
    transactions = []
    col_map = {c.lower().strip(): c for c in df.columns}
    date_col = next((col_map[k] for k in ["data", "date", "data mov"] if k in col_map), None)
    amount_col = next((col_map[k] for k in ["montante", "amount", "valor", "debito/credito"] if k in col_map), None)
    desc_col = next((col_map[k] for k in ["descricao", "description", "descrição", "descr"] if k in col_map), None)

    for _, row in df.iterrows():
        if amount_col is None:
            continue
        try:
            amount = Decimal(str(row[amount_col]).replace(",", ".").replace(" ", ""))
        except Exception:
            continue
        t_type = TransactionType.CREDIT if amount >= 0 else TransactionType.DEBIT
        booking_date = date.today()
        if date_col:
            try:
                d = row[date_col]
                if isinstance(d, (datetime, pd.Timestamp)):
                    booking_date = d.date()
                else:
                    booking_date = datetime.strptime(str(d).strip(), "%d/%m/%Y").date()
            except Exception:
                pass
        transactions.append({
            "account_id": account_id,
            "amount": abs(amount),
            "currency": "EUR",
            "transaction_type": t_type,
            "description": str(row[desc_col]) if desc_col else "",
            "booking_date": booking_date,
        })
    return transactions


def parse_mt940(content: bytes, account_id: str) -> List[Dict[str, Any]]:
    text = content.decode("latin-1", errors="replace")
    transactions = []
    lines = text.splitlines()
    current: Dict[str, Any] = {}
    for line in lines:
        if line.startswith(":61:"):
            # :61:YYMMDDMMDDDC Amount Reference
            body = line[4:]
            try:
                booking = datetime.strptime(body[:6], "%y%m%d").date()
                dc = "C" if "C" in body[10:12] else "D"
                amount_part = body[12:].split("N")[0].replace(",", ".")
                amount = Decimal(amount_part)
                current = {
                    "account_id": account_id,
                    "amount": amount,
                    "currency": "EUR",
                    "transaction_type": TransactionType.CREDIT if dc == "C" else TransactionType.DEBIT,
                    "booking_date": booking,
                }
            except Exception:
                current = {}
        elif line.startswith(":86:") and current:
            current["description"] = line[4:100]
            transactions.append(current)
            current = {}
    return transactions


async def process_file_import(
    db,
    file_import: FileImport,
    content: bytes,
    account_id: str,
) -> FileImport:
    from sqlalchemy import select
    file_import.status = ImportStatus.PROCESSING
    await db.commit()

    try:
        if file_import.file_type == ImportFileType.CSV:
            raw_txns = parse_csv(content, account_id)
        elif file_import.file_type == ImportFileType.XLSX:
            raw_txns = parse_xlsx(content, account_id)
        elif file_import.file_type == ImportFileType.MT940:
            raw_txns = parse_mt940(content, account_id)
        else:
            raw_txns = parse_csv(content, account_id)

        file_import.records_total = len(raw_txns)
        imported = 0
        for txn_data in raw_txns:
            txn = Transaction(**txn_data)
            db.add(txn)
            imported += 1

        await db.commit()
        file_import.records_imported = imported
        file_import.status = ImportStatus.COMPLETED
    except Exception as e:
        file_import.status = ImportStatus.FAILED
        file_import.error_message = str(e)

    await db.commit()
    return file_import
