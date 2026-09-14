import React, { useEffect, useState } from 'react';
import {
    ArrowRight,
    LayoutDashboard,
    ShieldCheck,
    Cpu,
    Upload,
    CheckCircle2,
    Lock,
    AlertTriangle
} from 'lucide-react';
import { trackCTAClick, useScrollTracking } from '../utils/tracking';

interface LandingPageDesktopProps {
    onGetStarted: () => void;
}

export const LandingPageDesktop: React.FC<LandingPageDesktopProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);
    useScrollTracking('desktop');

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const cta = (loc: string) => {
        trackCTAClick(loc, 'desktop');
        onGetStarted();
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                .text-grad { background:linear-gradient(135deg,#63b3ed 0%,#7f9cf5 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .btn-pulse { animation: pulse-ring 2.6s infinite; }
                @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); } 70% { box-shadow: 0 0 0 12px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
                .section-p { padding: 5rem 2.5rem; }
            `}</style>

            <nav style={{
                position: 'sticky', top: 0, zIndex: 999,
                padding: '1rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: '1280px', margin: '0 auto', width: '100%',
                background: scrolled ? 'rgba(10,15,30,.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,.05)' : 'none',
                transition: 'all .3s',
            }}>
                <img src="/logo_full.png" alt="Intelligent Portfolio" style={{ height: '30px', objectFit: 'contain' }} />
                <button onClick={() => cta('nav')} style={{ padding: '0.6rem 1.6rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    Começar grátis
                </button>
            </nav>

            {/* HERO */}
            <header className="section-p" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.6rem', fontWeight: 900, marginBottom: '1.2rem', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
                    Controle todos os seus investimentos<br />
                    <span className="text-grad">em um único lugar</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.5 }}>
                    Automatize sua carteira, elimine planilhas e acompanhe tudo em tempo real.
                </p>
                <button
                    onClick={() => cta('hero')}
                    className="btn-pulse"
                    style={{ padding: '1.2rem 3rem', fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', border: 'none', borderRadius: '14px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 30px rgba(59,130,246,0.3)' }}
                >
                    Começar gratuitamente <ArrowRight />
                </button>
                <div style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>
                    Ideal para investidores que querem mais controle com menos trabalho
                </div>
            </header>

            {/* PROVA VISUAL */}
            <section className="section-p" style={{ background: '#111827', textAlign: 'center' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 28px 70px -10px rgba(0,0,0,0.88)', border: '1px solid rgba(99,179,237,0.1)' }}>
                        <img src="/marketing/dashboard_premium.png" alt="Dashboard" style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />
                    </div>
                </div>
            </section>

            {/* PROBLEMA & SOLUÇÃO */}
            <section className="section-p" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#f87171' }}>Gerenciar investimentos manualmente é lento e confuso</h2>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94a3b8', fontSize: '1.1rem' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: '#f87171' }}>✕</span> Planilhas quebram repetidamente</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: '#f87171' }}>✕</span> Dados ficam desatualizados</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><span style={{ color: '#f87171' }}>✕</span> Você perde tempo organizando tudo</li>
                        </ul>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#34d399' }}>O Intelligent Portfolio centraliza e automatiza sua carteira</h2>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#f1f5f9', fontSize: '1.1rem' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> Importação de dados da B3</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> Dashboard consolidado por classe de ativos</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> Atualização automática</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* BENEFÍCIOS */}
            <section className="section-p" style={{ background: '#111827' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                        <div style={{ padding: '2rem', background: '#0a0f1e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Mais clareza</h3>
                        </div>
                        <div style={{ padding: '2rem', background: '#0a0f1e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Mais controle</h3>
                        </div>
                        <div style={{ padding: '2rem', background: '#0a0f1e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>Menos esforço</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIFERENCIAL & COMO FUNCIONA */}
            <section className="section-p" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 900, textAlign: 'center', marginBottom: '4rem' }}>Acompanhamento Contínuo</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#63b3ed' }}>
                            <Upload size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>1. Importar seus dados</h3>
                        <p style={{ color: '#94a3b8' }}>Faça o upload do extrato da B3 de forma fácil.</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(52,211,153,0.1)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                            <Cpu size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>2. Plataforma organiza</h3>
                        <p style={{ color: '#94a3b8' }}>Processamento e categorização automáticos.</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'rgba(167,139,250,0.1)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                            <LayoutDashboard size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>3. Visualizar e acompanhar</h3>
                        <p style={{ color: '#94a3b8' }}>Interface simples com visualização clara da carteira.</p>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button
                        onClick={() => cta('mid')}
                        style={{ padding: '1.1rem 2.8rem', fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                        Testar grátis agora <ArrowRight />
                    </button>
                </div>
            </section>

            {/* REDUÇÃO DE RISCO & FINAL CTA */}
            <section className="section-p" style={{ background: '#111827', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '1.5rem' }}>Pronto para ter o controle?</h2>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.05rem', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck color="#34d399" /> Sem cartão de crédito</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock color="#63b3ed" /> Teste gratuito</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 color="#a78bfa" /> Cancelamento simples</div>
                    </div>

                    <button
                        onClick={() => cta('final')}
                        className="btn-pulse"
                        style={{ padding: '1.3rem 4rem', fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', border: 'none', borderRadius: '16px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 14px 34px rgba(59,130,246,0.4)' }}
                    >
                        Criar conta grátis <ArrowRight size={24} />
                    </button>
                </div>
            </section>
        </div>
    );
};
