# Configuração de Produção - Intelligent Portfolio

## Variáveis de Ambiente (Backend)
- `PORT`: 3001 (ou conforme heroku/vps)
- `DATABASE_URL`: Connection string do Neon.tech
- `JWT_SECRET`: String aleatória segura (mínimo 32 chars)
- `GEMINI_API_KEY`: Chave da Google AI
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `STRIPE_WEBHOOK_SECRET`: Segredo do webhook do Stripe
- `FRONTEND_URL`: URL final do app (ex: https://app.intelligentportfolio.com.br)

## Variáveis de Ambiente (Frontend)
- `VITE_API_URL`: URL do backend (ex: https://api.intelligentportfolio.com.br)
- `VITE_STRIPE_PUBLIC_KEY`: Chave pública do Stripe

## Migrações de Banco
Para aplicar migrações:
```bash
npm run migrate
```
Para reverter a última migração:
```bash
npm run migrate -- down
```

## Backup e Restore
O Neon.tech gerencia backups automáticos (Point-in-Time Recovery).
Para backup manual via CLI:
```bash
pg_dump $DATABASE_URL > backup.sql
```
