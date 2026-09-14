import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface AuthFormProps {
    onSwitchMode: () => void;
}

export const AuthForms: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), var(--bg-darker)',
            padding: '2rem'
        }}>
            <div className="glass-card animate-fade-in" style={{
                width: '100%',
                maxWidth: '460px',
                padding: '3.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(30px)',
                border: '1px solid var(--glass-border-strong)',
                borderRadius: '32px',
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '24px',
                            width: '85px',
                            height: '85px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(56, 189, 248, 0.05)',
                            border: '1px solid rgba(56, 189, 248, 0.1)'
                        }}>
                            <img src="/logo_icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: '#f8fafc', margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        {isLogin ? 'Bem-vindo de Volta' : 'Crie sua Conta'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1.2rem', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5, maxWidth: '280px', margin: '1.2rem auto 0' }}>
                        {isLogin ? 'Gerencie seu patrimônio com inteligência' : 'Comece a gerenciar seu patrimônio com IA'}
                    </p>
                </div>

                {isLogin ? (
                    <LoginForm onSwitchMode={() => setIsLogin(false)} />
                ) : (
                    <RegisterForm onSwitchMode={() => setIsLogin(true)} />
                )}
            </div>
        </div>
    );
};

const LoginForm: React.FC<AuthFormProps> = ({ onSwitchMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, user } = response.data;
            login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <div className="input-group" style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc',
                        outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc',
                        outline: 'none', transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            <button type="submit" disabled={isLoading} style={{
                background: isLoading ? 'rgba(56, 189, 248, 0.5)' : '#38bdf8', color: '#fff',
                padding: '0.9rem', borderRadius: '8px', border: 'none', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', transition: 'background 0.3s'
            }}>
                {isLoading ? 'Entrando...' : <><LogIn size={18} /> Entrar</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Não tem uma conta? </span>
                <button type="button" onClick={onSwitchMode} style={{
                    background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600,
                    cursor: 'pointer', padding: 0, textDecoration: 'underline'
                }}>Registre-se</button>
            </div>
        </form>
    );
};

const RegisterForm: React.FC<AuthFormProps> = ({ onSwitchMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/register', { email, password });
            const { token, user } = response.data;
            setSuccess('Conta criada com sucesso! Entrando...');

            try {
                // Tracking the actual successful signup conversion
                let device = 'unknown';
                if (window.location.pathname === '/mobile') device = 'mobile';
                else if (window.location.pathname === '/desktop') device = 'desktop';

                if ((window as any).va) (window as any).va('event', { name: 'signup_completed', device });
                if ((window as any).dataLayer) (window as any).dataLayer.push({ event: 'signup_completed', device });
            } catch (e) {
                console.error('Tracking signup_completed error', e);
            }

            // Auto-login immediately
            login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao registrar. O email já pode estar em uso.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ color: '#4ade80', fontSize: '0.9rem', textAlign: 'center' }}>{success}</div>}

            <div className="input-group" style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a Senha"
                    required
                    style={{
                        width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc',
                        outline: 'none'
                    }}
                />
            </div>

            <button type="submit" disabled={isLoading} style={{
                background: isLoading ? 'rgba(56, 189, 248, 0.5)' : '#38bdf8', color: '#fff',
                padding: '0.9rem', borderRadius: '8px', border: 'none', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', transition: 'background 0.3s'
            }}>
                {isLoading ? 'Registrando...' : <><UserPlus size={18} /> Registrar</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Já possui uma conta? </span>
                <button type="button" onClick={onSwitchMode} style={{
                    background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600,
                    cursor: 'pointer', padding: 0, textDecoration: 'underline'
                }}>Faça login</button>
            </div>
        </form>
    );
};
