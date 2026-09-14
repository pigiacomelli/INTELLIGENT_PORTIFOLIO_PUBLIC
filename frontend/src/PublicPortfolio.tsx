import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, AlertCircle, RefreshCw } from 'lucide-react';
import { AssetAllocationChart } from './components/AssetAllocationChart';
import { PortfolioSummary } from './components/PortfolioSummary';
import { COLORS } from './utils/dashboardUtils';

export const PublicPortfolio = () => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = window.location.pathname.split('/p/')[1];
        if (!token) {
            setError('Link inválido.');
            setIsLoading(false);
            return;
        }

        const fetchPublicData = async () => {
            try {
                const res = await axios.get(`/api/portfolio/public/${token}`);
                setData(res.data);
            } catch (err: any) {
                console.error('Error fetching public portfolio', err);
                setError(err.response?.data?.error || 'Portfólio não encontrado ou link expirado.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicData();
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--accent-blue)', justifyContent: 'center', alignItems: 'center' }}>
                <RefreshCw size={48} className="animate-spin" />
                <p style={{ marginTop: '1rem', fontWeight: 600 }}>Carregando portfólio...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', justifyContent: 'center', alignItems: 'center' }}>
                <AlertCircle size={64} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Ops!</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ marginTop: '2rem', background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '0.8rem 1.6rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                    Voltar para o Início
                </button>
            </div>
        );
    }

    const { totais, ativos, total_geral, allocations, patrimonioAtual } = data;
    const totalValue = total_geral || 0;
    const caixaTotal = totais.caixa || 0;

    // Use backend-calculated allocations if available, otherwise fallback to manual calculation
    const chartData = allocations?.tipo ?
        Object.entries(allocations.tipo).map(([name, value]) => ({ name, value: Number(value) })).filter(item => item.value > 0) :
        Object.keys(ativos).filter(k => k !== 'caixa' && ativos[k].length > 0).map(categoria => {
            const value = ativos[categoria].reduce((acc: number, asset: any) => {
                return acc + (asset["Valor Atualizado"] || asset.Quantidade * (asset.precoUnitario || 1));
            }, 0);
            return { name: categoria, value };
        }).filter(item => item.value > 0);

    const assetCount = Object.values(ativos).flat().length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header style={{ padding: '1.25rem 2rem', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={28} color="var(--accent-blue)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--accent-blue)', letterSpacing: '-0.5px' }}>Intelligent Portfolio</h1>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Visualização Pública Compartilhada</p>
                    </div>
                </div>
            </header>

            {/* Read Only Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', gap: '2rem' }}>
                <PortfolioSummary
                    caixaTotal={caixaTotal}
                    totalValue={patrimonioAtual || totalValue}
                    assetCount={assetCount}
                    vertical={false}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
                        <AssetAllocationChart
                            title="Alocação Pública por Classe"
                            icon={<Briefcase size={24} color="var(--accent-blue)" />}
                            data={chartData}
                            total={totalValue + caixaTotal}
                            showLegend={true}
                            colors={COLORS}
                            formatLabel={(n: string) => n.replace(/_/g, ' ').toUpperCase()}
                            height="400px"
                            innerRadius={80}
                            outerRadius={120}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quer ter o controle total dos seus investimentos também?</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ marginTop: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--accent-blue)', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Criar meu Intelligent Portfolio
                    </button>
                </div>
            </main>
        </div>
    );
};
