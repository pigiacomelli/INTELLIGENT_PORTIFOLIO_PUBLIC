import React, { useState, useEffect, useRef } from 'react';
import {
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Upload,
    ChevronDown,
    Clock,
    AlertTriangle,
    Eye,
    Users,
    Star,
    Timer,
    FileSpreadsheet,
    LayoutDashboard,
    CheckCircle2,
    XCircle,
    Brain,
    BarChart3,
    Zap,
    Target,
    Cpu,
    Lock,
    Sparkles,
} from 'lucide-react';

interface LandingPageV2Props {
    onGetStarted: () => void;
}

function trackEvent(event: string, data?: Record<string, string>) {
    try {
        if ((window as any).va) (window as any).va('event', { name: event, ...data });
        if ((window as any).dataLayer) (window as any).dataLayer.push({ event, ...data });
    } catch (e) {
        console.error('Tracking error', e);
    }
}

function useScrolled(threshold = 80) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, [threshold]);
    return scrolled;
}

function useCountUp(end: number, duration = 1400) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    useEffect(() => {
        if (!started) return;
        let cur = 0;
        const step = end / (duration / 16);
        const t = setInterval(() => { cur += step; if (cur >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(cur)); }, 16);
        return () => clearInterval(t);
    }, [started, end, duration]);
    return { count, ref };
}

export const LandingPageV2: React.FC<LandingPageV2Props> = ({ onGetStarted }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showFloating, setShowFloating] = useState(false);
    const scrolled = useScrolled();
    const c1 = useCountUp(50);
    const c2 = useCountUp(2, 900);
    const c3 = useCountUp(30, 700);

    // Show floating CTA after scrolling past hero (~600px)
    useEffect(() => {
        const fn = () => setShowFloating(window.scrollY > 620);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const cta = (loc: string) => { trackEvent('cta_click', { location: loc }); onGetStarted(); };

    // Reusable inline CTA block
    const InlineCTA = ({ label = 'Testar grátis agora', loc }: { label?: string; loc: string }) => (
        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(59,130,246,.05)', borderRadius: '20px', border: '1px solid rgba(59,130,246,.12)', margin: '0 auto', maxWidth: '560px' }}>
            <button
                onClick={() => cta(loc)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '1rem 2.4rem', fontSize: '1.05rem', fontWeight: 800,
                    background: 'linear-gradient(135deg,#3b82f6,#63b3ed)',
                    border: 'none', borderRadius: '14px', color: '#fff',
                    cursor: 'pointer', boxShadow: '0 10px 28px rgba(59,130,246,.32)',
                    transition: 'all .22s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 38px rgba(59,130,246,.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 28px rgba(59,130,246,.32)'; }}
            >
                {label} <ArrowRight size={18} />
            </button>
            <p style={{ color: '#475569', fontSize: '.78rem', fontWeight: 600, marginTop: '.5rem' }}>Sem cartão • Grátis para começar</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }

                @keyframes float-hero  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(.2deg)} }
                @keyframes pulse-ring  { 0%{box-shadow:0 0 0 0 rgba(99,179,237,.45)} 70%{box-shadow:0 0 0 14px rgba(99,179,237,0)} 100%{box-shadow:0 0 0 0 rgba(99,179,237,0)} }
                @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
                @keyframes glow-orb    { 0%,100%{opacity:.32;transform:scale(1)} 50%{opacity:.52;transform:scale(1.06)} }
                @keyframes ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes slide-up    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
                @keyframes float-btn   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

                .float-hero  { animation: float-hero 7s ease-in-out infinite; }
                .btn-pulse   { animation: pulse-ring 2.6s infinite; }
                .text-grad   { background:linear-gradient(135deg,#63b3ed 0%,#7f9cf5 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .shimmer-num { background:linear-gradient(90deg,#63b3ed 0%,#7f9cf5 40%,#63b3ed 80%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
                .nav-link    { color:#94a3b8; text-decoration:none; font-weight:500; font-size:.88rem; transition:color .2s; }
                .nav-link:hover { color:#63b3ed; }
                .card-h      { transition:transform .22s ease,box-shadow .22s ease; }
                .card-h:hover { transform:translateY(-4px); box-shadow:0 18px 45px -10px rgba(0,0,0,.6); }
                .ticker-wrap { overflow:hidden; white-space:nowrap; }
                .ticker-inner{ display:inline-flex; animation:ticker-scroll 22s linear infinite; }
                .ticker-item { display:inline-flex; align-items:center; gap:7px; padding:0 2.2rem; font-size:.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; }
                .section-alt { background:#111827; }
                .step-line   { position:absolute; top:33px; left:calc(50% + 35px); right:calc(-50% + 35px); height:2px; background:linear-gradient(90deg,rgba(99,179,237,.3),rgba(127,156,245,.08)); }

                /* Floating CTA bar */
                .float-cta   { position:fixed; bottom:0; left:0; right:0; z-index:998; padding:.85rem 1.5rem; background:rgba(10,15,30,.92); backdrop-filter:blur(16px); border-top:1px solid rgba(255,255,255,.07); display:flex; align-items:center; justify-content:center; gap:1rem; transition:transform .35s ease, opacity .35s ease; padding-bottom: calc(.85rem + env(safe-area-inset-bottom, 0px)); }
                .float-cta.hidden { transform:translateY(100%); opacity:0; pointer-events:none; }
                .float-btn   { animation: float-btn 3s ease-in-out infinite; }

                /* Layouts */
                .hero-grid   { display:grid; grid-template-columns:1fr 1fr; gap:3.5rem; align-items:center; }
                .hero-t      { font-size:3.2rem; line-height:1.08; letter-spacing:-2px; }
                .sect-t      { font-size:2.2rem; letter-spacing:-1.2px; }
                .step-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; position:relative; }
                .pain-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; }
                .ben-grid    { display:grid; grid-template-columns:repeat(2,1fr); gap:1.2rem; }
                .hide-m      { display:flex; }
                .section-p   { padding: 4rem 2.5rem; }

                @media (max-width:1024px) {
                    .hero-grid { grid-template-columns:1fr; gap:2.5rem; text-align:center; }
                    .hero-img  { order:-1; }
                    .hero-t    { font-size:2.6rem; }
                    .step-grid { grid-template-columns:1fr; gap:1.2rem; }
                    .step-line { display:none; }
                    .pain-grid { grid-template-columns:1fr; }
                    .ben-grid  { grid-template-columns:1fr; }
                    .trust-row { justify-content:center; }
                    .section-p { padding: 3rem 1.5rem; }
                }
                @media (max-width:768px) {
                    .hero-t { font-size:2.1rem !important; letter-spacing:-1px !important; line-height: 1.15 !important; }
                    .sect-t { font-size:1.75rem !important; line-height: 1.2 !important; }
                    .hide-m { display:none !important; }
                    .float-cta { gap:.6rem; padding:.7rem 1rem; }
                    .float-cta p { display:none; }
                    .section-p { padding: 2.5rem 1.2rem; }
                    .hero-grid { gap: 1.8rem; }
                    nav { padding: .8rem 1.2rem !important; }
                }
            `}</style>

            {/* ═══════════════ STICKY NAV ═══════════════ */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 999,
                padding: '.9rem 2.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                maxWidth: '1280px', margin: '0 auto', width: '100%',
                background: scrolled ? 'rgba(10,15,30,.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(18px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,.05)' : 'none',
                transition: 'all .3s',
            }}>
                <img src="/logo_full.png" alt="Intelligent Portfolio" style={{ height: '30px', objectFit: 'contain' }} />
                <div className="hide-m" style={{ gap: '2rem', alignItems: 'center' }}>
                    <a href="#como-funciona" className="nav-link">Como funciona</a>
                    <a href="#beneficios" className="nav-link">Benefícios</a>
                    <button onClick={() => cta('nav')} style={{ padding: '.5rem 1.3rem', fontSize: '.85rem', fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#63b3ed)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
                        Começar grátis
                    </button>
                </div>
            </nav>

            {/* ═══════════════ 1. HERO ═══════════════ */}
            <header className="section-p" style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '5%', left: '-3%', width: '480px', height: '480px', background: 'radial-gradient(circle,rgba(99,179,237,.07) 0%,transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none', animation: 'glow-orb 8s ease-in-out infinite' }} />

                <div className="hero-grid">
                    {/* TEXT */}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(99,179,237,.08)', padding: '5px 13px', borderRadius: '100px', border: '1px solid rgba(99,179,237,.15)', marginBottom: '1.4rem' }}>
                            <Timer size={12} color="#63b3ed" />
                            <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#63b3ed', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Grátis para começar</span>
                        </div>

                        <h1 className="hero-t" style={{ fontWeight: 900, marginBottom: '1rem', color: '#f1f5f9' }}>
                            Controle todos os seus<br />
                            investimentos em<br />
                            <span className="text-grad">um só lugar</span>
                        </h1>

                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '1.8rem', maxWidth: '440px', fontWeight: 400, margin: '0 auto 1.8rem' }}>
                            Importe sua planilha da B3 e visualize automaticamente sua carteira — em menos de 2 minutos.
                        </p>

                        <button
                            onClick={() => cta('hero')}
                            className="btn-pulse"
                            id="cta-hero"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '1.05rem 2.5rem', fontSize: '1.05rem', fontWeight: 800,
                                background: 'linear-gradient(135deg,#3b82f6,#63b3ed)',
                                border: 'none', borderRadius: '14px', color: '#fff',
                                cursor: 'pointer', boxShadow: '0 12px 32px rgba(59,130,246,.35)',
                                transition: 'all .22s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(59,130,246,.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,.35)'; }}
                        >
                            Começar grátis agora <ArrowRight size={19} />
                        </button>
                        <p style={{ fontSize: '.78rem', color: '#475569', fontWeight: 600, marginTop: '.55rem' }}>Sem cartão de crédito &nbsp;•&nbsp; Leva 2 minutos</p>

                        <div className="trust-row" style={{ display: 'flex', gap: '.6rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
                            {[
                                { icon: <Users size={12} color="#34d399" />, text: '+50 investidores', bg: 'rgba(52,211,153,.07)', bd: 'rgba(52,211,153,.14)' },
                                { icon: <ShieldCheck size={12} color="#63b3ed" />, text: 'Dados seguros', bg: 'rgba(99,179,237,.07)', bd: 'rgba(99,179,237,.14)' },
                                { icon: <Lock size={12} color="#a78bfa" />, text: 'Sem senha', bg: 'rgba(167,139,250,.07)', bd: 'rgba(167,139,250,.14)' },
                            ].map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: p.bg, border: `1px solid ${p.bd}`, borderRadius: '100px', padding: '4px 11px', fontSize: '.75rem', fontWeight: 700, color: '#cbd5e1' }}>
                                    {p.icon} {p.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SCREENSHOT */}
                    <div className="hero-img float-hero" style={{ position: 'relative' }}>
                        <div style={{ borderRadius: '18px', overflow: 'hidden', boxShadow: '0 28px 75px -10px rgba(0,0,0,.85), 0 0 55px -15px rgba(99,179,237,.1)', border: '1px solid rgba(99,179,237,.1)', background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(14px)', padding: '5px' }}>
                            <img src="/marketing/dashboard_premium.png" alt="Painel de investimentos" width={1200} height={700} style={{ width: '100%', height: 'auto', borderRadius: '14px', display: 'block' }} loading="eager" />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-12px', left: '14px', background: 'rgba(17,24,39,.95)', backdropFilter: 'blur(10px)', borderRadius: '10px', padding: '.5rem .9rem', border: '1px solid rgba(99,179,237,.14)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 7px #34d399' }} />
                            <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#e2e8f0' }}>Carteira atualizada automaticamente</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══════════════ TICKER ═══════════════ */}
            <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div className="ticker-wrap">
                    <div className="ticker-inner">
                        {[...Array(2)].map((_, r) => (
                            <span key={r} style={{ display: 'inline-flex' }}>
                                {['✅ Sem senha de corretora', '📊 Importação da B3', '🤖 Insights com IA', '⚡ Atualização automática', '🔒 Dados criptografados', '🆓 Grátis para começar', '🧠 Decisões mais rápidas'].map((t, i) => (
                                    <span key={i} className="ticker-item">{t} <span style={{ color: '#1e293b' }}>|</span></span>
                                ))}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════ 2. PROVA IMEDIATA ═══════════════ */}
            <section className="section-alt section-p">
                <div style={{ maxWidth: '1050px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#63b3ed', marginBottom: '.7rem' }}>Veja o produto</p>
                    <h2 className="sect-t" style={{ fontWeight: 900, marginBottom: '.7rem', color: '#f1f5f9' }}>
                        Veja como sua carteira fica<br /><span className="text-grad">organizada automaticamente</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '.95rem', marginBottom: '2.5rem' }}>Da planilha bagunçada para controle total — em minutos.</p>

                    <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 28px 70px -10px rgba(0,0,0,.88)', border: '1px solid rgba(99,179,237,.07)' }}>
                        <img src="/marketing/planilha_vs_sistema.png" alt="Antes vs Depois — planilha vs painel" width={1050} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                        {[
                            { ref: c1.ref, val: c1.count, suf: '+', label: 'Investidores ativos' },
                            { ref: c2.ref, val: c2.count, suf: 'min', label: 'Para organizar tudo' },
                            { ref: c3.ref, val: c3.count, suf: 'dias', label: 'Grátis para testar' },
                        ].map((s, i) => (
                            <div key={i} ref={s.ref} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>
                                    <span className="shimmer-num">{s.val}{s.suf}</span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '.78rem', fontWeight: 600, marginTop: '.3rem' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 3. PROBLEMA ═══════════════ */}
            <section className="section-p" style={{ background: '#0a0f1e' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#f87171', marginBottom: '.7rem' }}>O problema</p>
                    <h2 className="sect-t" style={{ fontWeight: 900, marginBottom: '.8rem', color: '#f1f5f9' }}>
                        Ainda controla seus investimentos<br />
                        <span style={{ color: '#f87171' }}>em planilhas?</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '.95rem', marginBottom: '2.5rem' }}>A maioria dos investidores perde horas por mês com isso.</p>

                    <div className="pain-grid">
                        {[
                            { icon: <FileSpreadsheet size={26} />, title: 'Dados espalhados', desc: 'Múltiplas abas, corretoras e planilhas que não se falam.', c: '#f87171', bg: 'rgba(248,113,113,.05)', bd: 'rgba(248,113,113,.12)' },
                            { icon: <AlertTriangle size={26} />, title: 'Difícil acompanhar performance', desc: 'Você não sabe se está ganhando ou perdendo de verdade.', c: '#fbbf24', bg: 'rgba(251,191,36,.05)', bd: 'rgba(251,191,36,.12)' },
                            { icon: <Clock size={26} />, title: 'Tempo perdido organizando', desc: 'Horas buscando cotações e corrigindo fórmulas quebradas.', c: '#a78bfa', bg: 'rgba(167,139,250,.05)', bd: 'rgba(167,139,250,.12)' },
                        ].map((p, i) => (
                            <div key={i} className="card-h" style={{ padding: '1.6rem', borderRadius: '18px', background: p.bg, border: `1px solid ${p.bd}`, textAlign: 'left' }}>
                                <div style={{ color: p.c, marginBottom: '.8rem' }}>{p.icon}</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.4rem', color: '#f1f5f9' }}>{p.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '.86rem', lineHeight: 1.55 }}>{p.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* ► CTA #2 — After Problem */}
                    <div style={{ marginTop: '2.5rem' }}>
                        <InlineCTA loc="after_problem" label="Resolver isso agora — grátis" />
                    </div>
                </div>
            </section>

            {/* ═══════════════ 4. COMO FUNCIONA ═══════════════ */}
            <section id="como-funciona" className="section-alt section-p">
                <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#63b3ed', marginBottom: '.7rem' }}>Como funciona</p>
                    <h2 className="sect-t" style={{ fontWeight: 900, marginBottom: '.7rem', color: '#f1f5f9' }}>
                        Três passos. <span className="text-grad">Dois minutos.</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '.95rem', marginBottom: '3rem' }}>Nada de configurações complicadas ou senhas de corretora.</p>

                    <div className="step-grid">
                        {[
                            { n: '1', icon: <Upload size={24} />, title: 'Upload', desc: 'Envie sua planilha da B3 direto da Área do Investidor.', c: '#63b3ed' },
                            { n: '2', icon: <Cpu size={24} />, title: 'Processamento', desc: 'O sistema lê, organiza e calcula tudo automaticamente.', c: '#34d399' },
                            { n: '3', icon: <LayoutDashboard size={24} />, title: 'Resultado', desc: 'Veja sua carteira pronta e organizada em segundos.', c: '#a78bfa' },
                        ].map((s, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                {i < 2 && <div className="step-line" />}
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${s.c}10`, border: `2px solid ${s.c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: s.c, position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '.72rem', fontWeight: 900, background: '#111827', color: s.c, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${s.c}` }}>{s.n}</span>
                                    {s.icon}
                                </div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '.4rem', color: '#f1f5f9' }}>{s.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '.88rem', lineHeight: 1.55, maxWidth: '220px', margin: '0 auto' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* ► CTA #3 — After Steps */}
                    <div style={{ marginTop: '2.8rem' }}>
                        <InlineCTA loc="after_steps" />
                    </div>
                </div>
            </section>

            {/* ═══════════════ 5. BENEFÍCIOS ═══════════════ */}
            <section id="beneficios" className="section-p" style={{ background: '#0a0f1e' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#63b3ed', marginBottom: '.7rem' }}>Benefícios</p>
                    <h2 className="sect-t" style={{ fontWeight: 900, marginBottom: '.7rem', color: '#f1f5f9' }}>
                        Tudo que você precisa para<br /><span className="text-grad">entender seus investimentos</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '.95rem', marginBottom: '2.5rem' }}>Uma plataforma completa para o investidor brasileiro.</p>

                    <div className="ben-grid">
                        {[
                            { icon: <BarChart3 size={24} />, title: 'Visão consolidada', desc: 'Todos os seus ativos num único painel. Ações, FIIs, renda fixa e mais.', c: '#63b3ed' },
                            { icon: <Zap size={24} />, title: 'Atualização automática', desc: 'Chega de atualizar cotações manualmente. O sistema faz tudo sozinho.', c: '#fbbf24' },
                            { icon: <Brain size={24} />, title: 'Insights com IA', desc: 'Análise inteligente que identifica oportunidades e riscos na sua carteira.', c: '#a78bfa' },
                            { icon: <Target size={24} />, title: 'Decisões mais rápidas', desc: 'Com tudo organizado, você decide com mais confiança e menos ruído.', c: '#34d399' },
                        ].map((b, i) => (
                            <div key={i} className="card-h" style={{ padding: '1.5rem', borderRadius: '18px', background: 'rgba(17,24,39,.7)', border: '1px solid rgba(255,255,255,.06)', textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ flexShrink: 0, width: '46px', height: '46px', borderRadius: '12px', background: `${b.c}12`, border: `1px solid ${b.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.c }}>
                                    {b.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.25rem', color: '#f1f5f9' }}>{b.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '.85rem', lineHeight: 1.55 }}>{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Differentiator callout — compact */}
                    <div style={{ marginTop: '2.5rem', padding: '1.8rem', borderRadius: '20px', background: 'linear-gradient(135deg,rgba(99,179,237,.05),rgba(127,156,245,.04))', border: '1px solid rgba(99,179,237,.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-.5px', lineHeight: 1.35 }}>
                            Não é uma planilha.<br />
                            <span className="text-grad">É um sistema que transforma seus dados em decisões.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 6. PROVA SOCIAL + FINAL CTA ═══════════════ */}
            <section className="section-alt section-p" style={{ paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#63b3ed', marginBottom: '.7rem' }}>Prova social</p>
                    <h2 className="sect-t" style={{ fontWeight: 900, marginBottom: '.7rem', color: '#f1f5f9' }}>
                        Investidores já estão <span className="text-grad">organizando suas carteiras</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '.95rem', marginBottom: '2.5rem' }}>Em minutos. Sem complicação.</p>

                    <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
                        {[
                            { q: 'Parei de usar planilhas. Em 2 minutos tudo estava organizado.', n: 'João P.', r: 'Investidor há 3 anos', c: '#34d399' },
                            { q: 'Eu perdia meu domingo no Excel. Agora vejo tudo num lugar em segundos.', n: 'Mariana S.', r: 'Investidora iniciante', c: '#63b3ed' },
                            { q: 'A IA me mostrou uma concentração que eu nem sabia que tinha.', n: 'Rafael M.', r: 'Investidor em FIIs', c: '#a78bfa' },
                        ].map((t, i) => (
                            <div key={i} className="card-h" style={{ flex: '1 1 250px', maxWidth: '310px', padding: '1.5rem', borderRadius: '18px', textAlign: 'left', background: 'rgba(10,15,30,.7)', border: `1px solid ${t.c}18` }}>
                                <div style={{ display: 'flex', gap: '2px', marginBottom: '.7rem' }}>
                                    {[...Array(5)].map((_, j) => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}
                                </div>
                                <p style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '.88rem', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.q}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${t.c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.c, fontSize: '.85rem', fontWeight: 900 }}>{t.n[0]}</div>
                                    <div>
                                        <p style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '.9rem', margin: 0 }}>{t.n}</p>
                                        <p style={{ fontSize: '.75rem', color: '#64748b', margin: 0 }}>{t.r}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ — 3 items only */}
                    <div style={{ maxWidth: '640px', margin: '0 auto 3rem', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem', textAlign: 'center' }}>Dúvidas rápidas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                            {[
                                { q: 'Preciso conectar minha conta da corretora?', a: 'Não. Você só faz upload da planilha da B3. Nenhuma senha de corretora é necessária.' },
                                { q: 'Preciso de cartão de crédito para começar?', a: 'Não. Cadastre-se e use tudo por 30 dias sem informar cartão algum.' },
                                { q: 'É difícil de usar?', a: 'Não. Você envia a planilha e o sistema organiza tudo automaticamente. Em minutos.' },
                            ].map((f, i) => (
                                <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="card-h" style={{ padding: '1.2rem 1.5rem', borderRadius: '12px', background: 'rgba(15,23,42,.6)', border: openFaq === i ? '1px solid rgba(99,179,237,.2)' : '1px solid rgba(255,255,255,.05)', cursor: 'pointer', minHeight: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                        <h4 style={{ fontSize: '.95rem', fontWeight: 700, margin: 0, color: '#e2e8f0' }}>{f.q}</h4>
                                        <ChevronDown size={18} color="#63b3ed" style={{ transform: openFaq === i ? 'rotate(180deg)' : '', transition: 'transform .25s', flexShrink: 0 }} />
                                    </div>
                                    <div style={{ maxHeight: openFaq === i ? '120px' : '0', overflow: 'hidden', transition: 'all .3s', opacity: openFaq === i ? 1 : 0 }}>
                                        <p style={{ marginTop: '.75rem', color: '#64748b', lineHeight: 1.6, marginBottom: 0, fontSize: '.9rem' }}>{f.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ► CTA FINAL #4 */}
                    <div style={{ padding: '3rem 2rem', borderRadius: '24px', background: 'linear-gradient(135deg,rgba(59,130,246,.07),rgba(99,179,237,.05))', border: '1px solid rgba(59,130,246,.14)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '350px', height: '350px', background: 'radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 65%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(52,211,153,.08)', padding: '5px 13px', borderRadius: '100px', border: '1px solid rgba(52,211,153,.15)', marginBottom: '1.2rem' }}>
                                <ShieldCheck size={13} color="#34d399" />
                                <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '1.2px' }}>30 dias grátis — sem cartão — sem compromisso</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '.8rem', color: '#f1f5f9' }}>
                                Comece agora e veja sua<br /><span className="text-grad">carteira organizada em minutos</span>
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '.95rem', lineHeight: 1.65, marginBottom: '1.8rem' }}>Sem complicação. Só envie sua planilha e o sistema faz o resto.</p>
                            <button
                                onClick={() => cta('final')}
                                className="btn-pulse"
                                id="cta-final"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                                    padding: '1.1rem 3rem', fontSize: '1.1rem', fontWeight: 900,
                                    background: 'linear-gradient(135deg,#3b82f6,#63b3ed)',
                                    border: 'none', borderRadius: '16px', color: '#fff',
                                    cursor: 'pointer', boxShadow: '0 14px 36px rgba(59,130,246,.38)',
                                    transition: 'all .22s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 22px 46px rgba(59,130,246,.48)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 14px 36px rgba(59,130,246,.38)'; }}
                            >
                                Testar grátis agora <ArrowRight size={20} />
                            </button>
                            <p style={{ color: '#475569', fontSize: '.78rem', fontWeight: 600, marginTop: '.6rem' }}>Sem cartão de crédito &nbsp;•&nbsp; Leva menos de 2 minutos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer style={{ padding: '2rem 2.5rem 5rem', borderTop: '1px solid rgba(255,255,255,.04)', background: '#060a14' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <img src="/logo_full.png" alt="Intelligent Portfolio" style={{ height: '26px', objectFit: 'contain' }} />
                    <div style={{ display: 'flex', gap: '1.8rem', fontSize: '.8rem' }}>
                        {[
                            { href: 'mailto:pginvestimentos021@gmail.com', label: 'Suporte' },
                            { href: '/privacy', label: 'Privacidade' },
                            { href: '/terms', label: 'Termos' },
                        ].map((l, i) => (
                            <a key={i} href={l.href} style={{ color: '#475569', textDecoration: 'none', transition: 'color .2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#63b3ed')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                                {l.label}
                            </a>
                        ))}
                    </div>
                    <p style={{ color: '#1e293b', fontSize: '.72rem' }}>© 2026 Intelligent Portfolio</p>
                </div>
            </footer>

            {/* ═══════════════ FLOATING CTA BAR (appears after hero) ═══════════════ */}
            <div className={`float-cta${showFloating ? '' : ' hidden'}`}>
                <p style={{ color: '#94a3b8', fontSize: '.85rem', fontWeight: 600, margin: 0 }}>
                    Organize sua carteira em 2 minutos
                </p>
                <button
                    onClick={() => cta('floating')}
                    className="float-btn"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '.65rem 1.6rem', fontSize: '.9rem', fontWeight: 800,
                        background: 'linear-gradient(135deg,#3b82f6,#63b3ed)',
                        border: 'none', borderRadius: '10px', color: '#fff',
                        cursor: 'pointer', boxShadow: '0 8px 22px rgba(59,130,246,.4)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Começar grátis <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};
