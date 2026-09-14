# Runbooks - INTELLIGENT_PORTIFOLIO

## SEV1: Backend Indisponível (5xx em massa)
1. Verificar logs do provedor (Render/Heroku/AWS).
2. Verificar conectividade com o Banco de Dados (Neon).
3. Reiniciar o serviço de backend.
4. Se persistir, verificar se houve deploy recente e realizar rollback.

## SEV1: Falha no Provedor de Dados de Mercado
1. Verificar status da Yahoo Finance API / Brapi.
2. Ativar fallback para dados estáticos se disponível.
3. Notificar usuários via banner no frontend se a indisponibilidade for prolongada.

## SEV2: Falha crítica no Billing (Stripe Webhooks)
1. Verificar dashboard do Stripe para erros de entrega de webhook.
2. Validar se a secret do webhook expirou ou mudou.
3. Executar o job de reconciliação manual: `npm run stripe-sync` (se disponível).

## SEV3: Falha de Job (Price Updater)
1. Verificar logs do `PriceUpdateService`.
2. Rodar o script de atualização manualmente se necessário.
