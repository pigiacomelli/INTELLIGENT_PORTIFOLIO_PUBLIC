import React from 'react';
import { HardDrive, LineChart, Rocket, Wallet } from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
    onHowItWorks: () => void;
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onHowItWorks,
    isOpen
}) => {
    const menuItems = [
        { id: 'carteira', label: 'Minha Carteira', icon: Wallet, accent: 'var(--accent-blue)' },
        { id: 'mercado', label: 'Mercado', icon: LineChart, accent: 'var(--accent-emerald)' },
    ];

    return (
        <aside className={`sidebar-collapsible${isOpen ? '' : ' closed'}`} style={{
            width: '280px',
            background: 'rgba(15, 23, 42, 0.86)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            position: 'relative',
            zIndex: 100,
            flexShrink: 0,
            height: '100%'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', paddingLeft: '0.4rem' }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(56, 189, 248, 0.07)',
                    border: '1px solid rgba(56, 189, 248, 0.14)',
                    width: '48px',
                    height: '48px'
                }}>
                    <img src="/logo_icon.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {isOpen && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>Minha Carteira</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Painel pessoal</span>
                    </div>
                )}
            </div>

            <nav aria-label="Navegação principal" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        aria-current={currentView === item.id ? 'page' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '1rem 1.1rem',
                            borderRadius: '15px',
                            background: currentView === item.id ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                            border: '1px solid',
                            borderColor: currentView === item.id ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
                            color: currentView === item.id ? 'var(--text-main)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            fontWeight: currentView === item.id ? 800 : 600,
                            fontSize: '1rem',
                            outline: 'none',
                            position: 'relative'
                        }}
                    >
                        {currentView === item.id && (
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '25%',
                                height: '50%',
                                width: '4px',
                                background: item.accent,
                                borderRadius: '0 4px 4px 0'
                            }} />
                        )}
                        <item.icon size={21} color={item.accent} />
                        {isOpen && item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button
                    onClick={onHowItWorks}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.9rem 1rem',
                        width: '100%',
                        borderRadius: '14px',
                        background: 'rgba(56, 189, 248, 0.05)',
                        border: '1px solid rgba(56, 189, 248, 0.12)',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.92rem'
                    }}
                >
                    <Rocket size={19} />
                    {isOpen && 'Como funciona'}
                </button>

                <div style={{
                    padding: '1rem',
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px'
                }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <HardDrive size={19} color="var(--accent-emerald)" />
                    </div>
                    {isOpen && (
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>DADOS LOCAIS</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>Neste computador</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
