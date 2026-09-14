import React, { useEffect, useState } from 'react';
import {
    FileSpreadsheet,
    AlertTriangle,
    Clock,
    Upload,
    Cpu,
    CheckCircle2,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { trackCTAClick, useScrollTracking } from '../utils/tracking';

interface LandingPageMobileProps {
    onGetStarted: () => void;
}

export const LandingPageMobile: React.FC<LandingPageMobileProps> = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);
    useScrollTracking('mobile');

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const cta = (loc: string) => {
        trackCTAClick(loc, 'mobile');
        onGetStarted();
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif", paddingBottom: '80px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .text-grad { background:linear-gradient(135deg,#f87171 0%,#fb7185 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .text-grad-blue { background:linear-gradient(135deg,#3b82f6 0%,#63b3ed 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .pulse-btn { animation: pulse 2.5s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); } 70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
                .floating-cta { position: fixed; bottom: 0; left: 0; right: 0; padding: 15px; background: rgba(10,15,30,0.95); backdrop-filter: blur(10px); border-top: 1px solid rgba(255,255,255,0.05); z-index: 1000; transform: translateY(100%); transition: transform 0.3s ease-out; }
                .floating-cta.visible { transform: translateY(0); }
            `}</style>

            {/* Top Bar Fast */}
            <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'center' }}>
                <img src="/logo_full.png" alt="Intelligent Portfolio" style={{ height: '24px' }} />
            </div>

            {/* HERO */}
            <section style={{ padding: '30px 20px 40px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '20px', border: '1px solid rgba(248,113,113,0.2)' }}>
                    PARE DE PERDER TEMPO
                </div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '15px', letterSpacing: '-1px' }}>
                    Pare de usar planilhas para controlar <span className="text-grad">seus investimentos</span>
                </h1>
                <p style={{ fontSize: '1.05rem', color: '#94a3b8', marginBottom: '25px', lineHeight: 1.5 }}>
                    Veja tudo em um só lugar, de forma 100% automática e segura.
                </p>
                <button
                    onClick={() => cta('hero')}
                    className="pulse-btn"
                    style={{ width: '100%', padding: '18px', borderRadius: '14px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', fontSize: '1.1rem', fontWeight: 800, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    Testar grátis agora <ArrowRight size={20} />
                </button>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px', fontWeight: 600 }}>Leva menos de 2 minutos</p>

                {/* Dashboard Image */}
                <div style={{ marginTop: '35px', borderRadius: '16px', border: '1px solid rgba(99,179,237,0.15)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                    <img src="/marketing/dashboard_premium.png" alt="Dashboard" style={{ width: '100%', display: 'block' }} loading="eager" />
                </div>
            </section>

            {/* DOR */}
            <section style={{ padding: '40px 20px', background: '#111827' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>Você ainda faz isso?</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)', padding: '20px', borderRadius: '14px', display: 'flex', gap: '15px' }}>
                        <FileSpreadsheet color="#f87171" size={28} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '5px' }}>Atualiza planilha manualmente</h3>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>E gasta seu final de semana com algo que poderia ser automático.</p>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', padding: '20px', borderRadius: '14px', display: 'flex', gap: '15px' }}>
                        <AlertTriangle color="#fbbf24" size={28} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '5px' }}>Não sabe quanto realmente tem</h3>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Rendimentos misturados, corretoras diferentes, sem visão clara.</p>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.1)', padding: '20px', borderRadius: '14px', display: 'flex', gap: '15px' }}>
                        <Clock color="#a78bfa" size={28} style={{ flexShrink: 0 }} />
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '5px' }}>Perde tempo organizando dados</h3>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>A planilha quebra, as fórmulas somem e a frustração aumenta.</p>
                        </div>
                    </div>
                </div>
                <p style={{ textAlign: 'center', color: '#f87171', fontWeight: 800, marginTop: '25px', fontSize: '1.2rem' }}>Isso não escala.</p>
            </section>

            {/* SOLUÇÃO */}
            <section style={{ padding: '50px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px' }}>O Intelligent Portfolio <span className="text-grad-blue">faz isso por você</span></h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>⚡ Importa a carteira automaticamente</h3>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sem mais digitação.</p>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>📂 Organiza tudo em segundos</h3>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Por classe de ativos e rendimento.</p>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(59,130,246,0.05)', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>👁️ Mostra claro como água</h3>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Gráficos visuais e objetivos.</p>
                    </div>
                </div>
            </section>

            {/* BENEFÍCIOS */}
            <section style={{ padding: '30px 20px', background: '#111827', margin: '0 20px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> <span style={{ fontWeight: 600 }}>Economize horas por semana</span></div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> <span style={{ fontWeight: 600 }}>Visão completa da sua carteira</span></div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><CheckCircle2 color="#34d399" /> <span style={{ fontWeight: 600 }}>Tome decisões melhores</span></div>
                </div>
                <button
                    onClick={() => cta('mid')}
                    style={{ width: '100%', marginTop: '25px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', color: 'white', fontSize: '1.05rem', fontWeight: 800, border: 'none' }}
                >
                    Começar grátis agora
                </button>
            </section>

            {/* SIMPLICIDADE */}
            <section style={{ padding: '50px 20px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>Funciona assim:</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(59,130,246,0.2)' }} />
                    <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1e3a8a', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 'bold' }}>1</div>
                        <div style={{ paddingTop: '10px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Você importa sua planilha da B3</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1e3a8a', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 'bold' }}>2</div>
                        <div style={{ paddingTop: '10px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>A plataforma organiza tudo</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1e3a8a', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 'bold' }}>3</div>
                        <div style={{ paddingTop: '10px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Você vê seus investimentos na hora</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONFIANÇA / FINAL */}
            <section style={{ padding: '20px 20px 60px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '25px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} color="#34d399" /> Sem cartão de crédito</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={16} color="#34d399" /> Sem compromisso</div>
                </div>
            </section>

            {/* FLOATING CTA FOR MOBILE */}
            <div className={`floating-cta ${scrolled ? 'visible' : ''}`}>
                <button
                    onClick={() => cta('floating')}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', fontSize: '1.1rem', fontWeight: 800, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px rgba(59,130,246,0.4)', gap: '8px' }}
                >
                    Criar conta grátis <ArrowRight />
                </button>
            </div>
        </div>
    );
};
