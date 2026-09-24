import React from 'react';

export interface Asset {
    id?: number;
    category?: string;
    ticker: string;
    Quantidade: number;
    precoUnitario?: number;
    precoAtual?: number;
    "Valor Atualizado"?: number;
    lucroPrejuizo?: number;
    lucroPrejuizoPercentual?: number;
    "Instituição"?: string;
    indexador?: string;
    Emissor?: string;
    vencimento?: string;
    taxa?: string;
    source?: 'manual' | 'b3';
    [key: string]: any;
}

export interface Portfolio {
    ativos: { [key: string]: Asset[] };
    totais: { [key: string]: number };
    totalInvestido?: number;
    patrimonioAtual?: number;
    lucroPrejuizo?: number;
    lucroPrejuizoPercentual?: number;
    allocations?: {
        tipo: Record<string, number>;
        setor: Record<string, number>;
    }
}

import { TrendingUp, Building2, ShieldCheck, Briefcase, Bitcoin, Globe2, Landmark, Wallet, Globe, BarChart2, House, CircleDollarSign } from 'lucide-react';

export const COLORS = [
    '#38bdf8', // Blue
    '#818cf8', // Indigo
    '#fb7185', // Rose
    '#34d399', // Emerald
    '#fbbf24', // Amber
    '#a78bfa', // Purple
    '#f472b6', // Pink
    '#94a3b8'  // Slate
];

export const TABS = [
    { id: 'acoes', label: 'Ações BR', icon: TrendingUp },
    { id: 'acoes_internacionais', label: 'Ações Intl', icon: Globe },
    { id: 'etfs', label: 'ETFs BR', icon: Globe2 },
    { id: 'etfs_internacional', label: 'ETFs Internacionais', icon: Globe2 },
    { id: 'bonds', label: 'Bonds', icon: BarChart2 },
    { id: 'fiis', label: 'FIIs', icon: Building2 },
    { id: 'fundos', label: 'Fundos', icon: CircleDollarSign },
    { id: 'imoveis', label: 'Imóveis', icon: House },
    { id: 'renda_fixa', label: 'Renda Fixa', icon: ShieldCheck },
    { id: 'coe', label: 'COE', icon: Briefcase },
    { id: 'cripto', label: 'Cripto', icon: Bitcoin },
    { id: 'tesouro', label: 'Tesouro', icon: Landmark },
    { id: 'caixa', label: 'Caixa', icon: Wallet }
];

export const CATEGORIES = [
    { id: 'acoes', label: 'Ações BR' },
    { id: 'acoes_internacionais', label: 'Ações Internacionais' },
    { id: 'etfs', label: 'ETFs BR' },
    { id: 'etfs_internacional', label: 'ETFs Internacionais' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'fiis', label: 'FIIs' },
    { id: 'fundos', label: 'Fundos de Investimento' },
    { id: 'imoveis', label: 'Imóveis' },
    { id: 'renda_fixa', label: 'Renda Fixa' },
    { id: 'tesouro', label: 'Tesouro' },
    { id: 'cripto', label: 'Cripto' },
    { id: 'coe', label: 'COE' },
    { id: 'caixa', label: 'Caixa' }
];

export const B3_INSTITUTIONS = [
    'XP INVESTIMENTOS CCTVM S/A',
    'BANCO BTG PACTUAL S.A.',
    'NU INVEST CORRETORA DE VALORES S.A.',
    'CLEAR CORRETORA',
    'RICO INVESTIMENTOS',
    'BANCO ITÁU S/A',
    'BANCO DO BRASIL S/A',
    'BANCO BRADESCO S/A',
    'BANCO SANTANDER (BRASIL) S.A.',
    'CAIXA ECONOMICA FEDERAL',
    'BCO VOTORANTIM S/A',
    'AGORA CTVM S.A.',
    'ORAMA INVESTIMENTOS',
    'BTG PACTUAL CORRETORA DE MERCADORIAS LTDA',
    'GENIAL INVESTIMENTOS CORRETORA DE VALORES S.A.',
    'INTER DTVM LTDA',
    'C6 CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA',
    'Outra'
];

export const CRIPTO_OPTIONS = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'ADA', 'XRP', 'DOT', 'LINK', 'DOGE', 'Outra'];

export const ETF_INTL_OPTIONS = ['IVV', 'VOO', 'QQQ', 'VT', 'VTI', 'VEA', 'SCHD', 'VNQ', 'Outro'];

export const ACOES_INTL_OPTIONS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'JPM', 'UNH', 'Outra'];

export const BONDS_OPTIONS = ['TLT', 'AGG', 'BND', 'IEF', 'SHY', 'TIPS', 'HYG', 'LQD', 'BNDX', 'Outro'];

export const CustomLegendOverlay = ({ data, total, show, formatLabel, title = "Legenda", colors = COLORS }: any) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: show ? 0 : '-100%',
            width: '240px',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            borderLeft: '1px solid var(--glass-border-strong)',
            padding: '1.2rem',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
            overflowY: 'auto',
            borderRadius: '0 16px 16px 0',
            boxShadow: show ? '-15px 0 35px -5px rgba(0,0,0,0.6)' : 'none',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                {title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {data.map((item: any, i: number) => {
                    const value = item.value || 0;
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    const name = formatLabel ? formatLabel(item.name) : item.name;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                <div style={{ minWidth: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color || colors[i % colors.length] }} />
                                <span style={{ color: '#cbd5e1', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }} title={name}>
                                    {name}
                                </span>
                            </div>
                            <span style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 800 }}>
                                {percent}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
