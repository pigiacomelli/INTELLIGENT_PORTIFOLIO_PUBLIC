# Database Operations (Migrations & Backups)

## Migrations (AG-006)
O Antighravity usa um script customizado (`migrate.ts`) para versionar as mudanças estruturais no banco de dados.

### Fluxo de Deploy
1. Toda mudança no banco DEVE ser precedida da criação de dois arquivos na pasta `backend/migrations/`:
   - `00X_nome_da_migration.sql` (O que aplicar)
   - `00X_nome_da_migration.down.sql` (Como reverter)
2. Durante o processo de deploy na Vercel/Render, o script de build ou post-deploy deve rodar:
   ```bash
   npx tsx migrate.ts up
   ```

## Rollbacks (AG-007)
Se um deploy quebrar a produção devido a uma incompatibilidade de schema, o rollback deve ser feito **antes** de retornar para a versão anterior do código.
1. No console do servidor ou via CLI:
   ```bash
   npx tsx migrate.ts down
   ```
2. O script buscará a última migração na tabela `_migrations` e executará o arquivo `.down.sql` correspondente.
3. **Restrição:** Use o rollback apenas para mudanças imediatas que acabaram de ser aplicadas. Se houver dados reais inseridos na nova estrutura, avalie um *Restore* do banco.

## Backups & Restore (Neon) (AG-008)
O banco de produção está hospedado no Neon (PostgreSQL Serverless).

- **Backup Automatizado:** O Neon por padrão faz snapshots contínuos com retenção (PITR - Point-in-Time Recovery) configurada para 7 dias nos planos pagos.
- **Teste de Restore:**
  1. No console do Neon, vá em **Operations > Branches** ou **Restore**.
  2. Crie uma branch apontando para um minuto antes do incidente.
  3. Modifique a string de conexão no `.env` do ambiente desejado apontando para a nova Branch e valide se a massa de dados está íntegra.
  4. Para validar um restore total em caso catastrófico, o Neon permite restaurar diretamente a main branch para um ponto no tempo. Sugere-se criar um branch isolada antes disso.
