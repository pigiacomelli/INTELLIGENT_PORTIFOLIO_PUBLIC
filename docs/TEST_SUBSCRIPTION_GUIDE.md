# Guia de Testes: Assinatura Mensal (SaaS) com Stripe

O **Intelligent Portfolio** foi convertido para um modelo de SaaS (Software as a Service). Agora, novos usuários precisam de uma assinatura ativa para acessar o **Dashboard** ("Visão Geral", "Mercado Hoje" e "Inteligência Artificial").

Este guia descreve como o fluxo funciona e como testá-lo em ambiente local de desenvolvimento.

## 1. Como o Fluxo Funciona

1. **Registro:** Quando um novo usuário se registra, ele é criado com o status `trial` e um período de **7 dias de avaliação gratuita** (Pro) no banco de dados.
2. **Período de Trial:** Durante os primeiros 7 dias, o usuário tem acesso total aos recursos Premium (Dashboard, Mercado Hoje e IA).
3. **Paywall:** Após a expiração do trial (`trial_expires_at`), ou se o usuário tentar acessar recursos sem uma assinatura ativa após o trial, o frontend redireciona para a tela de **Bloqueio de Assinatura**.
4. **Checkout:** O usuário pode assinar o plano Pro a qualquer momento para garantir acesso ininterrupto.
5. **Confirmação Automática (Webhook):** Assim que o pagamento (simulado por um cartão de teste) for confirmado, o Stripe envia um aviso ("Webhook") para o servidor Node.js no backend (`/api/payments/webhook`).
6. **Acesso Liberado:** O servidor recebe o webhook, encontra o usuário no banco de dados (SQLite) e altera o status dele para `active`. O usuário já pode usar a plataforma.

---

## 2. Como Testar Funcionalmente na sua Máquina

### Passo 2.1: Inicie os Servidores
Certifique-se de que os servidores estão rodando normalmente:
```bash
npm run dev
```

### Passo 2.2: Crie uma nova Conta Moba (Simulada)
1. Acesse o **Frontend**: `http://localhost:5173` ou `http://localhost:5174` (Vá para a URL que apareceu no seu terminal do Vite).
2. Na página inicial de destino (Landing Page), clique em botão do tipo **"Assinar Agora"** ou **"Comece Grátis Agora"**.
3. O painel de Login/Registro se abrirá. **Não faça login na sua conta antiga.**
4. Clique em **"Registre-se"** (no fim do formulário) e crie uma nova conta de testes (Ex: `teste3@email.com` / Senha: `123123`).
5. Ao concluir o registro, entre na conta.

### Passo 2.3: O Bloqueio (Paywall)
Logo após o Login bem sucedido, você verá a tela preta com a mensagem: 
**"Sua assinatura expirou ou não está ativa."**
Isso garante que pessoas não-pagantes não consigam ver os gráficos de carteira.

### Passo 2.4: Pagamento no Stripe (Mock)
1. Clique no botão azul **"Assinar Agora Pelo Stripe"**. 
2. Você será redirecionado para a página real de Checkout da Stripe (em modo "Test Mode" destacado no ecrã).
3. **Pague com o Cartão de Teste:**
   - **Número do Cartão:** `4242 4242 4242 4242`
   - **Data Vencimento:** Qualquer mês/ano futuro (Ex: `12/28`)
   - **CVC:** Qualquer código (Ex: `123`)
   - **Nome:** "Pietro Silva"
4. Clique em **Subscribe** ou **Assinar**.
5. Quando o pagamento passar... A Stripe mandará você automaticamente de volta para o *Intelligent Portfolio* com sucesso!

### Passo 2.5: Verificação do Acesso Automático (Webhook Local)
Neste momento de transição, a aba rodando `npm run dev:backend` deve exibir no terminal:
> `[Stripe] User [ID] successfully subscribed! Updating DB...`

O que quer dizer que o Webhook secreto registrou que Pietro pagou e liberou no banco de dados.

**Pronto!** Caso o redirecionamento ao Frontend já exiba direto, ou você precise dar apenas um `Refresh` na página, a plataforma carregará seu Painel e Gráficos instantaneamente!
