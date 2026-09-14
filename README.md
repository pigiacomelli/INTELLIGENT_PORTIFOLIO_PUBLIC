# Intelligent Portfolio 🚀

**Gerencie todos os seus investimentos em um único dashboard inteligente.**

Um SaaS premium de consolidação financeira criado para investidores que exigem precisão, design responsivo em *Glassmorphism* e insights guiados por Inteligência Artificial. Abandone de vez as planilhas complexas.

![Dashboard Preview](https://img.shields.io/badge/Status-Beta_MVP-blueviolet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20PostgreSQL%20(Neon)-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

---

## 🌟 O Problema Que Resolvemos
Investidores profissionais perdem horas tentando consolidar relatórios da B3, corretoras internacionais e carteiras de criptomoedas. O **Intelligent Portfolio** automatiza a ingestão de dados, analisa o risco e oferece rebalanceamento em segundos usando Inteligência Artificial.

## ✨ Funcionalidades Atuais

### 📊 Dashboard "Cockpit" Premium
- **Visão consolidada imediata:** Renda Fixa, Variável, FIIs, ETFs Globais e Cripto num só lugar.
- **Design Glassmorphism:** Interface ultramoderna com navegação superior intuitiva e efeitos visuais premium.
- **Gráficos Dinâmicos:** Alocação por ativos, risco por instituição e exposição setorial via Recharts.

### 📁 Gestão de Multi-Carteiras (Portfolio Groups)
- **Organização Flexível:** Crie e gerencie múltiplas carteiras independentes (ex: Aposentadoria, Reserva de Emergência, Trading).
- **CRUD Completo:** Criação, edição e exclusão de grupos de portfólio.

### 🔗 Compartilhamento Público
- **Link de Acesso Único:** Gere links seguros para compartilhar sua visão de carteira com consultores ou amigos sem expor dados sensíveis de login.

### 📥 Importação B3 Smart (Excel)
- **Suporte a extratos B3:** Importação de arquivos `.xlsx` da Área do Investidor B3.
- **Mapeamento inteligente:** Reconhecimento automático de colunas, limpeza de dados e cálculo de preço médio.

### 🤖 Inteligência Artificial (Gemini)
- **Diagnóstico de Carteira:** Análise automática de diversificação e nível de risco.
- **Chat Contextual:** IA que conhece sua carteira e responde dúvidas estratégicas com histórico de conversa.

### 📈 Mercado Hoje & Insights
- **Busca Global:** Encontre qualquer ativo negociado na B3 ou mercados globais.
- **Top Movers:** Listagem dinâmica de maiores altas (Gainers) e baixas (Losers) do dia.
- **Benchmarks em Tempo Real:** IBOVESPA, S&P 500, NASDAQ, BTC, USD/BRL e Heatmap B3.

### 🛡️ Segurança e Performance
- **Rate Limiting:** Proteção contra ataques de força bruta no login e chat.
- **Validação Rigorosa:** Todos os inputs validados via Zod no backend.
- **Cabeçalhos de Segurança:** Implementação de Helmet para proteção básica contra ataques web.
- **Agendador de Preços:** Serviço automático de atualização de cotações em background.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React.js (TypeScript), Vite, Vanilla CSS, Lucide React, Recharts.
- **Backend:** Node.js (Express), TypeScript.
- **Banco de Dados:** **Neon PostgreSQL** (Serverless) com suporte a pooler (Drizzle-ready logic).
- **Provedor de Dados:** **Brapi API** (Cotações B3, Global e Câmbio).
- **IA:** Google Gemini AI API.
- **Assinaturas:** Stripe (Estrutura de Checkout e Webhook implementados).

---

## 🚀 Como Iniciar

### Variáveis de Ambiente (`.env`)
Configure os seguintes valores no seu arquivo `.env` no **backend**:
- `DATABASE_URL`: String de conexão Neon PostgreSQL.
- `BRAPI_API_KEY`: Chave da API Brapi.dev.
- `GEMINI_API_KEY`: Chave da API Google Generative AI.
- `JWT_SECRET`: Segredo para autenticação JWT.
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe.
- `STRIPE_WEBHOOK_SECRET`: Segredo para validação de webhooks.

### Rodando o Projeto

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run build
   node dist/index.js
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🛠️ Operação e Produção

Para garantir um deploy seguro e manutenção robusta, consulte os seguintes guias:

- [**Guia de Ambiente**](docs/ENVIRONMENT.md): Configuração detalhada de variáveis.
- [**Operações e Manutenção**](docs/OPERATIONS.md): Backup, Restore, Troubleshooting e Logs.
- [**Auditoria Go-Live**](docs/final_go_live_audit.md): Checklist final antes de abrir para o público.
- [**Guia de Assinaturas**](docs/TEST_SUBSCRIPTION_GUIDE.md): Como testar o fluxo de pagamentos.

---

## 📅 Roadmap de Evolução

1. **Histórico de Patrimônio:** Snapshots diários para visualização de rentabilidade histórica.
2. **Calendário de Dividendos:** Notificações de proventos provisionados e pagos.
3. **Módulo de IRPF:** Auxílio na declaração anual de ativos.
4. **Alocação Alvo:** Definição de metas por classe de ativo com alertas de rebalanceamento.

---
*Built with passion for wealth building.*
