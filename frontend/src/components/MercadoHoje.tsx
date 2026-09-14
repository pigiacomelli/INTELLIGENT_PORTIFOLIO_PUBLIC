import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, Star, DollarSign, Activity, X, Globe, Zap, BarChart3, Clock, LayoutGrid, List, Newspaper, Info, PieChart, Wallet } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';





// ─── Sub-components ───────────────────────────────────────────────────────────

const PremiumCard = ({ children, style = {}, title, icon }: { children: React.ReactNode, style?: React.CSSProperties, title?: string, icon?: React.ReactNode }) => (
    <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        position: 'relative',
        ...style
    }}>
        {(title || icon) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {icon && <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--accent-blue)' }}>{icon}</div>}
                    {title && <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>{title}</h3>}
                </div>
            </div>
        )}
        {children}
    </div>
);


const AssetModal = ({ symbol, onClose }: { symbol: string, onClose: () => void }) => {
    const cleanSymbol = symbol.includes('.SA') ? `BMFBOVESPA:${symbol.replace('.SA', '')}` : symbol;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', width: '100%', maxWidth: '1200px', height: '90vh', borderRadius: '32px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>
                    <X size={24} />
                </button>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '12px', borderRadius: '16px', fontWeight: 900, fontSize: '1.2rem' }}>{symbol.replace('.SA', '')}</div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Detalhes do Ativo</h2>
                </div>
                <div style={{ flex: 1, padding: '1rem' }}>
                    <TradingViewWidget
                        type="chart"
                        containerId={`chart_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
                        widgetConfig={{
                            "autosize": true,
                            "symbol": cleanSymbol,
                            "interval": "D",
                            "timezone": "Etc/UTC",
                            "theme": "dark",
                            "style": "1",
                            "locale": "br",
                            "toolbar_bg": "#f1f3f6",
                            "enable_publishing": false,
                            "allow_symbol_change": true,
                            "save_image": false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export const MercadoHoje: React.FC<{ userAssets?: Record<string, any[]> }> = ({ userAssets = {} }) => {
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [marketType, setMarketType] = useState<'nacional' | 'internacional'>('nacional');
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

    const refreshData = useCallback(() => {
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    }, []);

    useEffect(() => {
        refreshData();
        const interval = setInterval(() => { refreshData(); }, 60_000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const flatUserAssets = useMemo(() => {
        const allAssets: any[] = [];
        Object.entries(userAssets).forEach(([cat, assets]) => {
            if (Array.isArray(assets)) {
                assets.forEach(a => {
                    const price = a['Preço Médio'] || a.preco_medio || 0;
                    const value = a['Valor Atualizado'] || (a.Quantidade * price) || 0;
                    const rentability = a['Rentabilidade Percentual'] || 0;
                    const name = a.ticker || a.Produto || a.Nome || 'Variado';
                    if (name !== 'Variado') {
                        allAssets.push({ name, value, rentability, cat });
                    }
                });
            }
        });
        return allAssets.sort((a, b) => b.value - a.value);
    }, [userAssets]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fade-in 0.5s ease-out', paddingBottom: '4rem' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .hover-scale { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-scale:hover { transform: scale(1.02); }
                .tab-button {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    padding: 0.8rem 1.5rem;
                    cursor: pointer;
                    font-weight: 800;
                    font-size: 0.9rem;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .tab-button.active {
                    color: var(--accent-blue);
                    border-bottom-color: var(--accent-blue);
                }
            `}</style>

            {/* Premium Ticker Tape - Top Full Width */}
            <div style={{ margin: '0 -3rem', marginBottom: '-1rem' }}>
                <TradingViewWidget
                    type="ticker-tape"
                    containerId="ticker_tape_global"
                    height={50}
                    widgetConfig={{
                        "symbols": [
                            { "proName": "FX_IDC:USDBRL", "title": "USD/BRL" },
                            { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
                            { "proName": "BMFBOVESPA:IBOV", "title": "Ibovespa" },
                            { "proName": "BMFBOVESPA:PETR4", "title": "Petrobras" },
                            { "proName": "BMFBOVESPA:VALE3", "title": "Vale" },
                            { "proName": "NASDAQ:AAPL", "title": "Apple" },
                            { "proName": "NASDAQ:TSLA", "title": "Tesla" },
                            { "proName": "FX:EURUSD", "title": "EUR/USD" }
                        ],
                        "showSymbolLogo": true,
                        "colorTheme": "dark",
                        "isTransparent": true,
                        "displayMode": "adaptive",
                        "locale": "br"
                    }}
                />
            </div>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '6px', borderRadius: '10px' }}><Globe size={20} /></div>
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, letterSpacing: '-1px' }}>Monitor de Mercado</h2>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {marketType === 'nacional' ? 'Dados B3 (delay 15min)' : 'Dados Globais em Tempo Real'} • <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{lastUpdate}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        padding: '4px',
                        display: 'flex',
                        gap: '4px'
                    }}>
                        <button
                            onClick={() => setMarketType('nacional')}
                            style={{
                                background: marketType === 'nacional' ? 'var(--accent-blue)' : 'transparent',
                                border: 'none',
                                color: marketType === 'nacional' ? 'white' : 'var(--text-muted)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🇧🇷 NACIONAL
                        </button>
                        <button
                            onClick={() => setMarketType('internacional')}
                            style={{
                                background: marketType === 'internacional' ? 'var(--accent-blue)' : 'transparent',
                                border: 'none',
                                color: marketType === 'internacional' ? 'white' : 'var(--text-muted)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🌎 INTERNACIONAL
                        </button>
                    </div>

                    <button onClick={refreshData} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: 'var(--accent-blue)', padding: '0.8rem 1.2rem', borderRadius: '16px', cursor: 'pointer', display: 'flex' }}>
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
                <PremiumCard title={marketType === 'nacional' ? "Mercado Nacional" : "Mercado Global"} icon={<Globe size={20} />} style={{ padding: 0 }}>
                    <div style={{ height: '220px' }}>
                        <TradingViewWidget
                            type="symbol-overview"
                            containerId="overview_b3_intl"
                            widgetConfig={{
                                "symbols": marketType === 'nacional' ? [
                                    ["B3", "BMFBOVESPA:IBOV|1D"],
                                    ["IFIX", "BMFBOVESPA:IFIX|1D"]
                                ] : [
                                    ["S&P 500", "FOREXCOM:SPXUSD|1D"],
                                    ["NASDAQ", "FOREXCOM:NSXUSD|1D"],
                                    ["DOW JONES", "FOREXCOM:DJI|1D"]
                                ],
                                "chartOnly": false,
                                "width": "100%",
                                "height": "100%",
                                "locale": "br",
                                "colorTheme": "dark",
                                "autosize": true,
                                "showVolume": false,
                                "showMA": false,
                                "hideDateRanges": false,
                                "hideMarketStatus": true,
                                "hideSymbolLogo": false,
                                "scalePosition": "none",
                                "scaleMode": "Normal",
                                "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                                "fontSize": "10",
                                "noTimeScale": true,
                                "valuesTracking": "1",
                                "changeMode": "price-and-percent",
                                "chartType": "area",
                                "lineWidth": 2,
                                "lineColor": "rgba(41, 98, 255, 1)",
                                "bottomColor": "rgba(41, 98, 255, 0)",
                                "topColor": "rgba(41, 98, 255, 0.3)"
                            }}
                        />
                    </div>
                </PremiumCard>
                <PremiumCard title="Taxas e Câmbio" icon={<DollarSign size={20} />} style={{ padding: 0 }}>
                    <div style={{ height: '220px' }}>
                        <TradingViewWidget
                            type="symbol-overview"
                            containerId="overview_fx"
                            widgetConfig={{
                                "symbols": [
                                    ["Dólar", "FX_IDC:USDBRL|1D"],
                                    ["Euro", "FX_IDC:EURBRL|1D"]
                                ],
                                "chartOnly": false,
                                "width": "100%",
                                "height": "100%",
                                "locale": "br",
                                "colorTheme": "dark",
                                "autosize": true,
                                "showVolume": false,
                                "showMA": false,
                                "hideDateRanges": false,
                                "hideMarketStatus": true,
                                "hideSymbolLogo": false,
                                "scalePosition": "none",
                                "scaleMode": "Normal",
                                "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                                "fontSize": "10",
                                "noTimeScale": true,
                                "valuesTracking": "1",
                                "changeMode": "price-and-percent",
                                "chartType": "area",
                                "lineWidth": 2,
                                "lineColor": "rgba(16, 185, 129, 1)",
                                "bottomColor": "rgba(16, 185, 129, 0)",
                                "topColor": "rgba(16, 185, 129, 0.3)"
                            }}
                        />
                    </div>
                </PremiumCard>
                <PremiumCard title="Criptoativos Base" icon={<Zap size={20} />} style={{ padding: 0 }}>
                    <div style={{ height: '220px' }}>
                        <TradingViewWidget
                            type="symbol-overview"
                            containerId="overview_crypto"
                            widgetConfig={{
                                "symbols": [
                                    ["Bitcoin", "BINANCE:BTCUSD|1D"],
                                    ["Ethereum", "BINANCE:ETHUSD|1D"]
                                ],
                                "chartOnly": false,
                                "width": "100%",
                                "height": "100%",
                                "locale": "br",
                                "colorTheme": "dark",
                                "autosize": true,
                                "showVolume": false,
                                "showMA": false,
                                "hideDateRanges": false,
                                "hideMarketStatus": true,
                                "hideSymbolLogo": false,
                                "scalePosition": "none",
                                "scaleMode": "Normal",
                                "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                                "fontSize": "10",
                                "noTimeScale": true,
                                "valuesTracking": "1",
                                "changeMode": "price-and-percent",
                                "chartType": "area",
                                "lineWidth": 2,
                                "lineColor": "rgba(245, 158, 11, 1)",
                                "bottomColor": "rgba(245, 158, 11, 0)",
                                "topColor": "rgba(245, 158, 11, 0.3)"
                            }}
                        />
                    </div>
                </PremiumCard>
            </div>

            {/* Main Market View */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: My Assets / Heatmaps + News */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {marketType === 'nacional' ? (
                        <PremiumCard title="Meus Ativos (Brasil)" icon={<Wallet size={20} />}>
                            <div style={{ height: '600px', overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {flatUserAssets.length > 0 ? flatUserAssets.map((asset, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem', background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px', border: '1px solid var(--glass-border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: 'var(--accent-blue)', color: 'white', padding: '10px 12px', borderRadius: '12px', fontWeight: 900, fontSize: '1rem' }}>
                                                {asset.name}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{asset.cat.replace('_', ' ')}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                                                color: asset.rentability >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                                            }}>
                                                {asset.rentability >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {asset.rentability > 0 ? '+' : ''}{asset.rentability.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
                                        <PieChart size={48} opacity={0.5} />
                                        <p style={{ margin: 0, fontWeight: 600 }}>Nenhum ativo alocado no momento.</p>
                                    </div>
                                )}
                            </div>
                        </PremiumCard>
                    ) : (
                        <PremiumCard title="Mapa de Calor - S&P 500" icon={<LayoutGrid size={20} />} style={{ padding: 0 }}>
                            <div style={{ height: '600px', width: '100%' }}>
                                <TradingViewWidget
                                    type="heatmap"
                                    containerId="heatmap_intl_dedicated"
                                    widgetConfig={{
                                        "symbolGroups": [
                                            {
                                                "name": "EUA (S&P 500)", "symbols": [
                                                    { "name": "NASDAQ:AAPL" }, { "name": "NASDAQ:MSFT" }, { "name": "NASDAQ:AMZN" },
                                                    { "name": "NASDAQ:GOOGL" }, { "name": "NASDAQ:META" }, { "name": "NASDAQ:TSLA" },
                                                    { "name": "NASDAQ:NVDA" }, { "name": "NYSE:BRK.B" }, { "name": "NYSE:JPM" },
                                                    { "name": "NYSE:V" }, { "name": "NYSE:MA" }, { "name": "NYSE:UNH" },
                                                    { "name": "NASDAQ:NFLX" }, { "name": "NASDAQ:COST" }, { "name": "NYSE:WMT" }
                                                ]
                                            }
                                        ],
                                        "colorTheme": "dark",
                                        "isTransparent": true,
                                        "showSymbolLogo": true,
                                        "locale": "br"
                                    }}
                                />
                            </div>
                        </PremiumCard>
                    )}

                    <PremiumCard title={marketType === 'nacional' ? "Notícias Brasil" : "Notícias Internacionais"} icon={<Newspaper size={20} />}>
                        <div style={{ height: '500px' }}>
                            <TradingViewWidget
                                type="timeline"
                                containerId={`timeline_${marketType}`}
                                widgetConfig={{
                                    "feedMode": "market",
                                    "market": "stock",
                                    "colorTheme": "dark",
                                    "isTransparent": true,
                                    "displayMode": "regular",
                                    "locale": "br"
                                }}
                            />
                        </div>
                    </PremiumCard>
                </div>

                {/* Right Column: Movers / Screener */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <PremiumCard title="Sentimento do Mercado" icon={<Activity size={20} />}>
                        <div style={{ height: '400px' }}>
                            <TradingViewWidget
                                type="technical-analysis"
                                containerId={`tech_analysis_${marketType}`}
                                widgetConfig={{
                                    "interval": "1D",
                                    "width": "100%",
                                    "isTransparent": true,
                                    "height": "100%",
                                    "symbol": marketType === 'nacional' ? "BMFBOVESPA:IBOV" : "AMEX:SPY",
                                    "showIntervalTabs": true,
                                    "displayMode": "single",
                                    "locale": "br",
                                    "colorTheme": "dark"
                                }}
                            />
                        </div>
                    </PremiumCard>

                    <PremiumCard title={marketType === 'nacional' ? "Maiores Variações B3" : "Maiores Variações Internacionais"} icon={<Activity size={20} />}>
                        <div style={{ height: '400px' }}>
                            <TradingViewWidget
                                type="screener"
                                containerId={`screener_${marketType}`}
                                widgetConfig={{
                                    "width": "100%",
                                    "height": "100%",
                                    "defaultColumn": "overview",
                                    "defaultScreen": "top_gainers",
                                    "market": marketType === 'nacional' ? "brazil" : "america",
                                    "showToolbar": false,
                                    "colorTheme": "dark",
                                    "locale": "br"
                                }}
                            />
                        </div>
                    </PremiumCard>

                    <PremiumCard title="Criptomoedas" icon={<Zap size={20} />}>
                        <div style={{ height: '350px' }}>
                            <TradingViewWidget
                                type="screener"
                                containerId="screener_crypto_ref"
                                widgetConfig={{
                                    "width": "100%",
                                    "height": "100%",
                                    "defaultColumn": "overview",
                                    "screener_type": "crypto_mkt",
                                    "displayCurrency": "USD",
                                    "colorTheme": "dark",
                                    "locale": "br"
                                }}
                            />
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Bottom Row Market Quotes */}
            {marketType === 'nacional' && (
                <div style={{ marginTop: '1rem' }}>
                    <PremiumCard title="Cotações e Variações (B3 & ETFs)" icon={<List size={20} />}>
                        <div style={{ height: '500px' }}>
                            <TradingViewWidget
                                type="market-quotes"
                                containerId="market_quotes_nacional"
                                widgetConfig={{
                                    "width": "100%",
                                    "height": "100%",
                                    "symbolsGroups": [
                                        {
                                            "name": "Ações B3",
                                            "originalName": "Ações B3",
                                            "symbols": [
                                                { "name": "BMFBOVESPA:PETR4" },
                                                { "name": "BMFBOVESPA:VALE3" },
                                                { "name": "BMFBOVESPA:ITUB4" },
                                                { "name": "BMFBOVESPA:BBDC4" },
                                                { "name": "BMFBOVESPA:BBAS3" },
                                                { "name": "BMFBOVESPA:WEGE3" },
                                                { "name": "BMFBOVESPA:MGLU3" },
                                                { "name": "BMFBOVESPA:ABEV3" },
                                                { "name": "BMFBOVESPA:RENT3" },
                                                { "name": "BMFBOVESPA:B3SA3" }
                                            ]
                                        },
                                        {
                                            "name": "FIIs",
                                            "originalName": "FIIs",
                                            "symbols": [
                                                { "name": "BMFBOVESPA:MXRF11" },
                                                { "name": "BMFBOVESPA:HGLG11" },
                                                { "name": "BMFBOVESPA:XPML11" },
                                                { "name": "BMFBOVESPA:BTLG11" },
                                                { "name": "BMFBOVESPA:VISC11" },
                                                { "name": "BMFBOVESPA:KNRI11" },
                                                { "name": "BMFBOVESPA:IRDM11" },
                                                { "name": "BMFBOVESPA:CPTS11" },
                                                { "name": "BMFBOVESPA:TRXF11" }
                                            ]
                                        },
                                        {
                                            "name": "ETFs Internacionais",
                                            "originalName": "ETFs Internacionais",
                                            "symbols": [
                                                { "name": "AMEX:SPY" },
                                                { "name": "NASDAQ:QQQ" },
                                                { "name": "AMEX:IVV" },
                                                { "name": "NYSE:DIA" },
                                                { "name": "BMFBOVESPA:IVVB11" },
                                                { "name": "BMFBOVESPA:NASD11" },
                                                { "name": "AMEX:XLF" },
                                                { "name": "AMEX:XLK" }
                                            ]
                                        }
                                    ],
                                    "showSymbolLogo": true,
                                    "isTransparent": true,
                                    "colorTheme": "dark",
                                    "locale": "br"
                                }}
                            />
                        </div>
                    </PremiumCard>
                </div>
            )}

            {/* Asset Detail Modal */}
            {selectedAsset && (
                <AssetModal symbol={selectedAsset} onClose={() => setSelectedAsset(null)} />
            )}
        </div>
    );
};
