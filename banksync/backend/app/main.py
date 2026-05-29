from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base
from app.models import *  # noqa: F401 - ensure all models are registered
from app.api import auth, companies, banking, factoring, confirming, imports, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Sistema interno multiempresa de sincronização bancária PSD2",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(banking.router, prefix="/api/v1")
app.include_router(factoring.router, prefix="/api/v1")
app.include_router(confirming.router, prefix="/api/v1")
app.include_router(imports.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
