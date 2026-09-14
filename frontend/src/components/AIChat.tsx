import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, Loader2, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export const AIChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou seu Consultor Financeiro. Estou conectado à sua carteira de investimentos em tempo real.\n\nComo posso te ajudar a analisar seu portfólio hoje?'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const response = await axios.post('/api/chat', {
                message: userMsg.content,
                history: history
            });

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.reply
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Backend chat failed:', error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro ao conectar com a IA. Verifique sua chave de API ou se sua assinatura/período de teste está ativa.'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedPrompts = [
        "Minha carteira está muito concentrada?",
        "Qual o meu maior risco atual?",
        "Sugira uma estratégia de rebalanceamento."
    ];

    const handlePromptClick = (prompt: string) => {
        setInputValue(prompt);
    };

    return (
        <div className="glass-card animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 160px)',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
        }}>
            {/* AI Background Glow */}
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Premium Header */}
            <div style={{
                padding: '1.5rem 2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-secondary)',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Elite Advisor</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Sempre disponível</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => { setMessages([messages[0]]); setInputValue(''); }}
                        title="Reiniciar conversa"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                scrollBehavior: 'smooth',
                zIndex: 1
            }}>
                {messages.length === 1 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ maxWidth: '450px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, lineHeight: '1.6' }}>Seu consultor dedicado para otimização de patrimônio e análise de cenários.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            {suggestedPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePromptClick(prompt)}
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.6)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '0.8rem 1.4rem',
                                        borderRadius: '16px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                                        e.currentTarget.style.color = 'var(--text-main)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    <MessageSquare size={16} color="var(--accent-blue)" /> {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        gap: '1.2rem',
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                        maxWidth: msg.role === 'user' ? '85%' : '100%',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        animation: 'fadeInUp 0.4s ease-out'
                    }}>
                        {msg.role === 'assistant' && (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--accent-blue) 0%, #60a5fa 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                            }}>
                                <Bot size={22} color="#ffffff" />
                            </div>
                        )}
                        <div className={msg.role === 'user' ? 'glass-card' : ''} style={{
                            background: msg.role === 'user' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            padding: msg.role === 'user' ? '1.2rem 1.8rem' : '0.5rem 0',
                            borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '0',
                            border: msg.role === 'user' ? '1px solid rgba(56, 189, 248, 0.2)' : 'none',
                            color: msg.role === 'user' ? 'var(--text-main)' : 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            flex: 1
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="animate-pulse" style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Loader2 size={22} color="var(--accent-blue)" className="animate-spin" />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                            ANALISANDO DADOS...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Area */}
            <div style={{
                padding: '2rem 3rem',
                background: 'rgba(15, 23, 42, 0.4)',
                borderTop: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                zIndex: 10
            }}>
                <form onSubmit={handleSendMessage} style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '20px',
                    padding: '8px 10px 8px 24px',
                    position: 'relative',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ex: Como está minha concentração de risco hoje?"
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            padding: '12px 0',
                            color: 'var(--text-main)',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        style={{
                            background: isLoading || !inputValue.trim() ? 'rgba(255,255,255,0.02)' : 'var(--accent-blue)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '16px',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isLoading || !inputValue.trim() ? 'default' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: isLoading || !inputValue.trim() ? 'none' : '0 4px 15px rgba(56, 189, 248, 0.3)'
                        }}
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={22} style={{ transform: 'translateX(1px)' }} />}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, opacity: 0.7 }}>Este consultor pode cometer erros. Sempre valide recomendações críticas com um profissional.</span>
                </div>
            </div>
        </div>
    );
};
