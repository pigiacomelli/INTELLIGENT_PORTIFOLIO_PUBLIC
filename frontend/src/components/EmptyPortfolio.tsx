import React from 'react';
import { PlusCircle, Wallet, Sparkles } from 'lucide-react';

interface EmptyPortfolioProps {
    onAddAsset: () => void;
    onImport?: () => void;
}

export const EmptyPortfolio: React.FC<EmptyPortfolioProps> = ({ onAddAsset, onImport }) => {
    return (
        <div className="glass-card animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            minHeight: '400px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid var(--glass-border)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    boxShadow: '0 8px 32px rgba(56, 189, 248, 0.1)',
                    marginBottom: '1rem'
                }}>
                    <Wallet size={40} color="var(--accent-blue)" />
                </div>

                <div>
                    <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        margin: '0 0 0.5rem 0',
                        letterSpacing: '-0.5px'
                    }}>
                        Sua jornada começa aqui
                    </h2>
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        maxWidth: '400px',
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        Adicione seus primeiros ativos para desbloquear análises avançadas e acompanhar o crescimento do seu patrimônio.
                    </p>
                </div>

                <button
                    onClick={onAddAsset}
                    style={{
                        marginTop: '1rem',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(56, 189, 248, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(56, 189, 248, 0.3)';
                    }}
                >
                    <PlusCircle size={20} />
                    Adicionar Primeiro Ativo
                    <Sparkles size={16} color="rgba(255, 255, 255, 0.8)" style={{ marginLeft: '4px' }} />
                </button>

                {onImport && (
                    <button
                        onClick={onImport}
                        style={{
                            marginTop: '0.5rem',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Importar Planilha B3 (Simplificado)
                    </button>
                )}
            </div>
        </div>
    );
};
