# Environment setup (Development and Production)

## Backend variables
Use `backend/.env.example` as the source of truth.

### Required in all environments
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `BRAPI_API_KEY`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

### Optional
- `NODE_ENV` (default: development)
- `PORT` (default: 3001)
- `ALERT_WEBHOOK_URL` (Slack/Discord incident channel)
- `LOG_LEVEL` (default: info)

## Frontend variables
Use `frontend/.env.example` as the source of truth.

### Required
- `VITE_API_URL` (URL do Backend, ex: http://localhost:3001)

## Development profile
1. Copy file:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Fill real keys for Brapi, Gemini and Stripe test mode.
3. Run:
   ```bash
   npm run dev
   ```

## Production profile
- Keep secrets only in provider secret manager (Render/Vercel env vars).
- Set `NODE_ENV=production`.
- Configure Stripe webhook endpoint:
  - `https://<backend>/api/payments/webhook`
  - events: `checkout.session.completed`, `customer.subscription.deleted`
- Configure `ALERT_WEBHOOK_URL` to receive SEV alerts.

## Validation checklist before go-live
- `/health` returns status UP.
- Checkout creates Stripe session.
- Webhook updates subscription status.
- Logs include `x-request-id` in response headers and JSON payload.
