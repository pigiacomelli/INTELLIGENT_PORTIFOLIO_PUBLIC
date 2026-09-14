import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldCheck, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface DiagnosticData {
    diversificationLevel: 'Baixa' | 'Média' | 'Alta';
    concentrationRisk: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
}

export const DiagnosticPanel: React.FC = () => {
    const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDiagnostic = async () => {
            try {
                const token = localStorage.getItem('@SmartApp:token');
                const response = await axios.get('/api/portfolio/diagnostic', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDiagnostic(response.data);
            } catch (err: any) {
                console.error('Error fetching diagnostic:', err);
                setError('Não foi possível carregar o diagnóstico inteligente neste momento.');
            } finally {
                setLoading(false);
            }
        };

        fetchDiagnostic();
    }, []);

    if (loading) {
        return (
            <div className="glass-card animate-fade-in" style={{ padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px', background: 'rgba(30, 41, 59, 0.3)', border: '1px solid var(--glass-border)', borderRadius: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="pulse" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)', border: '2px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={24} color="var(--accent-blue)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Análise em Andamento</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>O consultor de IA está processando sua estratégia de alocação...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !diagnostic) {
        return (
            <div className="glass-card" style={{ padding: '2.5rem', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-rose)' }}>
                    <AlertTriangle size={24} /> Diagnóstico Indisponível
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '1.5rem' }}>{error || 'Não foi possível gerar o diagnóstico.'}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
                    style={{ background: 'var(--accent-rose)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const getDiversificationColor = (level: string) => {
        if (level === 'Alta') return 'var(--accent-emerald)';
        if (level === 'Média') return 'var(--accent-amber)';
        return 'var(--accent-rose)';
    };

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--glass-border)', borderRadius: '24px' }}>
            {/* AI Glow Effect */}
            <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-secondary)' }}>
                            <Sparkles size={20} />
                        </div>
                        Insight Estratégico
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>Análise avançada de riscos e oportunidades baseada na sua carteira atual.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Diversificação</span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '6px 16px',
                        borderRadius: '30px',
                        border: `1px solid ${getDiversificationColor(diagnostic.diversificationLevel)}44`
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getDiversificationColor(diagnostic.diversificationLevel), boxShadow: `0 0 10px ${getDiversificationColor(diagnostic.diversificationLevel)}` }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: getDiversificationColor(diagnostic.diversificationLevel) }}>
                            Nível {diagnostic.diversificationLevel}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', position: 'relative', zIndex: 1 }}>
                {/* Concentration Risk */}
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                        <Activity size={18} color="var(--accent-amber)" />
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Exposição ao Risco</h4>
                    </div>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: 500 }}>
                        {diagnostic.concentrationRisk}
                    </p>
                </div>

                {/* Recommendation */}
                <div className="glass-card" style={{ background: 'rgba(56, 189, 248, 0.03)', padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                        <TrendingUp size={18} color="var(--accent-blue)" />
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Diretriz Sugerida</h4>
                    </div>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: 500 }}>
                        {diagnostic.recommendation}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem', position: 'relative', zIndex: 1 }}>
                {/* Strengths */}
                <div style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                        <ShieldCheck size={18} /> Força da Carteira
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {diagnostic.strengths.map((str, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, display: 'flex', gap: '10px' }}>
                                <span style={{ color: 'var(--accent-emerald)', fontWeight: 900 }}>✓</span>
                                <span style={{ lineHeight: '1.4' }}>{str}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-rose)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                        <AlertTriangle size={18} /> Pontos de Atenção
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {diagnostic.weaknesses.map((weak, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, display: 'flex', gap: '10px' }}>
                                <span style={{ color: 'var(--accent-rose)', fontWeight: 900 }}>!</span>
                                <span style={{ lineHeight: '1.4' }}>{weak}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
