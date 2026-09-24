import React from 'react';
import { Sparkles, ArrowRight, AlertTriangle, CreditCard } from 'lucide-react';

interface SubscriptionBannerProps {
    subscription: {
        status: string;
        isTrial: boolean;
        trialDaysLeft: number;
        isActive: boolean;
        localMode?: boolean;
    } | null;
    onUpgrade: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ subscription, onUpgrade }) => {
    if (!subscription || subscription.localMode) return null;

    if (subscription.status === 'past_due') {
        return (
            <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                color: '#f87171',
                fontWeight: 600,
                fontSize: '0.9rem',
                zIndex: 1000,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>Identificamos um <strong>problema com seu último pagamento</strong>. O acesso Pro será suspenso em breve.</span>
                </div>

                <a
                    href={import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <CreditCard size={14} /> ATUALIZAR CARTÃO
                </a>
            </div>
        );
    }

    if (subscription.status === 'canceled' && !subscription.isTrial) {
        return (
            <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '0.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                color: '#fbbf24',
                fontWeight: 600,
                fontSize: '0.9rem',
                zIndex: 1000,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>Sua assinatura está <strong>cancelada/inativa</strong>.</span>
                </div>

                <button
                    onClick={onUpgrade}
                    style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    REATIVAR PLANO PRO <ArrowRight size={14} />
                </button>
            </div>
        );
    }

    if (subscription.isTrial && !subscription.isActive) {
        return (
            <div style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
                backgroundSize: '200% auto',
                animation: 'gradientMove 5s ease infinite',
                padding: '0.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                zIndex: 1000,
                position: 'relative'
            }}>
                <style>{`
                    @keyframes gradientMove {
                        0% { background-position: 0% 50% }
                        50% { background-position: 100% 50% }
                        100% { background-position: 0% 50% }
                    }
                `}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    <span>Você está no Período de Experiência: <strong>{subscription.trialDaysLeft} dias restantes</strong></span>
                </div>

                <button
                    onClick={onUpgrade}
                    style={{
                        background: 'white',
                        color: '#6366f1',
                        border: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                    }}
                >
                    DESBLOQUEAR ACESSO PRO <ArrowRight size={14} />
                </button>
            </div>
        );
    }

    if (!subscription.isTrial && !subscription.isActive) {
        // Free plan without trial
        return (
            <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
                padding: '0.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                color: '#7dd3fc',
                fontWeight: 600,
                fontSize: '0.9rem',
                zIndex: 1000,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    <span>Seu período de teste expirou.</span>
                </div>

                <button
                    onClick={onUpgrade}
                    style={{
                        background: '#38bdf8',
                        color: '#0f172a',
                        border: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    ASSINAR PLANO PRO <ArrowRight size={14} />
                </button>
            </div>
        );
    }

    return null;
};
