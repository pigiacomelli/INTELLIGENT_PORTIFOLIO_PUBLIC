import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TrialBannerProps {
    subscription: {
        isTrial: boolean;
        trialDaysLeft: number;
        isActive: boolean;
    } | null;
    onUpgrade: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ subscription, onUpgrade }) => {
    if (!subscription || !subscription.isTrial || subscription.isActive) return null;

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
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                DESBLOQUEAR ACESSO PRO <ArrowRight size={14} />
            </button>
        </div>
    );
};
