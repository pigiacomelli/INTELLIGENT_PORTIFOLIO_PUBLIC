# Intelligent Portfolio — versão local

Aplicativo pessoal para consolidar investimentos, importar a posição da B3 e acompanhar carteiras no próprio computador. Não há página comercial, cadastro, assinatura nem compartilhamento público.

## O que está incluído

- Banco local criado automaticamente em `backend/data/intelligent-portfolio.db`.
- Acesso direto ao painel, com um perfil pessoal criado automaticamente no primeiro uso.
- Importação do Excel de posição consolidada da B3.
- Suporte a ações BR e internacionais, ETFs BR e internacionais, FIIs, fundos, renda fixa, Tesouro, cripto, bonds, caixa, COE e imóveis.
- Cadastro manual, edição e exclusão de investimentos.
- Gemini e chave da Brapi opcionais.

## Requisitos

- Node.js 22 ou superior.
- npm 10 ou superior.

## Primeira execução

Na pasta do projeto:

```bash
npm run setup
npm run dev
```

Abra `http://localhost:5173`. O painel cria o perfil local automaticamente e entra direto na carteira.

Nas próximas vezes, basta:

```bash
npm run dev
```

O backend usa a porta `3001` e o frontend a `5173`.

## Importar a posição da B3

No painel, use **Importar B3** e selecione o arquivo `.xlsx` baixado da Área do Investidor. Antes de salvar, o importador mostra as abas reconhecidas, o total de posições e os avisos encontrados.

## Banco e backup

O arquivo do banco fica em:

```
backend/data/intelligent-portfolio.db
```

Para gerar um backup legível em JSON:

```bash
npm run db:backup
```

Os backups são criados em `backend/backups`. Para uma cópia integral, feche o aplicativo e copie o arquivo `.db`.

## Configuração opcional

O aplicativo abre sem `.env`. Para ativar IA ou personalizar portas e caminhos:

```bash
cp backend/.env.example backend/.env
```

Depois, preencha somente as chaves desejadas. O modo local ignora a cobrança por assinatura.

## Verificações

```bash
npm run build
npm test --prefix backend
```
