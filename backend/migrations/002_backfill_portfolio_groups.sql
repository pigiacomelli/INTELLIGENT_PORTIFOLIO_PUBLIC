INSERT INTO portfolio_groups (user_id, name)
SELECT u.id, 'Carteira Principal'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_groups pg WHERE pg.user_id = u.id
);

UPDATE portfolios
SET portfolio_id = (
  SELECT pg.id
  FROM portfolio_groups pg
  WHERE pg.user_id = portfolios.user_id
    AND pg.name = 'Carteira Principal'
  ORDER BY pg.id
  LIMIT 1
)
WHERE portfolio_id IS NULL;
