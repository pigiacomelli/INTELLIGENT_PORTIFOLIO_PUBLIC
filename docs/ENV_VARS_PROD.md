# Guia de Variáveis de Ambiente (Produção)

Este documento consolida as variáveis de ambiente necessárias para a operação do Antighravity em Go-Live (Produção).
Ele serve como a referência única e obrigatória para a configuração dos serviços.

## Frontend (Vercel)

Apenas variáveis públicas. As secrets são geridas pelo backend.

| Variável | Obrigatoriedade | Descrição | Valor Esperado (Produção) |
|---|---|---|---|
| `VITE_API_URL` | **Obrigatória** | URL base para comunicação com o backend em produção. | `https://api.seudominio.com` (exemplo) |

*Nota: O frontend redireciona o fluxo de pagamentos diretamente pelas sessões criadas no backend, portanto não exige chaves públicas do Stripe no client-side (`VITE_STRIPE_PUBLIC_KEY` foi descontinuada).*

## Backend (Render / VPS)

Contém chaves de API, credenciais de banco e configurações críticas operacionais.

| Grupo / Variável | Obrigatoriedade | Descrição |
|---|---|---|
| **Core** | | |
| `NODE_ENV` | **Obrigatória** | Define o ambiente. Em produção, deve ser estritamente `production`. |
| `PORT` | Opcional | Porta do servidor web. Padrão no Render costuma ser ignorada ou injetada automaticamente. |
| `DATABASE_URL` | **Obrigatória** | String de conexão com o banco PostgreSQL (ex: Neon). Deve conter `?sslmode=require`. |
| `JWT_SECRET` | **Obrigatória** | Segredo criptográfico forte para assinatura dos tokens. |
| `FRONTEND_URL` | **Obrigatória** | URL do frontend permitida no CORS e usada nos redirecionamentos do Stripe. |
| **Data Providers** | | |
| `BRAPI_API_KEY` | **Obrigatória** | Chave da API da BRAPI para buscar cotações B3/Cripto. |
| `GEMINI_API_KEY` | **Obrigatória** | Chave da API do Google Gemini para recomendações/diagnósticos de IA. |
| **Pagamentos (Stripe)** | | |
| `STRIPE_SECRET_KEY` | **Obrigatória** | Chave secreta real de produção (`sk_live_...`). |
| `STRIPE_PRICE_ID` | **Obrigatória** | ID do preço/plano criado no dashboard do Stripe. |
| `STRIPE_WEBHOOK_SECRET` | **Obrigatória** | Secret de assinatura recebido no registro do webhook (endpoint `/payments/webhook`). |
| **Observability** | | |
| `LOG_LEVEL` | Opcional | Define nível de logs (ex: `info`, `warn`, `error`). Padrão: `info`. |
| `ALERT_WEBHOOK_URL`| **Obrigatória** | URL do webhook do Discord/Slack para alertas de incidentes 5xx ou falhas em webhooks. |

## Checklist Final de Go-Live (Env Vars)
- [ ] O Vercel possui a `VITE_API_URL` real de produção configurada.
- [ ] O Render (ou serviço de backend) possui todas as variáveis **Obrigatórias** cadastradas.
- [ ] `NODE_ENV` está definido para `production`.
- [ ] O Endpoint do Webhook do Stripe foi criado na dashboard e o `STRIPE_WEBHOOK_SECRET` gerado foi copiado para o backend.
- [ ] Nenhuma '.env' de produção foi commitada no repositório.
