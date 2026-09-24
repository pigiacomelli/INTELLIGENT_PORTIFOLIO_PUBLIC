import React from 'react';
import { Pencil, Trash2, ExternalLink, Info, TrendingUp, TrendingDown, Building2, Layers, Hash, Tag, Database, DollarSign, BarChart, Activity, ArrowUpRight } from 'lucide-react';
import type { Asset } from '../utils/dashboardUtils';
import { EmptyPortfolio } from './EmptyPortfolio';

interface PortfolioTableProps {
    assets: Asset[];
    activeTab: string;
    onEdit: (category: string, index: number, asset: Asset) => void;
    onDelete: (category: string, index: number) => void;
    onAddAsset: () => void;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ assets, activeTab, onEdit, onDelete, onAddAsset }) => {
    const catTotal = assets.reduce((acc: number, curr: any) => acc + (curr["Valor Atualizado"] || curr.Quantidade || 0), 0);
    const sortedAssets = [...assets].map((a, i) => ({ ...a, _originalIndex: i })).sort((a, b) => (b["Valor Atualizado"] || b.Quantidade || 0) - (a["Valor Atualizado"] || a.Quantidade || 0));
    const valueBasedCategory = ['renda_fixa', 'tesouro', 'coe', 'caixa', 'imoveis'].includes(activeTab);

    if (assets.length === 0) {
        return <EmptyPortfolio onAddAsset={onAddAsset} />;
    }

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Hash size={14} /> Ativo</div>
                        </th>
                        <th style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={14} /> Classificação</div>
                        </th>
                        <th style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={14} /> Qtd / Pos</div>
                        </th>
                        <th style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={14} /> Financeiro Atual</div>
                        </th>
                        <th style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', width: '15%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowUpRight size={14} /> Variação</div>
                        </th>
                        <th style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)', width: '20%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart size={14} /> Alocação</div>
                        </th>
                        <th style={{ padding: '2rem 2.5rem', textAlign: 'right', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}><Activity size={14} /> Ações</div>
                        </th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '0.95rem' }}>
                    {sortedAssets.map((asset, idx) => {
                        const valor = asset["Valor Atualizado"] || asset.Quantidade || 0;
                        const percent = ((valor / (catTotal || 1)) * 100).toFixed(1);

                        return (
                            <tr key={asset._originalIndex} className="table-row-hover" style={{ transition: 'all 0.3s' }}>
                                <td style={{ padding: '1.5rem 2.5rem', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-blue)',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            border: '1px solid rgba(56, 189, 248, 0.2)'
                                        }}>
                                            {asset.ticker.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{asset.ticker}</div>
                                                {asset.source === 'b3' && (
                                                    <span style={{
                                                        background: 'var(--accent-blue)',
                                                        color: 'white',
                                                        fontSize: '0.6rem',
                                                        fontWeight: 900,
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        textTransform: 'uppercase',
                                                        boxShadow: '0 2px 4px rgba(56, 189, 248, 0.3)'
                                                    }}>B3</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Building2 size={12} /> {asset.Emissor || asset.Instituição || 'Não Informado'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 1.5rem', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    {asset.indexador ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{
                                                background: asset.indexador === 'Indeterminado' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                                                color: asset.indexador === 'Indeterminado' ? 'var(--accent-rose)' : 'var(--accent-blue)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                border: `1px solid ${asset.indexador === 'Indeterminado' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)'}`,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                width: 'fit-content'
                                            }}>
                                                {asset.taxa ? `${asset.indexador} @ ${asset.taxa}` : asset.indexador}
                                            </span>
                                            {asset.vencimento && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Activity size={10} /> Venc: {new Date(asset.vencimento).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    ) : activeTab === 'imoveis' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Building2 size={14} /> Imóvel físico
                                        </div>
                                    ) : activeTab === 'fundos' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Layers size={14} /> Fundo de investimento
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <TrendingUp size={14} /> Ativo de Mercado
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 800, borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    {valueBasedCategory ? <span style={{ color: 'var(--text-muted)' }}>—</span> : <>{asset.Quantidade.toLocaleString('pt-BR')} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UN</span></>}
                                </td>
                                <td style={{ padding: '1.5rem 1.5rem', fontWeight: 900, color: 'var(--text-main)', fontSize: '1.15rem', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginRight: '4px' }}>R$</span>
                                    {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '1.5rem 1.5rem', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    {asset.lucroPrejuizoPercentual !== undefined ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 800,
                                            color: asset.lucroPrejuizoPercentual >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                                            fontSize: '0.9rem'
                                        }}>
                                            {asset.lucroPrejuizoPercentual >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {asset.lucroPrejuizoPercentual > 0 ? '+' : ''}{asset.lucroPrejuizoPercentual.toFixed(2)}%
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem 1.5rem', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue) 0%, #60a5fa 100%)', borderRadius: '10px', boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)' }} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{percent}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right', borderBottom: idx === sortedAssets.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => onEdit(activeTab, asset._originalIndex, asset)}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.7rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(activeTab, asset._originalIndex)}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.7rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
