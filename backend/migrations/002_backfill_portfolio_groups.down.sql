-- No practical rollback for data backfill in this case other than manual cleanup if needed,
-- but we could theoretically unset the portfolio_id.
UPDATE portfolios SET portfolio_id = NULL WHERE portfolio_id IN (SELECT id FROM portfolio_groups WHERE name = 'Carteira Principal');
DELETE FROM portfolio_groups WHERE name = 'Carteira Principal';
