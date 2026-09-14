-- Rollback: Remove vencimento and taxa from portfolios
ALTER TABLE portfolios DROP COLUMN vencimento;
ALTER TABLE portfolios DROP COLUMN taxa;
