# Operações e Manutenção — Intelligent Portfolio

Este documento descreve os procedimentos operacionais para manter o sistema em produção.

## 1. Backup e Recuperação (Database)

O projeto utiliza **Neon (PostgreSQL)**.

### Backup Manual (Via CLI)
Caso precise de um dump local:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Automatizado (Recomendado)
A Neon oferece **Snapshots automáticos** e **Point-in-Time Recovery (PITR)**. Verifique o console da Neon para configurar políticas de retenção.

### Restore
Para restaurar um dump:
```bash
psql $DATABASE_URL < backup_file.sql
```

---

## 2. Logs e Observabilidade

### Níveis de Log
Configure a variável `LOG_LEVEL` no backend (`error`, `warn`, `info`, `debug`).

### Localização dos Logs
Em produção (Vercel/Render/Heroku), os logs são capturados via `stdout/stderr`.
Para sistemas autohospedados, recomendamos redirecionar para arquivos ou usar ferramentas como **PM2**:
```bash
pm2 start dist/index.js --name "ip-backend" --log logs/backend.log
```

### Request-ID
Cada requisição gera um ID único (em breve) para facilitar o rastreamento de erros entre frontend e backend.

---

## 3. Webhooks do Stripe

### Monitoramento
Verifique falhas nos webhooks diretamente no **Stripe Dashboard > Developers > Webhooks**.

### Redelivre (Retries)
O Stripe tenta reenviar webhooks falhos automaticamente por até 3 dias. Caso precise reenviar manualmente:
1. Vá no evento falho no Stripe.
2. Clique em "Resend".

---

## 4. Troubleshooting Comum

### Erro: 403 Requires Subscription
- **Causa:** Usuário sem assinatura ativa e trial expirado.
- **Solução:** Verificar `subscription_status` no banco. Se o usuário pagou, verifique os logs do Webhook.

### Erro: YahooFinance fetch error
- **Causa:** Erro na biblioteca de cotações em background.
- **Solução:** O sistema tenta novamente automaticamente. Verifique a conectividade do servidor com a internet.

### Erro: JWT Expired
- **Causa:** Token do usuário expirou.
- **Solução:** O frontend deve redirecionar para o login. Se persistir, limpe o `localStorage`.

---

## 5. Atualização do Sistema

1. **Pull** da última versão.
2. **Backend:** `npm install && npm run build`.
3. **Migrações:** O sistema roda migrações automaticamente no start (revisar `migrate.ts`).
4. **Restart** do processo.
