-- Migration: Add vencimento and taxa to portfolios
ALTER TABLE portfolios ADD COLUMN vencimento DATE;
ALTER TABLE portfolios ADD COLUMN taxa TEXT;
