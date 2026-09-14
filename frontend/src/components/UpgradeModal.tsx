import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason?: 'trial_expired' | 'requires_subscription';
    trialDaysLeft?: number;
    isSubscribed?: boolean;
}

export default function UpgradeModal({ isOpen, onClose, reason, trialDaysLeft = 0, isSubscribed }: UpgradeModalProps) {
    const [loading, setLoading] = useState<'checkout' | 'portal' | null>(null);

    if (!isOpen) return null;

    const handleCheckout = async () => {
        setLoading('checkout');
        try {
            const res = await axios.post('/api/payments/create-checkout-session');
            if (res.data?.url) window.location.href = res.data.url;
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
            setLoading(null);
        }
    };

    const handlePortal = async () => {
        setLoading('portal');
        try {
            const res = await axios.post('/api/payments/create-portal-session');
            if (res.data?.url) window.location.href = res.data.url;
        } catch (err) {
            console.error('Portal error:', err);
        } finally {
            setLoading(null);
        }
    };

    const isExpired = reason === 'trial_expired' || reason === 'requires_subscription';

    return (
        <div className="upgrade-modal-overlay" onClick={onClose}>
            <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="upgrade-modal-close" onClick={onClose}><X size={18} /></button>

                {/* Header */}
                <div className="upgrade-modal-header">
                    <div className="upgrade-modal-icon">⚡</div>
                    <h2 className="upgrade-modal-title">
                        {isSubscribed ? 'Gerenciar Assinatura' : isExpired ? 'Acesso Trial Encerrado' : 'Eleve seus Investimentos'}
                    </h2>
                    <p className="upgrade-modal-subtitle" style={{ maxWidth: '85%', margin: '0 auto' }}>
                        {isSubscribed
                            ? 'Gerencie seu plano atual, altere seu método de pagamento e baixe o histórico completo das notas fiscais e faturas emitidas.'
                            : isExpired
                                ? 'Seu período de avaliação gratuita incrível chegou ao fim. Assine agora o plano Pro para reativar o banco de dados da B3 em Tempo Real e o diagnóstico inteligente.'
                                : `Não perca sua vantagem competitiva. Você tem mais ${trialDaysLeft} dia${trialDaysLeft !== 1 ? 's' : ''} de acesso premium garantido. Assine agora.`}
                    </p>
                </div>

                {/* Plan comparison */}
                {!isSubscribed && (
                    <div className="upgrade-plans">
                        <div className="upgrade-plan upgrade-plan-free">
                            <div className="upgrade-plan-name" style={{ color: '#cbd5e1' }}>30 Dias de Experiência</div>
                            <div className="upgrade-plan-price" style={{ color: '#94a3b8' }}>R$ 0<span>/mês</span></div>
                            <ul className="upgrade-plan-features">
                                <li className="feature-off">❌ Insight de IA desativado após teste</li>
                                <li className="feature-off">❌ Acesso limitado por tempo</li>
                                <li className="feature-off">❌ Sem análises profundas de risco</li>
                            </ul>
                        </div>

                        <div className="upgrade-plan upgrade-plan-pro">
                            <div className="upgrade-plan-badge animate-pulse">ESCOLHA DOS LÍDERES</div>
                            <div className="upgrade-plan-name" style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>Pro Advisor Premium</div>
                            <div className="upgrade-plan-price">R$ 29,90<span>/mês</span></div>
                            <ul className="upgrade-plan-features">
                                <li className="feature-on">✅ <strong>Radar Infinito de IA</strong> (Chat ilimitado)</li>
                                <li className="feature-on">✅ <strong>Diagnóstico de Risco</strong> em clique único</li>
                                <li className="feature-on">✅ <strong>Carteiras Múltiplas</strong> (Organize CNPJ/CPF)</li>
                                <li className="feature-on">✅ <strong>Tempo Real B3</strong> e Criptomoedas globals</li>
                                <li className="feature-on">✅ <em>Cancelamento a qualquer minuto</em></li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="upgrade-modal-actions">
                    {isSubscribed ? (
                        <button
                            className="upgrade-btn-primary"
                            onClick={handlePortal}
                            disabled={loading === 'portal'}
                        >
                            {loading === 'portal' ? 'Redirecionando...' : '⚙️ Gerenciar no Stripe'}
                        </button>
                    ) : (
                        <>
                            <button
                                className="upgrade-btn-primary"
                                onClick={handleCheckout}
                                disabled={!!loading}
                            >
                                {loading === 'checkout' ? 'Aguarde...' : '🚀 Assinar por R$ 29,90/mês'}
                            </button>
                            <p className="upgrade-modal-note">
                                Cancele a qualquer momento. Sem fidelidade.
                            </p>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .upgrade-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

                .upgrade-modal {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border: 1px solid rgba(99, 102, 241, 0.4);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    max-width: 560px;
                    width: 100%;
                    position: relative;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
                    animation: slideUp 0.25s ease;
                }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

                .upgrade-modal-close {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: rgba(255,255,255,0.08);
                    border: none;
                    color: #94a3b8;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 0.85rem;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .upgrade-modal-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

                .upgrade-modal-header { text-align: center; margin-bottom: 2rem; }
                .upgrade-modal-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
                .upgrade-modal-title { color: #f8fafc; font-size: 1.6rem; font-weight: 700; margin: 0 0 0.5rem; }
                .upgrade-modal-subtitle { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin: 0; }

                .upgrade-plans {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .upgrade-plan {
                    border-radius: 1rem;
                    padding: 1.25rem;
                    position: relative;
                }
                .upgrade-plan-free {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .upgrade-plan-pro {
                    background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%);
                    border: 1px solid rgba(99,102,241,0.5);
                }
                .upgrade-plan-badge {
                    position: absolute;
                    top: -0.6rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(90deg, #6366f1, #8b5cf6);
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    letter-spacing: 0.05em;
                    white-space: nowrap;
                }
                .upgrade-plan-name {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 0.5rem;
                }
                .upgrade-plan-price {
                    color: #f8fafc;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                .upgrade-plan-price span { font-size: 0.85rem; color: #64748b; font-weight: 400; }
                .upgrade-plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
                .upgrade-plan-features li { font-size: 0.8rem; }
                .feature-on { color: #86efac; }
                .feature-off { color: #64748b; }

                .upgrade-modal-actions { display: flex; flex-direction: column; gap: 0.75rem; }
                .upgrade-btn-primary {
                    width: 100%;
                    padding: 0.9rem 1.5rem;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }
                .upgrade-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
                }
                .upgrade-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                .upgrade-modal-note { text-align: center; color: #64748b; font-size: 0.8rem; margin: 0; }
            `}</style>
        </div>
    );
}
