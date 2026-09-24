import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { HardDrive, RefreshCw, TrendingUp } from 'lucide-react';
import Dashboard from './Dashboard';

if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

axios.interceptors.request.use((request) => {
  const token = localStorage.getItem('@SmartApp:token');
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

type StartupStatus = 'loading' | 'ready' | 'error';

function App() {
  const [status, setStatus] = useState<StartupStatus>('loading');
  const [error, setError] = useState('');

  const openLocalPortfolio = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await axios.post('/api/local/session');
      localStorage.setItem('@SmartApp:token', response.data.token);
      localStorage.setItem('@SmartApp:user', JSON.stringify(response.data.user));
      setStatus('ready');
    } catch (startupError: any) {
      console.error('Failed to open local portfolio', startupError);
      setError(startupError?.response?.data?.error || 'Não foi possível acessar o banco local.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void openLocalPortfolio();
  }, [openLocalPortfolio]);

  if (status === 'ready') return <Dashboard />;

  return (
    <main className="local-startup">
      <div className="local-startup-card">
        <div className="local-startup-icon">
          {status === 'loading' ? <TrendingUp size={38} /> : <HardDrive size={38} />}
        </div>
        <h1>Minha carteira</h1>
        {status === 'loading' ? (
          <>
            <p>Abrindo seus investimentos neste computador…</p>
            <div className="local-startup-progress"><span /></div>
          </>
        ) : (
          <>
            <p>{error}</p>
            <small>Confirme que o aplicativo foi iniciado com o comando <strong>npm run dev</strong>.</small>
            <button type="button" onClick={openLocalPortfolio}>
              <RefreshCw size={18} /> Tentar novamente
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
