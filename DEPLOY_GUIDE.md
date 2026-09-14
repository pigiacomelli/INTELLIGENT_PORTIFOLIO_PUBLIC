# 🚀 Guia de Deploy – Intelligent Portfolio

Este guia explica como colocar sua aplicação no ar usando **Vercel** (Frontend) e **Render** (Backend).

## 1. Preparação (GitHub)

1. Crie um repositório no seu GitHub.
2. No terminal da sua máquina, dentro da pasta raiz do projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: ready for launch"
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Deploy do Backend (Render.com)

1. Crie uma conta em [render.com](https://render.com).
2. Clique em **"New +"** -> **"Blueprint"**.
3. Conecte seu repositório do GitHub.
4. O Render detectará automaticamente o arquivo `backend/render.yaml`.
5. Durante a configuração, você precisará preencher as **Environment Variables** (copie do seu arquivo `.env` local):
   - `DATABASE_URL`: A URL do seu banco Neon.
   - `GEMINI_API_KEY`: Sua chave do Google Gemini.
   - `BRAPI_API_KEY`: Sua chave da Brapi.
   - `STRIPE_SECRET_KEY`: Sua chave secreta do Stripe.
   - `JWT_SECRET`: Uma frase longa e aleatória para segurança.
6. Clique em **"Deploy"**. Anote a URL gerada (ex: `https://intelligent-portfolio-api.onrender.com`).

---

## 3. Deploy do Frontend (Vercel)

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Clique em **"Add New"** -> **"Project"**.
3. Importe o seu repositório do GitHub.
4. Em **"Root Directory"**, selecione a pasta `frontend`.
5. Em **"Environment Variables"**, adicione:
   - `VITE_API_URL`: A URL do Backend que você anotou no passo anterior (sem a barra final).
6. Clique em **"Deploy"**.

---

## 4. Configuração Final do Stripe (Opcional)

Para que o Stripe saiba quando um pagamento foi aprovado:
1. Vá no Dashboard do Stripe -> **Developers** -> **Webhooks**.
2. Clique em **"Add endpoint"**.
3. URL: `https://SUA_URL_DA_RENDER.com/api/payments/webhook`.
4. Selecione o evento: `checkout.session.completed`.
5. Copie o "Signing Secret" e adicione como `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente da **Render**.

---

✅ **Pronto!** Seu Intelligent Portfolio agora está online e pronto para receber clientes.

---

## 🛠️ Solução de Problemas Comuns

### Erro de CORS
Se você ver um erro de CORS no console do seu navegador, verifique na **Render** as variáveis de ambiente do seu **Backend**:
- `FRONTEND_URL`: Deve conter o endereço do seu site (ex: `https://www.intelligentportifolio.com.br`). 
- Para permitir múltiplos endereços (ex: local e produção), separe por vírgula: `https://www.intelligentportifolio.com.br,http://localhost:5173`.
