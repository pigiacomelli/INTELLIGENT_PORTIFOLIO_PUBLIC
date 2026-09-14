# Guia de Resposta a Incidentes (Runbook)

Este documento define as diretrizes para resposta a incidentes de produção no Antighravity.

## Canais de Alerta (SEV)
- Todos os alertas críticos (`SEV1` e `SEV2`) são disparados via `ALERT_WEBHOOK_URL` pelo `alertService`.
- **Canal de Destino:** Discord ou Slack configurado no ambiente de produção.
- **gatilhos Autmatizados:** 
  - Erros Críticos `5xx` na API.
  - Indisponibilidade do Banco de Dados no `/health`.
  - Falhas no Webhook do Stripe.

## Responsáveis pela Resposta
- Durante o lançamento (Go-Live), a equipe fundadora e engenheiros de plantão são responsáveis imediatos por mitigar incidentes de alta severidade.
- Todo alerta dispara uma notificação imediata. O responsável disponível deve registrar o recebimento no canal.

## Procedimentos Básicos
1. **Identificação:** Checar os logs no provedor usando o `request-id` correspondente ao alerta.
2. **Mitigação:** Se o erro estiver ligado a um deploy recente, realizar o rollback para a versão anterior imediatamente.
3. **Resolução:** Compreender o erro através dos logs estruturados e aplicar correção emergencial.
