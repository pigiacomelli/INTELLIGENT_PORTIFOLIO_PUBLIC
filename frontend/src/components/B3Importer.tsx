import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { type Asset, CATEGORIES } from '../utils/dashboardUtils';


interface B3ImporterProps {
    onImport: (assets: Asset[]) => void;
    onClose: () => void;
}

export const B3Importer: React.FC<B3ImporterProps> = ({ onImport, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const parseFile = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                // Helper to find value by multiple possible column names (case/accent insensitive)
                const findValue = (row: any, possibleNames: string[]) => {
                    const rowKeys = Object.keys(row);
                    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

                    for (const name of possibleNames) {
                        const target = normalize(name);
                        const match = rowKeys.find(k => normalize(k) === target);
                        if (match !== undefined) return row[match];
                    }
                    return null;
                };

                const cleanNumber = (val: any): number => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    const cleaned = String(val).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                    return parseFloat(cleaned) || 0;
                };

                let allParsedAssets: Asset[] = [];

                for (const sheetName of workbook.SheetNames) {
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet) as any[];

                    const mappedAssets: Asset[] = json.map((row) => {
                        // --- Ticker Extraction (improved with more B3 column aliases) ---
                        const rawProduto = findValue(row, [
                            'Código de Negociação', 'Codigo de Negociacao',
                            'Produto', 'Ativo', 'Ticker', 'Papel',
                            'Código do Ativo', 'Codigo do Ativo',
                            'Título', 'Titulo'
                        ]);
                        // Take the first part before " - " and strip whitespace/control chars
                        let ticker = String(rawProduto || '')
                            .split(' - ')[0]
                            .replace(/[^\x20-\x7E\u00C0-\u024F]/g, '') // remove control chars
                            .trim();

                        const rawCodigo = findValue(row, ['Código', 'Codigo', 'Protocolo']);
                        const indexadorVal = String(
                            findValue(row, ['Indexador', 'Index', 'Remuneracao', 'Rentabilidade', 'Tipo de Rentabilidade']) || ''
                        ).trim() || 'Indeterminado';

                        const normalizeStr = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                        const b3Category = String(findValue(row, ['Tipo de Ativo', 'Tipo', 'Categoria', 'Classe', 'Produto']) || '');

                        const sheetNorm = normalizeStr(sheetName);
                        const catLower = normalizeStr(b3Category);

                        // --- Fixed Income: build unique ticker to avoid collisions ---
                        const rfKeywords = ['CDB', 'LCA', 'LCI', 'LC', 'LIG', 'CRI', 'CRA', 'Debenture', 'Debênture'];
                        const isRF = rfKeywords.some(k => ticker.toUpperCase().startsWith(k.toUpperCase()))
                            || catLower.includes('cdb') || catLower.includes('lca') || catLower.includes('lci')
                            || catLower.includes('renda fixa') || sheetNorm.includes('renda fixa');
                        const isTesouro = ticker.toUpperCase().includes('TESOURO') || catLower.includes('tesouro') || sheetNorm.includes('tesouro');

                        if (isRF) {
                            // Create a unique readable ID: "CDB IPCA+ (BANCO XYZ)"
                            const emissorRaw = String(findValue(row, ['Empresa', 'Emissor', 'Administrador', 'Instituicao', 'Agente Custodiante']) || '').trim();
                            const idxPart = indexadorVal !== 'Indeterminado' ? ` ${indexadorVal}` : '';
                            const codPart = rawCodigo ? ` (${rawCodigo})` : '';
                            const emsPart = emissorRaw && !codPart ? ` [${emissorRaw.substring(0, 20)}]` : '';
                            ticker = `${ticker}${idxPart}${codPart || emsPart}`;
                        } else if (isTesouro) {
                            // Tesouro: use full product name as ticker for display
                            ticker = String(rawProduto || ticker).trim();
                        }

                        // --- Value Fields ---
                        const valorTotal = cleanNumber(findValue(row, [
                            'Valor Atualizado CURVA', 'Valor Atualizado MTM', 'Valor Atualizado FECHAMENTO',
                            'Valor Atualizado', 'Valor Total', 'Valor Bruto', 'Valor Liquido',
                            'Financeiro', 'Saldo Bruto', 'Saldo', 'Valor', 'Total'
                        ]));
                        const quantidade = cleanNumber(findValue(row, [
                            'Quantidade', 'Quantidade Disponivel', 'Qtde', 'Qtd', 'Posicao', 'Cotas'
                        ]));
                        const rawPreco = cleanNumber(findValue(row, [
                            'Preço de Fechamento', 'Preco de Fechamento', 'Preço Unitário', 'Preco Unitario',
                            'Preco', 'Preço', 'Preco de Custo', 'Cotacao', 'Valor Unitário', 'Valor Unitario',
                            'Valor da Cota'
                        ]));

                        let finalQty = quantidade;
                        let finalPrice = 0;

                        if (valorTotal > 0 && quantidade > 0 && !isRF && !isTesouro) {
                            finalPrice = valorTotal / quantidade;
                            finalQty = quantidade;
                        } else if (valorTotal > 0 && (isRF || isTesouro)) {
                            // For fixed income, quantity = financial value
                            finalQty = valorTotal;
                            finalPrice = 1;
                        } else if (valorTotal > 0 && quantidade > 0) {
                            finalPrice = valorTotal / quantidade;
                            finalQty = quantidade;
                        } else if (valorTotal > 0) {
                            finalQty = valorTotal;
                            finalPrice = 1;
                        } else {
                            finalQty = quantidade;
                            finalPrice = rawPreco;
                        }

                        // --- Category Detection (Prioritized) ---
                        let category = 'acoes';
                        const tickerUpper = ticker.toUpperCase().trim();

                        // 1. Tesouro & Renda Fixa
                        if (isTesouro) {
                            category = 'tesouro';
                        } else if (isRF) {
                            category = 'renda_fixa';
                        }
                        // 2. Cripto (Prefixes or Crypto ETFs)
                        else if (
                            sheetNorm.includes('cripto') ||
                            catLower.includes('cripto') ||
                            catLower.includes('crypto') ||
                            ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'USDT', 'BNB'].some(c => tickerUpper.startsWith(c)) ||
                            ['HASH11', 'QBTC11', 'BITI11', 'ETHE11', 'QETH11', 'DEFI11', 'WEB311'].includes(tickerUpper)
                        ) {
                            category = 'cripto';
                        }
                        // 3. ETFs Internacionais & BDRs
                        else if (
                            sheetNorm.includes('etf') ||
                            catLower.includes('etf') ||
                            catLower.includes('bdr') ||
                            ['31', '32', '33', '34', '35', '39'].some(suffix => tickerUpper.endsWith(suffix)) ||
                            ['IVVB11', 'NASD11', 'SPXI11', 'EURP11', 'XINA11', 'USTK11'].includes(tickerUpper)
                        ) {
                            category = 'etfs_internacional';
                        }
                        // 4. FIIs (Final check for 11 pattern to avoid catching ETFs)
                        else if (
                            sheetNorm.includes('fii') ||
                            sheetNorm.includes('fundo imobiliario') ||
                            catLower.includes('fii') ||
                            catLower.includes('fundo imobiliario') ||
                            (tickerUpper.match(/^[A-Z]{4}11$/))
                        ) {
                            category = 'fiis';
                        }
                        // 5. COE (Very strict match to avoid misclassifying stocks like COEL3 or assets in "Ações" sheet)
                        else if (
                            (tickerUpper === 'COE') ||
                            (catLower.startsWith('coe') && !catLower.includes('acoes') && !catLower.includes('emprestimo')) ||
                            (sheetNorm.includes('coe') && !sheetNorm.includes('acoes') && !sheetNorm.includes('emprestimo')) ||
                            catLower.includes('certificado de operacoes estruturadas')
                        ) {
                            category = 'coe';
                        }
                        // 6. Fundos
                        else if (sheetNorm.includes('fundo') || catLower.includes('fundo')) {
                            category = 'fundos';
                        }

                        // --- Ticker Normalization ---
                        let finalTicker = ticker.toUpperCase().trim();
                        // Only add .SA to short equity tickers (not RF, tesouro, cripto, ETF)
                        const noSuffixCategories = ['cripto', 'etfs_internacional', 'renda_fixa', 'tesouro', 'coe'];
                        if (!noSuffixCategories.includes(category) && !finalTicker.includes('.') && !finalTicker.includes(' ')) {
                            if (finalTicker.length >= 4 && finalTicker.length <= 6) {
                                finalTicker += '.SA';
                            }
                        }

                        const emissor = String(findValue(row, ['Empresa', 'Emissor', 'Administrador', 'Instituicao']) || '').trim();
                        const instituicao = String(findValue(row, ['Agente Custodiante', 'Corretora', 'Instituicao', 'Custodiante']) || '').trim();

                        return {
                            ticker: finalTicker,
                            Quantidade: finalQty,
                            precoUnitario: finalPrice,
                            "Valor Atualizado": valorTotal > 0 ? valorTotal : (finalQty * finalPrice),
                            "Instituição": instituicao,
                            Emissor: emissor,
                            indexador: indexadorVal,
                            category
                        };
                    }).filter(a => {
                        // Filter out rows with empty/invalid tickers or zero value
                        const t = String(a.ticker || '').trim();
                        return t.length > 0 && t !== 'UNDEFINED' && t !== 'NAN' && a.Quantidade > 0;
                    });

                    allParsedAssets = [...allParsedAssets, ...mappedAssets];
                }

                // Consolidate identical assets (from database.py "consolidar" logic)
                const consolidated: Record<string, Asset> = {};
                for (const asset of allParsedAssets) {
                    if (consolidated[asset.ticker]) {
                        const existing = consolidated[asset.ticker];
                        const newTotalValue = (existing["Valor Atualizado"] || 0) + (asset["Valor Atualizado"] || 0);
                        const newTotalQty = existing.Quantidade + asset.Quantidade;

                        consolidated[asset.ticker] = {
                            ...existing,
                            Quantidade: newTotalQty,
                            "Valor Atualizado": newTotalValue,
                            precoUnitario: newTotalQty > 0 ? newTotalValue / newTotalQty : existing.precoUnitario,
                        };
                    } else {
                        consolidated[asset.ticker] = asset;
                    }
                }

                setParsedData(Object.values(consolidated));
                setIsLoading(false);
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error('Error parsing excel:', err);
            setError('Falha ao processar o arquivo. Certifique-se de que é um Excel válido da B3.');
            setIsLoading(false);
        }
    };

    const confirmImport = () => {
        onImport(parsedData);
        onClose();
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
            {!parsedData.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                            borderRadius: '24px',
                            padding: '5rem 2rem',
                            textAlign: 'center',
                            background: isDragging ? 'rgba(56, 189, 248, 0.08)' : 'rgba(30, 41, 59, 0.2)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                            boxShadow: isDragging ? '0 0 40px rgba(56, 189, 248, 0.1)' : 'none',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('b3-upload')?.click()}
                    >
                        {/* Decorative background glow */}
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

                        <div style={{
                            width: '90px', height: '90px', borderRadius: '24px',
                            background: isDragging ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 2rem', transition: 'all 0.3s',
                            border: '1px solid var(--glass-border-strong)'
                        }}>
                            <Upload size={44} className={isDragging ? "animate-bounce" : ""} color={isDragging ? "var(--accent-blue)" : "var(--text-muted)"} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                            Sincronizar Carteira B3
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '1rem', maxWidth: '400px', margin: '1rem auto 0', fontWeight: 500, lineHeight: 1.5 }}>
                            Arraste seu extrato consolidado (.xlsx) ou clique para selecionar. Seus dados são processados localmente e com total privacidade.
                        </p>
                        <input id="b3-upload" type="file" hidden accept=".xlsx, .xls" onChange={handleFileChange} />

                        {file && (
                            <div className="animate-fade-in" style={{
                                marginTop: '2.5rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '15px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                padding: '1rem 2rem',
                                borderRadius: '16px',
                                color: 'var(--accent-blue)',
                                fontWeight: 800,
                                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.1)'
                            }}>
                                <FileText size={20} />
                                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                                    title="Remover arquivo"
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-rose)', background: 'rgba(244, 63, 94, 0.1)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                            <AlertCircle size={22} />
                            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={parseFile}
                        disabled={!file || isLoading}
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, var(--accent-blue) 0%, #3b82f6 100%)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: (!file || isLoading) ? 'none' : '0 10px 25px rgba(56, 189, 248, 0.4)',
                            opacity: (!file || isLoading) ? 0.6 : 1
                        }}
                    >
                        {isLoading ? (
                            <><RefreshCw size={24} className="animate-spin" /> PROCESSANDO DADOS...</>
                        ) : 'ANALISAR EXTRATO B3'}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Compatível com o novo portal do investidor B3
                        </span>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{
                        maxHeight: '450px',
                        overflowY: 'auto',
                        borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(15, 23, 42, 0.4)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--glass-border)' }}>Ativo</th>
                                    <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--glass-border)' }}>Classe</th>
                                    <th style={{ textAlign: 'right', padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--glass-border)' }}>Qtd.</th>
                                    <th style={{ textAlign: 'right', padding: '1.2rem 1.5rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--glass-border)' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((asset, idx) => (
                                    <tr key={idx} style={{ transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }} />
                                                <span style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem' }}>{asset.ticker}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span style={{
                                                background: 'rgba(56, 189, 248, 0.08)',
                                                border: '1px solid rgba(56, 189, 248, 0.15)',
                                                color: 'var(--accent-blue)',
                                                padding: '4px 12px',
                                                borderRadius: '30px',
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {CATEGORIES.find(c => c.id === asset.category)?.label || asset.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            {asset.Quantidade.toLocaleString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', fontWeight: 900, color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            R$ {(asset["Valor Atualizado"] || asset.Quantidade * (asset.precoUnitario || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button
                            onClick={() => setParsedData([])}
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            CORRIGIR ARQUIVO
                        </button>
                        <button
                            onClick={confirmImport}
                            style={{
                                flex: 2,
                                padding: '1.2rem',
                                borderRadius: '16px',
                                background: 'var(--accent-emerald)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 950,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.3s',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <CheckCircle2 size={22} strokeWidth={3} /> CONFIRMAR IMPORTAÇÃO ({parsedData.length} ATIVOS)
                        </button>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                        <AlertCircle size={18} color="var(--accent-amber)" />
                        <p style={{ color: 'var(--accent-amber)', fontSize: '0.85rem', margin: 0, fontWeight: 700, letterSpacing: '0.2px' }}>
                            Nota: Esta ação irá consolidar e atualizar suas posições existentes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
