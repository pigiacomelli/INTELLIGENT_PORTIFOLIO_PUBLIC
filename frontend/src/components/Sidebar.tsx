import React from 'react';
import {
    TrendingUp,
    Globe2,
    LayoutDashboard,
    Fingerprint,
    Rocket,
    X,
    Shield,
    Share2,
    HelpCircle,
    Wallet,
    LineChart,
    User,
    AlertTriangle
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onViewChange: (v: string) => void;
    onLogout: () => void;
    onHowItWorks: () => void;
    isOpen: boolean;
    subscription?: {
        status: string;
        plan: string;
        isActive: boolean;
        isTrial: boolean;
        trialDaysLeft: number;
    } | null;
    onShare?: () => void;
    isSharing?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onLogout,
    onHowItWorks,
    isOpen,
    subscription,
    onShare,
    isSharing
}) => {
    const menuItems = [
        { id: 'carteira', label: 'Minha Carteira', icon: Wallet, accent: 'var(--accent-blue)' },
        { id: 'mercado', label: 'Mercado', icon: LineChart, accent: 'var(--accent-emerald)' },
        { id: 'conta', label: 'Minha Conta', icon: User, accent: 'var(--accent-purple)' },
    ];

    const getPlanBadge = () => {
        if (subscription?.isActive) {
            return { label: 'PRO PLAN', color: 'var(--accent-blue)', icon: Shield, sub: 'VERIFIED ACCT' };
        }
        if (subscription?.status === 'past_due') {
            return { label: 'PENDENTE', color: '#f87171', icon: AlertTriangle, sub: 'ATUALIZAR CARTÃO' };
        }
        if (subscription?.status === 'canceled' && !subscription?.isTrial) {
            return { label: 'CANCELADO', color: '#fbbf24', icon: AlertTriangle, sub: 'INATIVO' };
        }
        if (subscription?.isTrial) {
            return {
                label: 'TRIAL ACTIVE',
                color: 'var(--accent-amber)',
                icon: Rocket,
                sub: `${subscription.trialDaysLeft} DAYS LEFT`
            };
        }
        return { label: 'FREE PLAN', color: '#94a3b8', icon: Rocket, sub: 'LIMITADO' };
    };

    const badge = getPlanBadge();

    return (
        <aside className={`sidebar-collapsible${isOpen ? '' : ' closed'}`} style={{
            width: '280px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2.5rem 1.5rem',
            position: 'relative',
            zIndex: 100,
            flexShrink: 0,
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', paddingLeft: '0.5rem', position: 'relative', zIndex: 2 }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.1)',
                    width: '48px',
                    height: '48px'
                }}>
                    <img src="/logo_icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {isOpen && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Intelligent</span>
                        <span style={{ color: 'var(--accent-secondary)', fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Portfolio</span>
                    </div>
                )}
            </div>

            {/* Elemento Decorativo Discreto */}
            < div style={{ position: 'absolute', top: '10%', right: '-20px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }} />

            < nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                {
                    menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1.1rem 1.2rem',
                                borderRadius: '16px',
                                background: currentView === item.id ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                                border: '1px solid',
                                borderColor: currentView === item.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                color: currentView === item.id ? 'var(--text-main)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                fontWeight: currentView === item.id ? 800 : 600,
                                fontSize: '1.05rem',
                                outline: 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Active Indicator Line */}
                            {currentView === item.id && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '25%',
                                    height: '50%',
                                    width: '4px',
                                    background: item.accent,
                                    borderRadius: '0 4px 4px 0',
                                    boxShadow: `0 0 10px ${item.accent}`
                                }} />
                            )}
                            <item.icon
                                size={22}
                                style={{
                                    color: item.accent,
                                    opacity: currentView === item.id ? 1 : 0.65,
                                    transition: 'all 0.3s',
                                    filter: currentView === item.id ? `drop-shadow(0 0 8px ${item.accent}40)` : 'none'
                                }}
                            />
                            {item.label}
                        </button>
                    ))
                }

                {/* Botão Extra: Compartilhar Carteira */}
                {
                    onShare && (
                        <button
                            onClick={onShare}
                            disabled={isSharing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1.1rem 1.2rem',
                                borderRadius: '16px',
                                background: 'transparent',
                                border: '1px dashed rgba(168, 85, 247, 0.3)',
                                color: 'var(--accent-purple)',
                                cursor: isSharing ? 'not-allowed' : 'pointer',
                                opacity: isSharing ? 0.6 : 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                outline: 'none',
                                marginTop: '0.5rem'
                            }}
                            onMouseOver={e => !isSharing && (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)')}
                            onMouseOut={e => !isSharing && (e.currentTarget.style.background = 'transparent')}
                        >
                            <Share2 size={22} />
                            {isSharing ? 'Gerando...' : 'Compartilhar Carteira'}
                        </button>
                    )
                }
            </nav >

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button
                    onClick={onHowItWorks}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '1rem 1.2rem',
                        width: '100%',
                        borderRadius: '16px',
                        background: 'rgba(56, 189, 248, 0.05)',
                        border: '1px solid rgba(56, 189, 248, 0.1)',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        marginBottom: '0.5rem'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)')}
                >
                    <Rocket size={20} className="float-animation" /> Como Funciona
                </button>

                <a
                    href="mailto:pginvestimentos021@gmail.com?subject=Dúvida%20Intelligent%20Portfolio"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.8rem 1.2rem',
                        width: '100%',
                        borderRadius: '16px',
                        background: 'transparent',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s',
                        marginBottom: '1rem',
                        boxSizing: 'border-box'
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                    <HelpCircle size={18} />
                    Precisando de Ajuda?
                </a>

                <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: `1px solid ${badge.color}30`, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.7rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${badge.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <badge.icon size={20} color={badge.color} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{badge.label}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: badge.color, fontWeight: 700 }}>{badge.sub}</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '1.1rem 1.2rem',
                        width: '100%',
                        borderRadius: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-rose)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        transition: 'all 0.3s',
                        opacity: 0.8
                    }}
                >
                    <X size={20} style={{ transform: 'rotate(0deg)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseOut={e => e.currentTarget.style.transform = 'rotate(0deg)'} /> Sair da Conta
                </button>
            </div>
        </aside >
    );
};
