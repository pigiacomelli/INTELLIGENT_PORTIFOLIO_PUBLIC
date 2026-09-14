import React from 'react';
import {
    CheckCircle2,
    Upload,
    Zap,
    TrendingUp,
    ShieldCheck,
    LayoutDashboard
} from 'lucide-react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const steps = [
        {
            icon: <Upload size={24} color="var(--accent-primary)" />,
            title: "1. Importe seus Dados",
            desc: "Use o botão 'Importar B3' para subir sua planilha do Excel ou adicione ativos manualmente em segundos. Suportamos Ações, FIIs, Cripto e Renda Fixa."
        },
        {
            icon: <Zap size={24} color="var(--accent-secondary)" />,
            title: "2. Diagnóstico Inteligente",
            desc: "O sistema analisa sua carteira instantaneamente buscando riscos de concentração, falhas de alocação e sugerindo rebalanceamentos estratégicos."
        },
        {
            icon: <LayoutDashboard size={24} color="var(--accent-success)" />,
            title: "3. Monitore em Tempo Real",
            desc: "Acompanhe cotações, patrimônio consolidado e exposição setorial em um dashboard ultra-rápido projetado para alta performance."
        },
        {
            icon: <ShieldCheck size={24} color="#f59e0b" />,
            title: "4. Segurança de Elite",
            desc: "Seus dados financeiros são sensíveis. Por isso usamos criptografia de ponta e nunca armazenamos suas senhas bancárias ou de corretoras."
        }
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '1px solid var(--glass-border-strong)',
                borderRadius: '32px',
                padding: '3rem',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '0.5rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                    ✕ Fechar
                </button>

                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '24px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        background: 'rgba(56, 189, 248, 0.05)',
                        border: '1px solid rgba(56, 189, 248, 0.1)'
                    }}>
                        <img src="/logo_icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2 className="text-gradient-premium" style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
                        Como Funciona
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Transforme sua gestão de investimentos em 4 passos simples.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '24px',
                            padding: '2rem',
                            transition: 'all 0.3s'
                        }} className="hover-scale">
                            <div style={{ marginBottom: '1.5rem' }}>{step.icon}</div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-main)' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
                    <button
                        onClick={onClose}
                        className="btn-primary"
                        style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', borderRadius: '18px' }}
                    >
                        Entendi, Vamos Começar!
                    </button>
                    <p style={{ marginTop: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Você pode reabrir este guia a qualquer momento no cabeçalho do Dashboard.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};
