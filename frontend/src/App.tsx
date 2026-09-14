import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import { LandingPageV2 } from './components/LandingPageV2'
import { LandingPageMobile } from './components/LandingPageMobile'
import { LandingPageDesktop } from './components/LandingPageDesktop'
import { AuthForms } from './components/Auth/AuthForms'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PublicPortfolio } from './PublicPortfolio'
import TermsOfUse from './components/legal/TermsOfUse'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import { Lock } from 'lucide-react'
import axios from 'axios'
import { Analytics } from "@vercel/analytics/react"

// Setup global Axios baseURL if provided via environment variables (Deployment)
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

// Setup global Axios interceptor for JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SmartApp:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AppContent = () => {
  const { isAuthenticated, isLoading, user, refreshUser, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-darker)',
        color: 'var(--text-main)',
        fontFamily: "'Outfit', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2.5rem',
            padding: '8px',
            animation: 'pulse-premium 3s ease-in-out infinite'
          }}>
            <img src="/logo_icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-2px', margin: '0 0 0.8rem', lineHeight: 1 }}>
            INTELLIGENT <span className="text-gradient">PORTFOLIO</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '1.5rem' }}>
            PROFESSIONAL EDITION
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce-dot 1.4s infinite 0s' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce-dot 1.4s infinite 0.2s' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'bounce-dot 1.4s infinite 0.4s' }} />
          </div>
        </div>

        <style>{`
          @keyframes pulse-premium {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.05); filter: brightness(1.2); }
          }
          @keyframes bounce-dot {
            0%, 100% { transform: translateY(0); opacity: 0.2; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-darker)' }}>
          <button
            onClick={() => setShowAuth(false)}
            style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, zIndex: 10 }}
          >
            ← Voltar para o Início
          </button>
          <AuthForms />
        </div>
      );
    }

    if (window.location.pathname === '/mobile') {
      return <LandingPageMobile onGetStarted={() => setShowAuth(true)} />;
    }

    if (window.location.pathname === '/desktop') {
      return <LandingPageDesktop onGetStarted={() => setShowAuth(true)} />;
    }

    return <LandingPageV2 onGetStarted={() => setShowAuth(true)} />;
  }

  return <Dashboard />;
}

function App() {
  if (window.location.pathname.startsWith('/p/')) {
    return <PublicPortfolio />;
  }

  if (window.location.pathname === '/terms' || window.location.pathname === '/termos') {
    return (
      <div style={{ background: 'var(--bg-darker)', minHeight: '100vh' }}>
        <button onClick={() => window.location.href = '/'} style={{ margin: '1rem', color: 'var(--text-main)', background: 'none', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>← Voltar</button>
        <TermsOfUse />
      </div>
    );
  }

  if (window.location.pathname === '/privacy' || window.location.pathname === '/privacidade') {
    return (
      <div style={{ background: 'var(--bg-darker)', minHeight: '100vh' }}>
        <button onClick={() => window.location.href = '/'} style={{ margin: '1rem', color: 'var(--text-main)', background: 'none', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>← Voltar</button>
        <PrivacyPolicy />
      </div>
    );
  }

  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Analytics />
    </>
  )
}

export default App
