# Plataforma de Gestão de Ativos — Grupo DG

Sistema próprio e autónomo para gestão de viaturas, máquinas, equipamentos,
ferramentas e ativos do Grupo DG. Ver **[ARCHITECTURE.md](./ARCHITECTURE.md)**
para o resumo executivo, modelo de dados, regras de negócio e plano por
fases completos.

## Arranque rápido

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d db redis minio

cd apps/api
npm install
npx prisma migrate dev
npm run seed
npm run start:dev

# noutro terminal
cd apps/web
npm install
npm run dev
```

- API: http://localhost:3000/api/v1 — Swagger: http://localhost:3000/api/docs
- Web (PWA): http://localhost:5173
- Utilizador de arranque: `admin@grupodg.pt` / definido em
  `SEED_ADMIN_PASSWORD` (ver `apps/api/prisma/seed.ts`)

## Estrutura

```
apps/api      NestJS — API própria, autónoma, sem dependência de ERP
apps/web      React + Vite — PWA responsiva com fila offline
packages/shared  Tipos partilhados frontend/backend
```

Cada módulo de negócio vive em `apps/api/src/modules/<nome>` com separação
`domain / application / infrastructure / interface` (ver ARCHITECTURE.md §3).
