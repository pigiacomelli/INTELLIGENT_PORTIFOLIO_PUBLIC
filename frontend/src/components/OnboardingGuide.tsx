import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Wallet, Upload, Sparkles, X, ChevronRight } from 'lucide-react';

interface OnboardingGuideProps {
    hasAssets: boolean;
    onAddAsset: () => void;
    onImportB3: () => void;
    onViewDiagnostic: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ hasAssets, onAddAsset, onImportB3, onViewDiagnostic }) => {
    const [hasViewedDiagnostic, setHasViewedDiagnostic] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const viewed = localStorage.getItem('hasViewedDiagnostic') === 'true';
        setHasViewedDiagnostic(viewed);
        const dismissed = localStorage.getItem('onboardingDismissed') === 'true';
        setIsDismissed(dismissed);
    }, []);

    const dismiss = () => {
        localStorage.setItem('onboardingDismissed', 'true');
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    const step1Complete = true;
    const step2Complete = hasAssets;
    const step3Complete = hasViewedDiagnostic;

    const completedSteps = (step1Complete ? 1 : 0) + (step2Complete ? 1 : 0) + (step3Complete ? 1 : 0);
    const progress = (completedSteps / 3) * 100;

    if (completedSteps === 3) {
        setTimeout(dismiss, 4000);
    }

    const StepIcon = ({ completed }: { completed: boolean }) => (
        completed ? <CheckCircle2 size={24} color="var(--accent-green)" /> : <Circle size={24} color="var(--text-muted)" />
    );

    return (
        <div className="glass-card animate-fade-in" style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(to right, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.5))',
            borderRadius: '20px',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <button
                onClick={dismiss}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                }}
            >
                <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="var(--accent-blue)" />
                    Bem-vindo! Vamos configurar sua conta
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, background: 'var(--accent-blue)', height: '100%', transition: 'width 0.5s ease-in-out' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {completedSteps}/3 Concluídos
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {/* Step 1 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    opacity: step1Complete ? 0.7 : 1
                }}>
                    <StepIcon completed={step1Complete} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: step1Complete ? 'var(--text-muted)' : 'var(--text-main)' }}>Criar carteira</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sua primeira carteira foi criada automaticamente.</p>
                    </div>
                </div>

                {/* Step 2 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: step2Complete ? 'rgba(255, 255, 255, 0.02)' : 'rgba(56, 189, 248, 0.05)',
                    borderRadius: '12px',
                    border: step2Complete ? '1px solid transparent' : '1px solid rgba(56, 189, 248, 0.2)',
                    opacity: step2Complete ? 0.7 : 1
                }}>
                    <StepIcon completed={step2Complete} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: step2Complete ? 'var(--text-muted)' : 'var(--text-main)' }}>Adicionar ativos</h4>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comece a acompanhar seus investimentos.</p>
                        {!step2Complete && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={onImportB3}
                                    style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Upload size={16} /> Importar B3
                                </button>
                                <button
                                    onClick={onAddAsset}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Wallet size={16} /> Manual
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 3 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: step3Complete ? 'rgba(255, 255, 255, 0.02)' : (step2Complete ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)'),
                    borderRadius: '12px',
                    border: step3Complete ? '1px solid transparent' : (step2Complete ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent'),
                    opacity: step3Complete || !step2Complete ? 0.7 : 1
                }}>
                    <StepIcon completed={step3Complete} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: step3Complete ? 'var(--text-muted)' : 'var(--text-main)' }}>Ver o Diagnóstico da Carteira</h4>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receba insights sobre a sua carteira.</p>
                        {!step3Complete && step2Complete && (
                            <button
                                onClick={onViewDiagnostic}
                                style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, #d946ef 100%)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Sparkles size={16} /> Analisar Carteira <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
