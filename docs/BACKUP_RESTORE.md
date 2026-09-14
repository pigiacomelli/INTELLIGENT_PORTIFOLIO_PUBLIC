# Backup and Restore Procedures - INTELLIGENT_PORTIFOLIO

## Dados do Banco de Dados (NeonDB)

### Backup Automático
O NeonDB realiza backups automáticos point-in-time (PITR).
- **Frequência:** Contínua.
- **Retenção:** 7 dias (plano gratuito/standard).
- **Como restaurar:** Use a aba "History" no dashboard do Neon para criar um novo "Branch" a partir de um momento específico no passado.

### Backup Manual (Dump)
Para backups externos de segurança:
```bash
pg_dump -h [HOST] -U [USER] [DB_NAME] > backup_$(date +%Y%m%d).sql
```
As credenciais estão no `.env` (DATABASE_URL).

### Restauração Manual
```bash
psql -h [HOST] -U [USER] [DB_NAME] < backup_file.sql
```

## Configurações e Segredos
Os arquivos `.env` não estão no Git.
**Ação:** Mantenha uma cópia segura (ex.: 1Password ou AWS Secrets Manager) dos seguintes segredos:
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_GENAI_KEY`
- `ALERT_WEBHOOK_URL`
