import React from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, BadgeDollarSign } from 'lucide-react';

interface PortfolioSummaryProps {
    caixaTotal: number;
    totalValue: number;
    assetCount: number;
    lucroPrejuizo?: number;
    lucroPrejuizoPercentual?: number;
    vertical?: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ caixaTotal, totalValue, assetCount, lucroPrejuizo, lucroPrejuizoPercentual, vertical }) => {
    const isPositive = (lucroPrejuizo || 0) >= 0;
    const plColor = isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)';
    const plBg = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    if (vertical) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="glass-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)' }}>
                            <Wallet size={18} />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Patrimônio Total</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px' }}>
                        <span style={{ color: 'var(--accent-blue)', marginRight: '6px', fontSize: '1.8rem' }}>R$</span>
                        {(totalValue + caixaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {lucroPrejuizo !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1.2rem', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                            <Icon size={18} color={plColor} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: plColor }}>
                                {isPositive ? '+' : ''}R$ {lucroPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: plColor, background: plBg, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${plColor}44` }}>
                                {isPositive ? '+' : ''}{lucroPrejuizoPercentual?.toFixed(2)}%
                            </span>
                        </div>
                    )}
                </div>
                {caixaTotal > 0 && (
                    <div className="glass-card animate-fade-in" style={{ padding: '1.4rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <BadgeDollarSign size={20} color="var(--accent-emerald)" />
                            <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>CAIXA</span>
                        </div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                            R$ {caixaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
                <div className="glass-card animate-fade-in" style={{ padding: '1.4rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <TrendingUp size={20} color="var(--accent-blue)" />
                        <span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>ATIVOS</span>
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {assetCount} {assetCount === 1 ? 'Ativo' : 'Ativos'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }} className="animate-fade-in">
            {caixaTotal > 0 && (
                <div className="glass-card animate-shimmer" style={{ padding: '2rem 2.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '220px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                        <BadgeDollarSign size={100} color="var(--accent-emerald)" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
                        <BadgeDollarSign size={18} color="var(--accent-emerald)" />
                        <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Caixa Livre</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
                        <span style={{ color: 'var(--accent-emerald)', fontSize: '1.5rem', marginRight: '6px' }}>R$</span>
                        {caixaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            )}
            <div className="glass-card animate-shimmer" style={{ padding: '2rem 2.5rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '220px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <TrendingUp size={100} color="var(--accent-blue)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
                    <TrendingUp size={18} color="var(--accent-blue)" />
                    <span style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Total Ativos</span>
                </div>
                <p style={{ margin: '0', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>
                    {assetCount}
                    <span style={{ color: 'var(--accent-blue)', fontSize: '1.2rem', marginLeft: '6px', fontWeight: 700 }}>{assetCount === 1 ? 'ATIVO' : 'ATIVOS'}</span>
                </p>
            </div>
            <div className="glass-card" style={{ padding: '2rem 3rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)', border: '1px solid var(--glass-border)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.8rem' }}>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)' }}>
                            <Wallet size={18} color="var(--accent-blue)" />
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Patrimônio Investido</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-2px' }}>
                        <span style={{ color: 'var(--accent-blue)', fontSize: '2rem', marginRight: '10px' }}>R$</span>
                        {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                {lucroPrejuizo !== undefined && (
                    <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '320px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                            <Icon size={18} color={plColor} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Resultado Consolidado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <p style={{ margin: '0', fontSize: '2.2rem', fontWeight: 900, color: plColor, letterSpacing: '-1px' }}>
                                {isPositive ? '+' : ''}R$ {lucroPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: plColor, background: plBg, padding: '6px 14px', borderRadius: '30px', border: `1px solid ${plColor}44`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowUpRight size={16} />
                                {isPositive ? '+' : ''}{lucroPrejuizoPercentual?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
