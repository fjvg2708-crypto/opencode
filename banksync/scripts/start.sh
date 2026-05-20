#!/bin/bash
set -e

echo "🚀 A iniciar DG BankSync Portugal..."

# Copy env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Ficheiro .env criado a partir de .env.example - configure as variáveis!"
fi

# Start services
docker compose up -d db redis
echo "⏳ A aguardar PostgreSQL..."
sleep 5

# Run seed
docker compose run --rm backend python /app/../scripts/seed.py 2>/dev/null || true

# Start all services
docker compose up -d

echo ""
echo "✅ DG BankSync Portugal iniciado!"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  Swagger UI: http://localhost:8000/docs"
echo "  Nginx: http://localhost:80"
echo ""
echo "  Credenciais padrão:"
echo "  Email: admin@dg-banksync.pt"
echo "  Senha: Admin@12345"
