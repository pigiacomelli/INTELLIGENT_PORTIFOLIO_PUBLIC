import { logger } from '../utils/logger.js';
import YahooFinance from 'yahoo-finance2';
import { config } from '../config.js';

const yahooFinance = new YahooFinance();

const CRYPTO_LIST = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'ADA', 'XRP', 'DOT', 'LINK', 'DOGE', 'MATIC'];

export interface MarketPrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  lastUpdate: string;
}

export class MarketDataService {
  // In-memory cache for ultra-fast response (TTL 60 seconds)
  private memCache = new Map<string, { price: MarketPrice, expiresAt: number }>();

  private isInternationalTicker(symbol: string): boolean {
    const s = symbol.toUpperCase();
    if (s.startsWith('^') || s.endsWith('.SA')) return false;
    // B3 typical pattern: 4 letters + 1 or 2 digits (PETR4, BBAS3, HGLG11)
    if (/^[A-Z]{4}\d{1,2}$/.test(s)) return false;
    // Crypto and currencies
    if (s.includes('/') || CRYPTO_LIST.includes(s)) return true;
    // US Stocks: 1-4 letters
    if (/^[A-Z]{1,4}$/.test(s)) return true;
    return false;
  }

  /**
   * Get stock price for a single symbol.
   */
  async getStockPrice(symbol: string): Promise<MarketPrice> {
    const prices = await this.getBatchPrices([symbol]);
    if (prices[symbol]) return prices[symbol];
    throw new Error(`Price for ${symbol} not found`);
  }

  /**
   * Get multiple stock prices in a single batch (DB-First Strategy).
   *
   * - Missing or zero-price symbols → synchronous fetch (user gets fresh data immediately).
   * - Stale-but-valid symbols (>30 min) → background refresh (fast response, eventually consistent).
   */
  async getBatchPrices(symbols: string[]): Promise<Record<string, MarketPrice>> {
    const results: Record<string, MarketPrice> = {};
    if (!symbols.length) return results;

    const db = await import('../db.js').then(m => m.getDb());
    const uniqueSymbols = [...new Set(symbols.map(s => s.trim().toUpperCase()))];
    const nowTime = Date.now();
    const missingFromMemory: string[] = [];

    // 0. Check In-Memory Cache first (Ultra Fast)
    uniqueSymbols.forEach(symbol => {
      const cached = this.memCache.get(symbol);
      if (cached && cached.expiresAt > nowTime) {
        results[symbol] = cached.price;
      } else {
        missingFromMemory.push(symbol);
      }
    });

    if (missingFromMemory.length === 0) return results;

    try {
      // 1. Check DB Cache for remaining items
      const cachedDb = await db.all(
        `SELECT * FROM prices WHERE symbol IN (${missingFromMemory.map((_, i) => `$${i + 1}`).join(',')})`,
        missingFromMemory
      );

      cachedDb.forEach((row: any) => {
        const item: MarketPrice = {
          symbol: row.symbol,
          price: row.price,
          change: row.change,
          changePercent: row.change_percent,
          lastUpdate: row.last_updated
        };
        results[row.symbol] = item;
        // Seed memory cache for 60s
        this.memCache.set(row.symbol, { price: item, expiresAt: nowTime + 60000 });
      });
    } catch (e) {
      logger.warn('[MarketData] Cache retrieval error:', e);
    }

    // 2. Classify symbols:
    //    a) Missing entirely from DB → SYNC fetch
    //    b) Price = 0 in DB → SYNC fetch (bad cached value)
    //    c) Price valid but stale (>30 min) → BACKGROUND refresh
    const now = new Date();
    const trulyMissing = uniqueSymbols.filter(s => !results[s]);
    const zeroPriced = uniqueSymbols.filter(s => results[s]?.price === 0);
    const staleButValid = uniqueSymbols.filter(s => {
      const entry = results[s];
      if (!entry || entry.price === 0) return false;
      return (now.getTime() - new Date(entry.lastUpdate).getTime()) > 30 * 60 * 1000;
    });

    // 3a. Synchronous fetch for missing / zero-price symbols
    const needsSync = [...trulyMissing, ...zeroPriced];
    if (needsSync.length > 0) {
      logger.info(`⏳ [MarketData] Sync fetch for: ${needsSync.join(', ')}`);
      const fresh = await this.fetchYahooFinancePrices(needsSync);
      for (const [sym, price] of Object.entries(fresh)) {
        results[sym] = price;
        this.memCache.set(sym, { price, expiresAt: nowTime + 60000 });
      }
    }

    // 3b. Background refresh for stale-but-valid symbols
    if (staleButValid.length > 0) {
      this.fetchYahooFinancePrices(staleButValid)
        .then(fresh => {
          const ts = Date.now();
          for (const [sym, price] of Object.entries(fresh)) {
            this.memCache.set(sym, { price, expiresAt: ts + 60000 });
          }
        })
        .catch(err => logger.error('[MarketData] Background refresh error:', err.message));
    }

    return results;
  }

  /**
   * Fetch prices from Yahoo Finance, persist them in the DB, and return them.
   *
   * Crypto (BTC, ETH, SOL…) is fetched in USD and converted to BRL using the live 
   * USDBRL=X exchange rate so all portfolio values are consistently in Reais.
   *
   * Returns a map { SYMBOL: MarketPrice } of successfully fetched prices.
   */
  private async fetchYahooFinancePrices(symbols: string[]): Promise<Record<string, MarketPrice>> {
    if (symbols.length === 0) return {};

    const freshMap: Record<string, MarketPrice> = {};

    // Which requested symbols are crypto or otherwise international (USD-priced)?
    const cryptoSymbols = symbols.filter(s => CRYPTO_LIST.includes(s.toUpperCase()));
    const intlSymbols = symbols.filter(s => !CRYPTO_LIST.includes(s.toUpperCase()) && this.isInternationalTicker(s));
    const hasUsdAssets = cryptoSymbols.length > 0 || intlSymbols.length > 0;

    // Map each symbol to its Yahoo Finance ticker
    const yahooSymbols = symbols.map(s => {
      const upper = s.trim().toUpperCase();
      if (CRYPTO_LIST.includes(upper) && !upper.includes('-')) return `${upper}-USD`;
      if (this.isInternationalTicker(s) || upper.endsWith('.SA') || upper.startsWith('^')) return upper;
      return `${upper}.SA`;
    });

    // Also fetch the live USD/BRL rate when there are USD-priced assets
    if (hasUsdAssets) yahooSymbols.push('USDBRL=X');

    logger.info(`🌍 [YahooFinance] Fetching prices for: ${yahooSymbols.join(', ')}`);

    try {
      const quotes = await yahooFinance.quote(yahooSymbols);
      const freshPrices: MarketPrice[] = [];
      const now = new Date().toISOString();

      // Ensure quotes is always an array
      const resultsArr = Array.isArray(quotes) ? quotes : [quotes];

      // Extract the USDBRL rate first
      let usdBrl = 1;
      if (hasUsdAssets) {
        const fxQuote = resultsArr.find((q: any) => q?.symbol === 'USDBRL=X' || q?.symbol === 'BRL=X');
        if (fxQuote?.regularMarketPrice) {
          usdBrl = fxQuote.regularMarketPrice;
          logger.info(`💱 [MarketData] USD/BRL rate: ${usdBrl.toFixed(4)}`);
        } else {
          logger.warn('[MarketData] Could not fetch USDBRL rate, portfolio international values may show as USD.');
        }
      }

      resultsArr.forEach((quote: any) => {
        if (!quote) return;
        // Skip the exchange rate — not an asset price
        if (quote.symbol === 'USDBRL=X' || quote.symbol === 'BRL=X') return;

        // Map Yahoo Finance symbol back to the original clean format
        const requestedSymbol = symbols.find(s => {
          const sUpper = s.toUpperCase();
          const qUpper = (quote.symbol as string).toUpperCase();
          if (qUpper === `${sUpper}.SA`) return true;
          if (qUpper === `${sUpper}-USD`) return true;
          if (qUpper === `${sUpper}-BRL`) return true;
          return qUpper === sUpper;
        }) || quote.symbol;

        // USD-priced: crypto OR any international ticker (not B3)
        const isCrypto = CRYPTO_LIST.includes(requestedSymbol.toUpperCase());
        const isIntl = isCrypto || this.isInternationalTicker(requestedSymbol);
        const rawPrice = (quote.regularMarketPrice as number) || 0;

        // Convert USD → BRL for all USD-priced assets
        const priceInBrl = isIntl ? rawPrice * usdBrl : rawPrice;

        const price: MarketPrice = {
          symbol: requestedSymbol.toUpperCase(),
          price: priceInBrl,
          change: isIntl
            ? ((quote.regularMarketChange as number) || 0) * usdBrl
            : ((quote.regularMarketChange as number) || 0),
          changePercent: (quote.regularMarketChangePercent as number) || 0,
          lastUpdate: now
        };

        freshPrices.push(price);
        freshMap[price.symbol] = price;
      });

      if (freshPrices.length > 0) {
        await this.updatePricesInDb(freshPrices);
      }
    } catch (err: any) {
      logger.error(`[MarketData] YahooFinance fetch error:`, err.message);
    }

    return freshMap;
  }

  private async updatePricesInDb(freshPrices: MarketPrice[]) {
    const db = await import('../db.js').then(m => m.getDb());
    const placeholders = freshPrices.map((_: any, idx: number) =>
      `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`).join(', ');

    const values = freshPrices.flatMap((p: MarketPrice) => [
      p.symbol, p.price, p.change, p.changePercent, p.lastUpdate
    ]);

    const query = `
      INSERT INTO prices (symbol, price, change, change_percent, last_updated)
      VALUES ${placeholders}
      ON CONFLICT (symbol) DO UPDATE SET
        price = EXCLUDED.price,
        change = EXCLUDED.change,
        change_percent = EXCLUDED.change_percent,
        last_updated = EXCLUDED.last_updated
    `;
    await db.run(query, values);
  }
}
