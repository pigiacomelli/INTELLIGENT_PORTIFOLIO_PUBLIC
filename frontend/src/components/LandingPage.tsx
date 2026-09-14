import React from 'react';
import {
    TrendingUp,
    ShieldCheck,
    Sparkles,
    Zap,
    ChevronRight,
    PieChart,
    Globe,
    Lock,
    ArrowRight,
    Upload,
    LayoutDashboard,
    ChevronDown,
    CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-darker)',
            color: 'var(--text-main)',
            fontFamily: "'Outfit', sans-serif",
            overflowX: 'hidden'
        }}>
            <style>{`
                html { scroll-behavior: smooth; }
                @keyframes float-hero { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(1deg); } 100% { transform: translateY(0px) rotate(0deg); } }
                .float-hero { animation: float-hero 8s ease-in-out infinite; }
                .text-gradient { background: linear-gradient(135deg, #fff 0%, var(--accent-primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .nav-link { color: var(--text-muted); text-decoration: none; font-weight: 500; font-size: 0.95rem; transition: all 0.3s; }
                .nav-link:hover { color: var(--accent-primary); }
                
                @keyframes pulse-btn {
                    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(56, 189, 248, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
                }
                .btn-pulse { animation: pulse-btn 2s infinite; }
                
                /* Responsive Utilities */
                .hero-title { font-size: 5rem; }
                .hero-subtitle { font-size: 1.5rem; }
                .section-title { font-size: 3.5rem; }
                .section-title-sm { font-size: 3rem; }
                .step-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4rem; }
                .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
                .feature-row { display: flex; align-items: center; gap: 4rem; margin-bottom: 12rem; flex-wrap: wrap; }
                .brands-row { display: flex; justify-content: center; align-items: center; gap: 5rem; flex-wrap: wrap; filter: grayscale(1) brightness(1.5); opacity: 0.6; }
                .hide-mobile { display: flex; }
                .hero-button { padding: 1.6rem 4.5rem; font-size: 1.35rem; }
                .hero-btn-container { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
                
                @media (max-width: 1024px) {
                    .feature-row { gap: 2rem; margin-bottom: 6rem; }
                    .step-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
                }

                @media (max-width: 768px) {
                    nav { padding: 1rem !important; }
                    .hide-mobile { display: none !important; }
                    .hero-title { font-size: 2.8rem !important; letter-spacing: -1.5px !important; }
                    .hero-subtitle { font-size: 1.15rem !important; padding: 0 1rem; margin-bottom: 2rem !important; }
                    .hero-button { padding: 1.2rem 1.5rem !important; font-size: 1.1rem !important; width: 100%; justify-content: center; }
                    .hero-btn-container { width: 100%; padding: 0 1rem; }
                    
                    header { padding: 5rem 1rem 3rem !important; }
                    section { padding: 4rem 1.5rem !important; margin: 0 auto !important; }
                    
                    .step-grid { grid-template-columns: 1fr; gap: 2.5rem; }
                    
                    .section-title { font-size: 2.2rem !important; letter-spacing: -1px !important; }
                    .section-title-sm { font-size: 2rem !important; }
                    
                    .feature-row { margin-bottom: 6rem !important; }
                    .feature-row > div { min-width: 100% !important; flex: 1 1 100% !important; }
                    
                    .brands-row { gap: 2rem !important; }
                    .brands-row > div { font-size: 1.2rem !important; }
                    
                    .glass-card { padding: 2rem 1.5rem !important; }
                    
                    footer { padding: 3rem 1.5rem !important; }
                }
            `}</style>

            {/* Navigation */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1300px',
                margin: '0 auto',
                width: '100%',
                position: 'relative',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <img src="/logo_full.png" alt="Intelligent Portfolio" style={{ height: '40px', objectFit: 'contain' }} />
                </div>
                <div className="hide-mobile" style={{ gap: '2.5rem', alignItems: 'center' }}>
                    <a href="#beneficios" className="nav-link">Benefícios</a>
                    <a href="#como-funciona" className="nav-link">Como Funciona</a>
                    <button
                        onClick={onGetStarted}
                        className="btn-primary"
                        style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}
                    >
                        Entrar / Testar Grátis
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                padding: '6rem 2rem 4rem',
                textAlign: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="animate-fade-in">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(56, 189, 248, 0.08)',
                        padding: '10px 24px',
                        borderRadius: '100px',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
                        marginBottom: '2.5rem',
                        boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)'
                    }}>
                        <Zap size={18} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            CONTROLE AUTOMÁTICO DE PATRIMÔNIO
                        </span>
                    </div>

                    <h1 className="text-gradient hero-title" style={{
                        fontWeight: 950,
                        lineHeight: 1.05,
                        marginBottom: '1.5rem',
                        letterSpacing: '-2.5px'
                    }}>
                        Sua carteira da B3 <br />
                        <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 50px rgba(56, 189, 248, 0.2)' }}>no automático. Sem planilhas.</span>
                    </h1>

                    <p className="hero-subtitle" style={{
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '3.5rem',
                        maxWidth: '750px',
                        margin: '0 auto 3.5rem',
                        fontWeight: 450,
                        fontSize: '1.3rem'
                    }}>
                        Transforme seu extrato em um dashboard profissional em segundos. Veja sua rentabilidade real sem perder horas com Excel.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div className="hero-btn-container">
                            <button
                                onClick={onGetStarted}
                                className="btn-primary btn-pulse"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    borderRadius: '24px',
                                    background: 'var(--accent-gradient)',
                                    border: 'none',
                                    fontWeight: 900,
                                    fontSize: '1.4rem',
                                    padding: '1.5rem 4rem',
                                    transform: 'scale(1)',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                }}
                            >
                                Importar minha carteira agora <ArrowRight size={28} />
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Lock size={14} color="var(--accent-success)" /> Sem Senhas
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Zap size={14} color="var(--accent-warning)" /> Setup 30s
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <ShieldCheck size={14} color="var(--accent-primary)" /> 100% Seguro
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Background Decoration */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100vw',
                    height: '100%',
                    background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />
            </header>

            {/* Main Product Print (Immediate Visual Proof) */}
            <section style={{ padding: '0 2rem 5rem', maxWidth: '1400px', margin: '-2rem auto 0', position: 'relative', zIndex: 20 }}>
                <div className="float-hero" style={{
                    borderRadius: '40px',
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
                    border: '1px solid var(--glass-border-strong)',
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(20px)',
                    padding: '1rem'
                }}>
                    <img
                        src="/marketing/dashboard_premium.png"
                        alt="Dashboard Premium"
                        style={{ width: '100%', borderRadius: '30px', display: 'block' }}
                    />
                </div>
            </section>

            {/* Trust Section */}
            <section style={{ padding: '0 2rem 6rem', textAlign: 'center' }}>
                <div className="brands-row">
                    <div className="brand-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: 'white' }}>B3</div>
                    <div className="brand-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: 'white' }}>BINANCE</div>
                    <div className="brand-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: 'white' }}>NASDAQ</div>
                    <div className="brand-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, color: 'white' }}>TESOURO DIRETO</div>
                </div>
            </section>

            {/* Pain Points Section */}
            <section style={{ padding: '4rem 2rem 8rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', letterSpacing: '-1.5px', color: 'var(--text-secondary)' }}>
                    Ainda controlando seu dinheiro como no <span style={{ color: 'var(--accent-warning)', borderBottom: '2px solid var(--accent-warning)' }}>século passado</span>?
                </h2>

                <div className="pain-grid">
                    <div className="glass-card" style={{ padding: '3rem 2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)' }}>
                        <div style={{ color: '#ef4444', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <Zap size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Atualização Manual</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Horas perdidas buscando cotações na internet e preenchendo planilhas que sempre quebram.</p>
                    </div>

                    <div className="glass-card" style={{ padding: '3rem 2rem', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.03)' }}>
                        <div style={{ color: '#f59e0b', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <PieChart size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Visão Desfragmentada</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Uma conta na corretora, outra na exchange de cripto, outra no bancão. Nunca sabendo o total real.</p>
                    </div>

                    <div className="glass-card" style={{ padding: '3rem 2rem', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.03)' }}>
                        <div style={{ color: '#10b981', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <TrendingUp size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Performance Irreal</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>Dificuldade gigantesca para saber se você está ganhando ou perdendo dinheiro de verdade.</p>
                    </div>
                </div>
            </section>

            {/* How it Works Section (3 Simple Steps) */}
            <section id="como-funciona" style={{ padding: '4rem 2rem 8rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 className="section-title-sm" style={{ fontWeight: 950, marginBottom: '1.2rem', letterSpacing: '-2px' }}>Pronto para usar em menos de 2 minutos</h2>
                </div>

                <div className="step-grid">
                    {[
                        { step: "1", title: "Crie sua conta grátis", desc: "Não pedimos cartão de crédito. Leva 30 segundos para se cadastrar.", icon: <Lock size={24} /> },
                        { step: "2", title: "Adicione sua planilha da B3", desc: "Faça o upload do arquivo Excel (CEI/Área do Investidor) e deixaremos tudo pronto.", icon: <Upload size={24} /> },
                        { step: "3", title: "Pronto!", desc: "Sua carteira inteira, atualizada e organizada, aparecerá mágica e instantaneamente em um dashboard bonito.", icon: <Sparkles size={24} /> }
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                            {i < 2 && (
                                <div className="hide-mobile" style={{ position: 'absolute', top: '40px', right: '-30%', width: '60%', height: '2px', background: 'var(--glass-border-strong)' }} />
                            )}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '2px solid rgba(56, 189, 248, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                color: 'var(--accent-primary)',
                                position: 'relative',
                                zIndex: 2
                            }}>
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '1.2rem', fontWeight: 900, background: 'var(--bg-dark)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-primary)' }}>{item.step}</span>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 850, marginBottom: '0.8rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Showcase (Focus on results) */}
            <section id="beneficios" style={{ padding: '4rem 2rem 10rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <h2 className="section-title" style={{ fontWeight: 950, marginBottom: '2rem', letterSpacing: '-3px' }}>O controle que você sempre quis,<br />sem o trabalho que você sempre odiou.</h2>
                </div>

                {/* Benefit 1: Horas salvas todo mês */}
                <div className="feature-row" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1.5, minWidth: '600px' }}>
                        <div className="float-hero" style={{ padding: '0', borderRadius: '32px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', overflow: 'hidden', border: '1px solid var(--glass-border-strong)' }}>
                            <img src="/marketing/dashboard_premium.png" alt="Dashboard Automático" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '400px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '2rem' }}>
                            <TrendingUp size={32} />
                        </div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Horas salvas todo mês</h3>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Pare de preencher células e buscar cotações. Seus investimentos são atualizados automaticamente, para você focar apenas em tomar as melhores decisões.</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Cotações em tempo real</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Rentabilidade comparada com CDI/Ibov</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Sem stress para montar relatórios</li>
                        </ul>
                    </div>
                </div>

                {/* Benefit 2: Clareza instantânea */}
                <div className="feature-row" style={{ flexWrap: 'wrap-reverse' }}>
                    <div style={{ flex: 1, minWidth: '400px' }}>
                        <div style={{ background: 'rgba(52, 211, 153, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)', marginBottom: '2rem' }}>
                            <PieChart size={32} />
                        </div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Clareza Instantânea</h3>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Saiba exatamente quanto dinheiro você tem, onde está alocado e qual sua rentabilidade histórica.Tudo em uma única tela, fácil de entender.</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-secondary)" size={20} /> Alocação por classes de ativos</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-secondary)" size={20} /> Acompanhamento de proventos/dividendos</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-secondary)" size={20} /> Mapas de calor da sua carteira</li>
                        </ul>
                    </div>
                    <div style={{ flex: 1.5, minWidth: '600px' }}>
                        <div className="float-hero" style={{ padding: '0', borderRadius: '32px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', overflow: 'hidden', border: '1px solid var(--glass-border-strong)' }}>
                            <img src="/marketing/diagnostico_ia.png" alt="Visão Consolidada" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>
                </div>

                {/* Benefit 3: Segurança */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1.5, minWidth: '600px' }}>
                        <div className="float-hero" style={{ padding: '0', borderRadius: '32px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', overflow: 'hidden', border: '1px solid var(--glass-border-strong)' }}>
                            <img src="/marketing/chat_advisor.png" alt="Segurança" style={{ width: '100%', display: 'block' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '400px' }}>
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '2rem' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px' }}>Segurança em 1º Lugar</h3>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Sem pedir senhas de corretoras. Tudo funciona apenas carregando a sua planilha baixada da Área do Investidor. Nós apenas processamos o arquivo para montar o seu dashboard.</p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Zero necessidade de senhas</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Criptografia de ponta a ponta</li>
                            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-muted)' }}><CheckCircle2 color="var(--accent-primary)" size={20} /> Seus dados não são vendidos</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Social Proof (Subtle) */}
            <section style={{ padding: '0 2rem 6rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3rem' }}>Junte-se aos investidores que já abandonaram as planilhas.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2rem', textAlign: 'left', fontStyle: 'italic' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.5 }}>"Eu perdia meu domingo inteiro atualizando abas de ações e FIIs. O Intelligent Portfolio resolveu isso em um clique. Simplesmente não vivo sem."</p>
                        <p style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>— João P., Investidor Pessoal</p>
                    </div>
                    <div className="glass-card" style={{ flex: '1 1 300px', maxWidth: '400px', padding: '2rem', textAlign: 'left', fontStyle: 'italic' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.5 }}>"Finalmente consigo ver a rentabilidade real da minha carteira consolidada. O design é maravilhoso e direto ao ponto."</p>
                        <p style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>— Mariana S., Investidora Focus</p>
                    </div>
                </div>
            </section>

            {/* Risk Free Guarantee Banner */}
            <section style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto 8rem' }}>
                <div className="glass-card" style={{ padding: '4rem 3rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                    <ShieldCheck size={48} color="var(--accent-success)" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Teste 30 dias na prática. Risco Zero.</h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        Use todas as ferramentas premium do Intelligent Portfolio de graça por um mês inteiro.
                        Sem pegadinhas, sem pedir cartão no cadastro. Se achar que não ajudou, a conta free continuará disponível. Seu risco é zero.
                    </p>
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={{ padding: '6rem 2rem 10rem', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.05) 0%, transparent 70%)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="section-title" style={{ fontWeight: 950, marginBottom: '2rem', letterSpacing: '-2px' }}>Pare de tentar adivinhar o tamanho do seu patrimônio.</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '4rem', lineHeight: 1.5 }}>
                        Dê o primeiro passo agora para ter controle absoluto sobre seus investimentos com zero trabalho manual.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={onGetStarted}
                            className="btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                fontSize: '1.4rem',
                                padding: '1.6rem 3.5rem',
                                borderRadius: '30px',
                                boxShadow: '0 20px 40px rgba(56, 189, 248, 0.4)',
                                fontWeight: 800,
                                transform: 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 25px 50px rgba(56, 189, 248, 0.6)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(56, 189, 248, 0.4)';
                            }}
                        >
                            Testar Premium Grátis <ArrowRight size={26} />
                        </button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '2.5rem', fontWeight: 600 }}>✨ Liberado imediatamente • Sem cartão de crédito necessário</p>
                </div>
            </section>

            {/* Clean Footer with FAQS */}
            <footer style={{ padding: '6rem 2rem', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                {/* FAQs Minimal */}
                <div style={{ maxWidth: '800px', margin: '0 auto 6rem' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>Ainda com dúvidas?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { q: "Preciso de um cartão para testar?", a: "Não. Acreditamos no nosso produto, por isso você cria a conta e testa 30 dias sem informar cartão nenhum." },
                            { q: "É seguro adicionar a planilha da B3?", a: "Totalmente. Não precisamos da sua senha de corretora. Seu arquivo só é utilizado para mapear os ativos e nada mais." },
                            { q: "Se eu não assinar depois dos 30 dias?", a: "Sua conta volta para o plano gratuito, com número limitado de ativos e funcionalidades básicas, mas você não perde seu acesso." }
                        ].map((item, i) => (
                            <div key={i} className="glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'left', cursor: 'pointer' }} onClick={() => toggleFaq(i)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{item.q}</h4>
                                    <ChevronDown size={20} color="var(--accent-primary)" style={{ transform: openFaqIndex === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                                </div>
                                <div style={{ maxHeight: openFaqIndex === i ? '200px' : '0', overflow: 'hidden', transition: 'all 0.3s', opacity: openFaqIndex === i ? 1 : 0 }}>
                                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'var(--accent-primary)', padding: '6px', borderRadius: '8px' }}>
                        <TrendingUp size={20} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Intelligent Portfolio</span>
                </div>
                <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginBottom: '3rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    <a href="mailto:pginvestimentos021@gmail.com" className="nav-link">Contato e Suporte</a>
                    <a href="/privacy" className="nav-link">Privacidade</a>
                    <a href="/terms" className="nav-link">Termos de Uso</a>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Intelligent Portfolio. Feito para investidores que dão valor ao tempo.</p>
            </footer>
        </div>
    );
};
