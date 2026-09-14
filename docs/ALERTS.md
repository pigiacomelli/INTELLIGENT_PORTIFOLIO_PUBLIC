# Alerts Policy - INTELLIGENT_PORTIFOLIO

## Canais de Alerta
- **Slack/Discord Webhook:** `#alerts-prod` (Configurado via `ALERT_WEBHOOK_URL`).
- **Logs Estruturados:** Todos os alertas são logados com prefixo `[ALERT]`.

## Severidades

### SEV1 (Crítico)
- **Critério:** App fora do ar, banco de dados inacessível, 500 em rotas críticas (auth, payments).
- **Resposta:** Intervenção imediata (< 1h).
- **Canal:** Webhook + Notificação Push (se disponível).

### SEV2 (Importante)
- **Critério:** Falha em webhooks do Stripe, erro em 10% das requisições, latência > 2s.
- **Resposta:** Investigação no mesmo dia útil.
- **Canal:** Webhook.

### SEV3 (Informativo)
- **Critério:** Falha pontual em job de atualização de preços, erro de validação de formulário (alta taxa).
- **Resposta:** Revisão semanal.
- **Canal:** Logs.
