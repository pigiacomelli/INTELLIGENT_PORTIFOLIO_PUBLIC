import React, { useState } from 'react';
import axios from 'axios';

const LGPDSettings: React.FC = () => {
    const [status, setStatus] = useState<string | null>(null);

    const handleRequest = async (type: 'access' | 'correction' | 'deletion') => {
        if (type === 'deletion' && !confirm('Tem certeza que deseja excluir todos os seus dados? Esta ação é irreversível.')) {
            return;
        }

        try {
            if (type === 'deletion') {
                await axios.delete('/api/auth/me');
                window.location.reload();
            } else {
                // For MVP, just show a success message or handle via email
                setStatus(`Sua solicitação de ${type} foi registrada. Entraremos em contato em até 15 dias.`);
            }
        } catch (error) {
            setStatus('Erro ao processar solicitação. Tente novamente mais tarde.');
        }
    };

    return (
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ color: 'var(--text-main)' }}>🛡️ Gestão de Privacidade (LGPD)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus dados e privacidade de acordo com a lei.</p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => handleRequest('access')}
                    style={buttonStyle}
                >
                    Acessar Meus Dados
                </button>
                <button
                    onClick={() => handleRequest('correction')}
                    style={buttonStyle}
                >
                    Corrigir Dados
                </button>
                <button
                    onClick={() => handleRequest('deletion')}
                    style={{ ...buttonStyle, background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                >
                    Excluir Minha Conta
                </button>
            </div>

            {status && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                    {status}
                </div>
            )}
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    padding: '0.8rem 1.2rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s'
};

export default LGPDSettings;
