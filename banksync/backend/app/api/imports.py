import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.import_file import FileImport, ImportStatus
from app.services.import_service import detect_file_type, process_file_import
from app.core.config import settings

router = APIRouter(prefix="/imports", tags=["Importação"])


@router.get("/{company_id}", response_model=List[dict])
async def list_imports(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FileImport)
        .where(FileImport.company_id == company_id)
        .order_by(FileImport.created_at.desc())
        .limit(100)
    )
    imports = result.scalars().all()
    return [
        {
            "id": str(i.id),
            "filename": i.filename,
            "file_type": i.file_type,
            "status": i.status,
            "records_total": i.records_total,
            "records_imported": i.records_imported,
            "records_skipped": i.records_skipped,
            "error_message": i.error_message,
            "created_at": i.created_at.isoformat(),
        }
        for i in imports
    ]


@router.post("/{company_id}/upload")
async def upload_bank_file(
    company_id: str,
    account_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.size and file.size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ficheiro demasiado grande")

    content = await file.read()
    file_type = detect_file_type(file.filename or "file.csv", content)

    upload_dir = os.path.join(settings.UPLOAD_DIR, company_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(content)

    file_import = FileImport(
        company_id=company_id,
        account_id=account_id,
        filename=file.filename or "upload",
        file_type=file_type,
        file_path=file_path,
        file_size=len(content),
        status=ImportStatus.PENDING,
        imported_by_id=current_user.id,
    )
    db.add(file_import)
    await db.commit()
    await db.refresh(file_import)

    file_import = await process_file_import(db, file_import, content, account_id)

    return {
        "id": str(file_import.id),
        "status": file_import.status,
        "records_imported": file_import.records_imported,
        "records_total": file_import.records_total,
        "error_message": file_import.error_message,
    }
