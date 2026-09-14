INSERT INTO portfolio_groups (user_id, name)
SELECT u.id, 'Carteira Principal'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_groups pg WHERE pg.user_id = u.id
);

UPDATE portfolios p
SET portfolio_id = pg.id
FROM portfolio_groups pg
WHERE p.user_id = pg.user_id
  AND p.portfolio_id IS NULL
  AND pg.name = 'Carteira Principal';
