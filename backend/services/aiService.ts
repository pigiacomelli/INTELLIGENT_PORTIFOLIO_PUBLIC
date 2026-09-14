import { logger } from '../utils/logger.js';
import { GoogleGenAI } from '@google/genai';
import { getDb } from '../db.js';
import { config } from '../config.js';

// Model fallback chain: try the best model first, fall back on quota/rate errors
const MODELS = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
];

export class AIService {
    private ai: GoogleGenAI | null = null;
    // In-memory cache: survives restarts via DB persistence
    private sectorCache = new Map<string, string>();
    private dbCacheLoaded = false;

    constructor() {
        const apiKey = config.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'your_api_key_here' && apiKey.startsWith('AIza')) {
            this.ai = new GoogleGenAI({ apiKey });
            logger.info("✅ AIService: Gemini configured successfully.");
            // Load sector cache from DB asynchronously (no await to avoid blocking startup)
            this.loadSectorCacheFromDb().catch(e => logger.warn('[AI] Failed to load sector cache from DB:', e.message));
        } else {
            logger.warn("⚠️ AIService: GEMINI_API_KEY missing or invalid in .env");
        }
    }

    // ─── DB-Backed Sector Cache ───────────────────────────────────────────────

    private async loadSectorCacheFromDb() {
        try {
            const db = await getDb();
            await db.run(`
                CREATE TABLE IF NOT EXISTS ai_sector_cache (
                    ticker TEXT PRIMARY KEY,
                    sector TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            const rows = await db.all('SELECT ticker, sector FROM ai_sector_cache');
            for (const row of rows) {
                this.sectorCache.set(row.ticker.toUpperCase(), row.sector);
            }
            this.dbCacheLoaded = true;
            logger.info(`✅ [AI] Sector cache loaded from DB: ${rows.length} entries.`);
        } catch (e: any) {
            logger.warn('[AI] Could not load sector cache from DB:', e.message);
        }
    }

    private async saveSectorToDb(ticker: string, sector: string) {
        try {
            const db = await getDb();
            await db.run(
                `INSERT INTO ai_sector_cache (ticker, sector, updated_at)
                 VALUES (?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(ticker) DO UPDATE SET sector = EXCLUDED.sector, updated_at = CURRENT_TIMESTAMP`,
                [ticker.toUpperCase(), sector]
            );
        } catch (e: any) {
            // Non-critical: in-memory cache still works
            logger.warn('[AI] Could not persist sector to DB:', e.message);
        }
    }

    // ─── Core Fallback Generator ──────────────────────────────────────────────

    private async generateWithFallback(requestBody: any): Promise<string> {
        if (!this.ai) throw new Error('AI_NOT_CONFIGURED');

        let lastError: any;
        for (const modelName of MODELS) {
            try {
                logger.info(`📡 [AI] Tentando modelo: ${modelName}...`);
                const result = await (this.ai as any).models.generateContent({
                    model: modelName,
                    contents: requestBody.contents,
                    config: requestBody.config
                });
                logger.info(`✅ [AI] Chamada concluída para ${modelName}`);

                if (result.candidates && result.candidates[0]) {
                    logger.info(`🔍 [AI CANDIDATE] Finish Reason:`, result.candidates[0].finishReason);
                }

                const text = result.text || '';
                if (!text) throw new Error('Resposta vazia da API do Gemini');
                return text;
            } catch (error: any) {
                lastError = error;
                logger.warn(`⚠️ AIService: model ${modelName} failed, trying next...`, error?.message);
                continue;
            }
        }
        throw lastError || new Error('All AI models failed');
    }

    // ─── Chat ─────────────────────────────────────────────────────────────────

    async generateChatResponse(message: string, portfolioContext: any, history: any[]): Promise<string> {
        if (!this.ai) {
            return "O serviço de análise não está configurado. Verifique as variáveis de ambiente no arquivo .env.";
        }

        const systemPrompt = `Você é o "Smart Advisor", consultor financeiro do app Intelligent Portfolio.
Responda em Português (Brasil), de forma precisa e direta.

CARTEIRA DO USUÁRIO:
- Patrimônio: R$ ${portfolioContext.totalValue?.toLocaleString('pt-BR') || portfolioContext.patrimonioAtual?.toLocaleString('pt-BR') || 0}
- Lucro/Prejuízo: R$ ${portfolioContext.lucroPrejuizo?.toLocaleString('pt-BR') || 0}
- Alocação: ${JSON.stringify(portfolioContext.allocations || portfolioContext.totais || {})}

DIRETRIZES: Seja prestativo e objetivo. Use Markdown quando útil. Foque em finanças e investimentos.`;

        try {
            const recentHistory = history.slice(-8); // Últimas 8 mensagens (economiza tokens vs 10)

            const contents = [
                { role: 'user', parts: [{ text: `INSTRUÇÕES DO SISTEMA: ${systemPrompt}` }] },
                ...recentHistory.map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                })),
                { role: 'user', parts: [{ text: message }] }
            ];

            return await this.generateWithFallback({
                contents,
                config: { maxOutputTokens: 600, temperature: 0.7 },
            });
        } catch (error: any) {
            logger.error('AIService Chat Error:', error?.message);
            if (error?.message?.includes('API key not valid') || error?.message?.includes('API_KEY_INVALID')) {
                return "Erro: Chave de API inválida. Por favor, verifique o arquivo .env.";
            }
            if (error?.message?.includes('quota') || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
                return "⚠️ Limite de requisições da API atingido. Tente novamente em alguns minutos.";
            }
            return "Desculpe, tive um problema técnico. Por favor, tente novamente.";
        }
    }

    // ─── Diagnostic ───────────────────────────────────────────────────────────

    async generateDiagnostic(portfolioContext: any): Promise<any> {
        if (!this.ai) throw new Error('Analysis service not configured');
        logger.info('🚀 [AI] Iniciando geração de diagnóstico técnico...');

        // Build compact payload directly from raw assets
        const rawAssets = (Object.values(portfolioContext.ativos || {}) as any[][]).flat();
        const compactAssets = rawAssets
            .sort((a: any, b: any) => (b['Valor Atualizado'] || 0) - (a['Valor Atualizado'] || 0))
            .slice(0, 80) // Limit to top 80 to keep input tokens low
            .map((a: any) => ({
                t: a.ticker,
                c: a.category || a.tipo || a.type,
                v: Math.round(a['Valor Atualizado'] || a.valor || 0) // integer = fewer tokens
            }));

        logger.info(`🔍 [AI DIAGNOSTIC] Enviando ${compactAssets.length} ativos. Exemplo:`, JSON.stringify(compactAssets.slice(0, 2)));

        // Compact system prompt — brevidade exigida pelo schema
        const systemPrompt = `Analista financeiro. Retorne JSON conforme o schema definido.
Portfólio: R$${Math.round(portfolioContext.totalInvestido || portfolioContext.patrimonioAtual || 0).toLocaleString('pt-BR')}
Alocação: ${JSON.stringify(portfolioContext.allocations?.tipo || {})}
IMPORTANTE: Cada string deve ter no MÁXIMO 100 caracteres. Seja direto e conciso.`;

        try {
            const text = await this.generateWithFallback({
                contents: [{ role: "user", parts: [{ text: JSON.stringify(compactAssets) }] }],
                config: {
                    maxOutputTokens: 4096, // Generous limit to avoid MAX_TOKENS truncation
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'object',
                        properties: {
                            diversificationLevel: { type: 'string', enum: ['Baixa', 'Média', 'Alta'] },
                            concentrationRisk: { type: 'string' },
                            strengths: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
                            weaknesses: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
                            recommendation: { type: 'string' }
                        },
                        required: ['diversificationLevel', 'concentrationRisk', 'strengths', 'weaknesses', 'recommendation']
                    },
                    systemInstruction: systemPrompt
                }
            });

            logger.info(`📝 [AI DIAGNOSTIC] Resposta (primeiros 300 chars):`, text.substring(0, 300));
            return JSON.parse(text);
        } catch (error: any) {
            logger.error('AIService Diagnostic Error:', error?.message);
            throw new Error('Falha ao gerar o diagnóstico inteligente.');
        }
    }

    // ─── Sector Suggestion: BATCH (1 API call for N tickers) ─────────────────

    /**
     * Look up sectors for multiple tickers in a SINGLE API call.
     * Returns a map { TICKER: "Setor" }.
     * Hits in-memory/DB cache are served without any API call.
     */
    async getBatchSectors(tickers: string[]): Promise<Record<string, string>> {
        const result: Record<string, string> = {};
        const toFetch: string[] = [];

        for (const ticker of tickers) {
            const upper = ticker.toUpperCase();
            if (this.sectorCache.has(upper)) {
                result[upper] = this.sectorCache.get(upper)!;
            } else {
                toFetch.push(upper);
            }
        }

        if (toFetch.length === 0 || !this.ai) return result;

        logger.info(`📡 [AI SECTOR BATCH] Buscando ${toFetch.length} setores em 1 chamada...`);

        const prompt = `Para cada ticker abaixo (B3, Internacional ou Cripto), retorne o setor econômico principal em português (máx 3 palavras).
Responda APENAS com JSON no formato: {"TICKER":"Setor"}.
Tickers: ${toFetch.join(', ')}`;

        try {
            const text = await this.generateWithFallback({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    maxOutputTokens: 400,
                    temperature: 0.1,
                    responseMimeType: 'application/json'
                }
            });

            const parsed = JSON.parse(text);
            for (const [ticker, sector] of Object.entries(parsed)) {
                const upper = ticker.toUpperCase();
                const sectorStr = String(sector).replace(/[."]/g, '').trim() || 'Outros';
                this.sectorCache.set(upper, sectorStr);
                result[upper] = sectorStr;
                // Persist to DB (fire and forget)
                this.saveSectorToDb(upper, sectorStr);
            }

            logger.info(`✅ [AI SECTOR BATCH] ${toFetch.length} setores obtidos e cacheados.`);
        } catch (e: any) {
            logger.warn('[AI SECTOR BATCH] Falha ao buscar setores em lote:', e.message);
            for (const t of toFetch) result[t] = 'Outros';
        }

        return result;
    }

    /**
     * Legacy single-ticker lookup — still works, now uses batch internally.
     */
    async getSuggestedSector(ticker: string): Promise<string> {
        const batch = await this.getBatchSectors([ticker]);
        return batch[ticker.toUpperCase()] ?? 'Outros';
    }
}
