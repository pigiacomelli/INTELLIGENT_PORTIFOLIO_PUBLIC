import React, { useEffect, useState } from 'react';

interface CheckoutSuccessProps {
    onContinue: () => void;
}

export default function CheckoutSuccess({ onContinue }: CheckoutSuccessProps) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onContinue();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [onContinue]);

    return (
        <div className="checkout-success-overlay">
            <div className="checkout-success-card">
                <div className="checkout-success-animation">
                    <div className="checkout-success-circle">
                        <span className="checkout-success-check">✓</span>
                    </div>
                </div>

                <h1 className="checkout-success-title">Assinatura Ativada!</h1>
                <p className="checkout-success-subtitle">
                    Bem-vindo ao <strong>Intelligent Portfolio Pro</strong>. Sua conta está ativa e você já tem acesso a todos os recursos.
                </p>

                <div className="checkout-success-features">
                    <div className="checkout-success-feature">⚡ IA Ilimitada</div>
                    <div className="checkout-success-feature">📊 Análise Avançada</div>
                    <div className="checkout-success-feature">💼 Múltiplas Carteiras</div>
                </div>

                <button className="checkout-success-btn" onClick={onContinue}>
                    Ir para o Dashboard ({countdown}s)
                </button>
            </div>

            <style>{`
                .checkout-success-overlay {
                    position: fixed;
                    inset: 0;
                    background: linear-gradient(135deg, #0f172a 0%, #1a103a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    padding: 1rem;
                }
                .checkout-success-card {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(99,102,241,0.3);
                    border-radius: 1.5rem;
                    padding: 3rem 2.5rem;
                    max-width: 480px;
                    width: 100%;
                    text-align: center;
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .checkout-success-animation { margin-bottom: 1.5rem; }
                .checkout-success-circle {
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: inline-flex;
                    align-items: center; justify-content: center;
                    box-shadow: 0 0 40px rgba(99,102,241,0.5);
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 40px rgba(99,102,241,0.5); }
                    50% { box-shadow: 0 0 60px rgba(99,102,241,0.8); }
                }
                .checkout-success-check { color: white; font-size: 2.5rem; font-weight: 700; }
                .checkout-success-title {
                    color: #f8fafc;
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 0.75rem;
                }
                .checkout-success-subtitle {
                    color: #94a3b8;
                    font-size: 1rem;
                    line-height: 1.6;
                    margin: 0 0 2rem;
                }
                .checkout-success-subtitle strong { color: #c4b5fd; }
                .checkout-success-features {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 2rem;
                }
                .checkout-success-feature {
                    background: rgba(99,102,241,0.15);
                    border: 1px solid rgba(99,102,241,0.3);
                    color: #a5b4fc;
                    padding: 0.4rem 0.9rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .checkout-success-btn {
                    width: 100%;
                    padding: 0.9rem;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(99,102,241,0.4);
                }
                .checkout-success-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(99,102,241,0.5);
                }
            `}</style>
        </div>
    );
}
