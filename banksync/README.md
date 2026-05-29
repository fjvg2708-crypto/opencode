# DG BankSync Portugal

Sistema interno multiempresa de sincronização bancária PSD2 para Portugal.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | FastAPI + SQLAlchemy async |
| Frontend | Next.js 14 (App Router) + TailwindCSS |
| Base de Dados | PostgreSQL 16 |
| Cache | Redis 7 |
| Infraestrutura | Docker Compose |
| Autenticação | JWT + 2FA (TOTP/RFC 6238) |
| Integração Bancária | Salt Edge (PSD2 sandbox) |

## Funcionalidades

- **Autenticação segura** — JWT com refresh tokens + 2FA TOTP (Google Authenticator)
- **Multiempresa** — gestão de múltiplas empresas com RBAC (superadmin/admin/manager/viewer)
- **Integração PSD2** — Salt Edge sandbox para leitura de contas, saldos e movimentos
- **Importação manual** — suporte a CSV, XLSX, MT940, OFX, QIF como fallback
- **Módulo Factoring** — gestão de faturas para desconto e criação de lotes
- **Módulo Confirming** — ordens de pagamento a fornecedores via banco
- **Dashboards financeiros** — fluxo de caixa, saldos, KPIs, contrapartes, categorias
- **Estrutura PHC ready** — campos preparados para futura integração com PHC CS/GO

## Iniciar Rapidamente

```bash
cd banksync
cp .env.example .env
# Editar .env com as credenciais Salt Edge
bash scripts/start.sh
```

## Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Nginx | http://localhost:80 |

**Credenciais padrão:** `admin@dg-banksync.pt` / `Admin@12345`

## Configuração Salt Edge (Sandbox)

1. Registar em [saltedge.com](https://www.saltedge.com) e criar aplicação sandbox
2. Obter `App-id` e `Secret`
3. Configurar no `.env`:
   ```
   SALT_EDGE_APP_ID=seu_app_id
   SALT_EDGE_SECRET=seu_secret
   ```

## Estrutura

```
banksync/
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/       # Rotas (auth, banking, factoring, confirming, imports, dashboard)
│   │   ├── models/    # SQLAlchemy models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Lógica de negócio
│   │   └── core/      # Config, security
│   └── alembic/       # Migrações
├── frontend/          # Next.js 14
│   └── src/app/       # Páginas (App Router)
├── nginx/             # Reverse proxy
├── scripts/           # Seed, start
└── docker-compose.yml
```

## API Endpoints

| Módulo | Prefixo |
|--------|---------|
| Autenticação | `POST /api/v1/auth/login` |
| Empresas | `GET/POST /api/v1/companies` |
| Contas | `GET/POST /api/v1/banking/{company_id}/accounts` |
| Ligações PSD2 | `POST /api/v1/banking/{company_id}/connections/salt-edge` |
| Transações | `GET /api/v1/banking/{company_id}/transactions` |
| Factoring | `GET/POST /api/v1/factoring/{company_id}/invoices` |
| Confirming | `GET/POST /api/v1/confirming/{company_id}/orders` |
| Importação | `POST /api/v1/imports/{company_id}/upload` |
| Dashboard | `GET /api/v1/dashboard/{company_id}` |

## Integração PHC (Futura)

Os modelos já contêm os campos de mapeamento:
- `Company.phc_code`
- `FactoringInvoice.phc_invoice_id`
- `ConfirmingOrder.phc_purchase_id`

A integração via API REST do PHC CS/GO poderá ser adicionada em `app/services/phc_service.py`.
