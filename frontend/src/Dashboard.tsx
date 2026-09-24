import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, Portfolio } from './utils/dashboardUtils';
import {
    TrendingUp,
    Briefcase,
    Building2,
    ShieldCheck,
    PieChart as PieChartIcon,
    AlertTriangle,
    Plus,
    X,
    ArrowUpRight,
    Sparkles,
    LayoutGrid,
    Upload,
    CheckCircle2,
    Menu,
    BadgeDollarSign,
    Globe
} from 'lucide-react';

import { EmptyPortfolio } from './components/EmptyPortfolio';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PortfolioTable } from './components/PortfolioTable';
import { AssetAllocationChart } from './components/AssetAllocationChart';
import { MercadoHoje } from './components/MercadoHoje';
import { AIChat } from './components/AIChat';
import { B3Importer } from './components/B3Importer';
import { HowItWorksModal } from './components/HowItWorksModal';
import { TABS, B3_INSTITUTIONS, COLORS, CATEGORIES, CRIPTO_OPTIONS, ETF_INTL_OPTIONS, ACOES_INTL_OPTIONS, BONDS_OPTIONS } from './utils/dashboardUtils';

import axios from 'axios';
import { Sidebar } from './components/Sidebar';

const portfolioDataInitial = { ativos: {}, totais: {} };

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div className="glass-card modal-card" style={{ width: '95%', maxWidth: '760px', padding: '2rem', borderRadius: '18px', background: 'var(--bg-panel)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}><X size={20} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('geral');
    const [portfolio, setPortfolio] = useState<Portfolio>(portfolioDataInitial as unknown as Portfolio);
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [editingAsset, setEditingAsset] = useState<{ category: string, index: number, asset: Asset } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sidebarView, setSidebarView] = useState('carteira');
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 900);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!localStorage.getItem('hasSeenTutorial')) {
            setIsHowItWorksOpen(true);
            localStorage.setItem('hasSeenTutorial', 'true');
        }
    }, []);

    // Multi-Portfolio State
    const [portfolioGroups, setPortfolioGroups] = useState<any[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
    const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('');

    const initialAssetState = {
        ticker: '',
        Quantidade: 0,
        precoUnitario: 0,
        "Valor Atualizado": 0,
        Instituição: '',
        indexador: 'Indeterminado',
        Emissor: '',
        vencimento: '',
        taxa: ''
    };
    const [newAsset, setNewAsset] = useState<Asset>(initialAssetState);
    const [selectedCategory, setSelectedCategory] = useState('acoes');

    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch Groups first
                const groupsRes = await axios.get('/api/portfolio/groups');
                setPortfolioGroups(groupsRes.data);
                if (groupsRes.data.length > 0 && !selectedPortfolioId) {
                    setSelectedPortfolioId(groupsRes.data[0].id);
                }
            } catch (error) {
                console.error("Error fetching portfolio groups:", error);
            }
        };
        fetchInitialData();
    }, []);

    React.useEffect(() => {
        if (!selectedPortfolioId) return;

        const fetchData = async () => {
            setIsAppLoading(true);
            try {
                const portRes = await axios.get('/api/portfolio', { params: { portfolioId: selectedPortfolioId } });
                setPortfolio(portRes.data);
            } catch (error: any) {
                console.error("Error fetching portfolio:", error);
            } finally {
                setIsAppLoading(false);
            }
        };
        fetchData();
    }, [selectedPortfolioId]);

    const saveAsset = async (asset: Asset, id?: number) => {
        setIsSaving(true);
        try {
            let response;
            if (id) {
                response = await axios.put(`/api/portfolio/asset/${id}`, { ...asset, portfolioId: selectedPortfolioId });
            } else {
                response = await axios.post('/api/portfolio/asset', { ...asset, portfolioId: selectedPortfolioId });
            }

            if (response.data && response.data.dashboard) {
                setPortfolio(response.data.dashboard);
            }
            setIsModalOpen(false);
            setEditingAsset(null);
            setNewAsset(initialAssetState);
        } catch (error) {
            console.error("Failed to save asset", error);
            alert("Erro ao salvar ativo.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBatchImport = async (assets: Asset[]) => {
        setIsSaving(true);
        try {
            const res = await axios.post('/api/portfolio/bulk', { assets, portfolioId: selectedPortfolioId });
            if (res.data && res.data.dashboard) {
                setPortfolio(res.data.dashboard);
            }
            setIsImportModalOpen(false);
            setNotice(`${assets.length} ativos importados com sucesso.`);
            window.setTimeout(() => setNotice(null), 4500);
        } catch (err) {
            console.error("Batch import failed", err);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (category: string, index: number) => {
        if (!window.confirm("Deseja realmente excluir este ativo?")) return;
        const assetToDelete = portfolio.ativos[category]?.[index];
        if (!assetToDelete || !assetToDelete.id) return;

        try {
            const response = await axios.delete(`/api/portfolio/asset/${assetToDelete.id}`, { params: { portfolioId: selectedPortfolioId } });
            if (response.data && response.data.dashboard) {
                setPortfolio(response.data.dashboard);
            }
        } catch (error) {
            console.error("Failed to delete asset", error);
        }
    };

    const handleCreatePortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPortfolioName.trim()) return;
        try {
            const res = await axios.post('/api/portfolio/groups', { name: newPortfolioName });
            setPortfolioGroups([...portfolioGroups, res.data]);
            setSelectedPortfolioId(res.data.id);
            setNewPortfolioName('');
            setIsCreatingPortfolio(false);
        } catch (error) {
            alert('Erro ao criar carteira.');
        }
    };

    const handleDeletePortfolio = async () => {
        if (portfolioGroups.length <= 1) return alert('Você deve ter pelo menos uma carteira.');
        if (!window.confirm('Tem certeza que deseja excluir esta carteira e TODOS os seus ativos?')) return;
        try {
            await axios.delete(`/api/portfolio/groups/${selectedPortfolioId}`);
            const remaining = portfolioGroups.filter(g => g.id !== selectedPortfolioId);
            setPortfolioGroups(remaining);
            setSelectedPortfolioId(remaining[0].id);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao excluir carteira.');
        }
    };

    const handleSaveAsset = (e: React.FormEvent) => {
        e.preventDefault();
        const valueBasedCategories = ['renda_fixa', 'tesouro', 'coe', 'caixa', 'imoveis'];
        const assetToSave = {
            ...newAsset,
            category: selectedCategory,
            precoUnitario: valueBasedCategories.includes(selectedCategory) ? 1 : newAsset.precoUnitario
        };
        if (!['renda_fixa', 'tesouro', 'coe'].includes(selectedCategory)) {
            delete assetToSave.indexador;
        }
        if (editingAsset && editingAsset.asset.id) {
            saveAsset(assetToSave, editingAsset.asset.id);
        } else {
            saveAsset(assetToSave);
        }
    };

    const openAddModal = () => {
        setEditingAsset(null);
        setNewAsset(initialAssetState);
        const category = activeTab === 'geral' || activeTab === 'mercado' ? 'acoes' : activeTab;
        setSelectedCategory(category);

        // Set sensible default ticker for dropdown categories
        const defaultTickers: Record<string, string> = {
            cripto: CRIPTO_OPTIONS[0],
            acoes_internacionais: ACOES_INTL_OPTIONS[0],
            bonds: BONDS_OPTIONS[0],
            etfs_internacional: ETF_INTL_OPTIONS[0],
        };
        if (defaultTickers[category]) {
            setNewAsset({ ...initialAssetState, ticker: defaultTickers[category] });
        }

        setIsModalOpen(true);
    };

    const openEditModal = (category: string, index: number, asset: Asset) => {
        setEditingAsset({ category, index, asset });
        setNewAsset(asset);
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const { chartData, totalValue, caixaTotal, assetCount, assets, categoryTotals } = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        let investedTotal = 0;
        let caixaSum = 0;
        Object.entries(portfolio.ativos).forEach(([cat, catAssets]) => {
            const catSum = (catAssets || []).reduce((acc: number, a: any) => acc + (a['Valor Atualizado'] || a.Quantidade || 0), 0);
            categoryTotals[cat] = catSum;
            if (cat === 'caixa') caixaSum += catSum;
            else investedTotal += catSum;
        });

        const totalPort = investedTotal + caixaSum;
        const sorted = Object.entries(categoryTotals)
            .filter(([cat, value]) => value > 0)
            .map(([name, value]) => ({ name, value, percentage: ((value / (totalPort || 1)) * 100).toFixed(1) }))
            .sort((a, b) => b.value - a.value);

        const uniqueAssetIdentifiers = new Set<string>();
        Object.values(portfolio.ativos).forEach(catAssets => {
            (catAssets || []).forEach(a => {
                if (!a) return;
                const ticker = (a.ticker || '').toUpperCase().trim();
                const name = (a.Nome || a.Produto || a.Emissor || '').toUpperCase().trim();
                if (ticker || name) {
                    uniqueAssetIdentifiers.add(`${ticker}|${name}`);
                }
            });
        });

        const assetCount = uniqueAssetIdentifiers.size;

        return {
            chartData: sorted,
            totalValue: investedTotal,
            caixaTotal: caixaSum,
            assetCount,
            assets: portfolio.ativos,
            categoryTotals
        };
    }, [portfolio]);

    const stats = useMemo(() => {
        const all = Object.entries(portfolio.ativos).flatMap(([category, assets]) => (assets || []).map(a => ({ ...a, category })));
        const top5 = [...all].sort((a, b) => ((b["Valor Atualizado"] || b.Quantidade) || 0) - ((a["Valor Atualizado"] || a.Quantidade) || 0)).slice(0, 5);

        const insts: { [key: string]: number } = {};
        all.forEach(a => { insts[a["Instituição"] || "Outros"] = (insts[a["Instituição"] || "Outros"] || 0) + (a["Valor Atualizado"] || a.Quantidade); });
        const instData = Object.entries(insts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

        const getIndexerDistribution = (assetsList: any[]) => {
            const idxs: { [key: string]: number } = {};
            assetsList.forEach(a => {
                const idx = a["indexador"] || "Indeterminado";
                idxs[idx] = (idxs[idx] || 0) + (a["Valor Atualizado"] || a.Quantidade || 0);
            });
            return Object.entries(idxs).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        };

        const indexerData = getIndexerDistribution(all.filter(a => ['renda_fixa', 'tesouro', 'coe'].includes(a.category)));

        const rf = categoryTotals['renda_fixa'] || 0;
        const rfEmissores: { [key: string]: number } = {};
        (portfolio.ativos['renda_fixa'] || []).forEach(a => {
            const emissor = a.Emissor || a.Instituição || "Outros";
            rfEmissores[emissor] = (rfEmissores[emissor] || 0) + (a["Valor Atualizado"] || a.Quantidade);
        });
        const rfEmissoresData = Object.entries(rfEmissores).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        const fgcWarnings = rfEmissoresData.filter(e => e.value > 250000);

        const totalWithCaixa = totalValue + caixaTotal;
        const concentrationRisk = all.filter(a => ((a["Valor Atualizado"] || 0) / (totalWithCaixa || 1)) > 0.15);

        return {
            top5,
            instData,
            indexerData,
            rendaFixaTotal: rf,
            rfEmissoresData,
            fgcWarnings,
            concentrationRisk
        };
    }, [portfolio, totalValue, caixaTotal, categoryTotals]);

    const getLabel = (id: string) => TABS.find(t => t.id === id)?.label || 'Ativos';
    const getTabData = () => {
        // Categories that should show indexer distribution instead of ticker distribution
        if (['renda_fixa', 'tesouro', 'coe'].includes(activeTab)) {
            const assets = portfolio.ativos[activeTab] || [];
            const idxs: { [key: string]: number } = {};
            assets.forEach(a => {
                const idx = a["indexador"] || "Indeterminado";
                idxs[idx] = (idxs[idx] || 0) + (a["Valor Atualizado"] || a.Quantidade || 0);
            });
            return Object.entries(idxs).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        }
        return (portfolio.ativos[activeTab] || []).map(a => ({ name: a.ticker, value: a['Valor Atualizado'] || a.Quantidade }));
    };
    return (
        <div className="dashboard-shell" style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            <style>{`
                .table-row-hover:hover { background: rgba(255, 255, 255, 0.05) !important; transform: translateY(-2px); }
                .tab-btn-pill { background: transparent; border: none; color: var(--text-muted); padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; white-space: nowrap; }
                .tab-btn-pill.active { background: rgba(56, 189, 248, 0.15); color: var(--accent-blue); }
                .tab-btn-pill:hover:not(.active) { background: rgba(255, 255, 255, 0.05); color: var(--text-main); }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
                .float-animation { animation: float 3s ease-in-out infinite; }
                .sidebar-collapsible { width: 280px; min-width: 280px; overflow: hidden; transition: width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s; }
                .sidebar-collapsible.closed { width: 0 !important; min-width: 0 !important; opacity: 0; padding: 0; }
            `}</style>

            {/* Side Navigation */}
            <Sidebar
                isOpen={isSidebarOpen}
                currentView={sidebarView}
                onViewChange={setSidebarView}
                onHowItWorks={() => setIsHowItWorksOpen(true)}
            />

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
                {/* Dynamic Header */}
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 3rem', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)', zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        {/* Hamburger / sidebar toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(o => !o)}
                            title={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                            style={{
                                background: isSidebarOpen ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${isSidebarOpen ? 'rgba(56,189,248,0.4)' : 'var(--glass-border)'}`,
                                borderRadius: '12px',
                                color: isSidebarOpen ? 'var(--accent-blue)' : 'var(--text-muted)',
                                width: '42px', height: '42px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', flexShrink: 0,
                                transition: 'all 0.25s'
                            }}
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Logo / brand (always visible) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ background: 'rgba(56,189,248,0.1)', padding: '0.55rem', borderRadius: '10px', display: 'flex' }}>
                                <Briefcase size={26} color="var(--accent-blue)" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.55rem', fontWeight: 900, margin: 0, color: 'var(--accent-blue)', letterSpacing: '-0.5px' }}>Minha Carteira</h1>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Investimentos salvos neste computador</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {sidebarView === 'carteira' && (
                            <>
                                <button onClick={() => setIsImportModalOpen(true)} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--accent-blue)', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                    <Upload size={18} /> Importar B3
                                </button>
                                <button onClick={openAddModal} style={{ background: 'var(--accent-blue)', border: 'none', color: 'white', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)' }}>
                                    <Plus size={18} /> Adicionar Ativo
                                </button>
                            </>
                        )}

                        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--glass-border)', padding: '0.8rem 1.5rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BadgeDollarSign size={14} /> Patrimônio Consolidado
                            </span>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '1.6rem', fontWeight: 900 }}>R$ {(totalValue + caixaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </header>
                {notice && <div className="dashboard-notice"><CheckCircle2 size={18} /> {notice}</div>}

                {/* Main Content Scrollable Area */}
                <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3rem', scrollbarWidth: 'none' }}>
                    {isAppLoading ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '70vh',
                            gap: '2rem'
                        }}>
                            <div className="loading-bg-pulse" style={{
                                width: '120px',
                                height: '120px',
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #3b82f6 100%)',
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(56, 189, 248, 0.2)'
                            }}>
                                <TrendingUp size={60} color="white" />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h2 className="text-gradient-premium" style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                                    Intelligent Portfolio
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}> Sincronizando sua inteligência financeira...</p>
                                <div style={{
                                    width: '200px',
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px',
                                    margin: '1.5rem auto 0',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '60%',
                                        height: '100%',
                                        background: 'var(--accent-primary)',
                                        borderRadius: '10px'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    ) : sidebarView === 'mercado' ? (
                        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                            <MercadoHoje userAssets={portfolio.ativos} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1800px', margin: '0 auto', width: '100%' }}>
                            {/* Inner Tab Navigation for Carteira */}
                            <div className="portfolio-tabs-wrap" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <nav className="portfolio-tabs" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(4px)', padding: '0.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                    <button onClick={() => setActiveTab('geral')} className={`tab-btn-pill ${activeTab === 'geral' ? 'active' : ''}`}><LayoutGrid size={16} /> OVERVIEW</button>
                                    {TABS.map(t => (
                                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn-pill ${activeTab === t.id ? 'active' : ''}`}><t.icon size={16} /> {t.label.toUpperCase()}</button>
                                    ))}
                                </nav>
                            </div>

                            {activeTab === 'geral' ? (
                                <>
                                    {totalValue === 0 && caixaTotal === 0 ? (
                                        <EmptyPortfolio onAddAsset={openAddModal} onImport={() => setIsImportModalOpen(true)} />
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <PortfolioSummary caixaTotal={caixaTotal} totalValue={totalValue} assetCount={assetCount} vertical={false} />
                                            </div>

                                            {stats.concentrationRisk.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 520px)', gap: '1.5rem' }}>
                                                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                        <AlertTriangle size={32} color="var(--accent-amber)" />
                                                        <div>
                                                            <span style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Alerta de Concentração</span>
                                                            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                                {stats.concentrationRisk.length} ativos superam 15% da carteira.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                                                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                                                    <AssetAllocationChart title="Alocação por Classe" icon={<PieChartIcon size={24} color="var(--accent-blue)" />} data={chartData} total={totalValue + caixaTotal} showLegend={true} colors={COLORS} formatLabel={(n: string) => n.replace(/_/g, ' ').toUpperCase()} height="400px" innerRadius={80} outerRadius={110} />
                                                </div>
                                                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                                                    <AssetAllocationChart title="Por instituição" icon={<Building2 size={24} color="#6366f1" />} data={stats.instData} total={totalValue + caixaTotal} showLegend={true} colors={[...COLORS].slice(2).concat(COLORS.slice(0, 2))} height="400px" innerRadius={80} outerRadius={110} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                                <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px' }}>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px', borderRadius: '10px' }}>
                                                            <ArrowUpRight size={22} color="var(--accent-amber)" />
                                                        </div>
                                                        Maiores Alocações
                                                    </h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                        {stats.top5.map((asset, idx) => (
                                                            <div key={idx} className="hover-scale" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)', cursor: 'default' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                                                    <div style={{
                                                                        width: '44px', height: '44px', borderRadius: '14px',
                                                                        background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}20 0%, ${COLORS[idx % COLORS.length]}05 100%)`,
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontWeight: 900, color: COLORS[idx % COLORS.length],
                                                                        border: `1px solid ${COLORS[idx % COLORS.length]}30`,
                                                                        fontSize: '1.1rem'
                                                                    }}>
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div>
                                                                        <span style={{ fontWeight: 900, fontSize: '1.15rem', display: 'block', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>{asset.ticker}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{asset.Instituição || asset.category.replace('_', ' ')}</span>
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <span style={{ fontWeight: 900, fontSize: '1.1rem', display: 'block', color: 'var(--text-main)' }}>R$ {(asset["Valor Atualizado"] || 0).toLocaleString('pt-BR')}</span>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                                            <div style={{ width: `${((asset["Valor Atualizado"] || 0) / (totalValue + caixaTotal || 1)) * 100}%`, height: '100%', background: COLORS[idx % COLORS.length] }}></div>
                                                                        </div>
                                                                        <span style={{ color: COLORS[idx % COLORS.length], fontWeight: 800, fontSize: '0.8rem' }}>{(((asset["Valor Atualizado"] || 0) / (totalValue + caixaTotal || 1)) * 100).toFixed(1)}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(30, 41, 59, 0.4)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                                        <div><h2 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, color: 'var(--accent-blue)', letterSpacing: '-1px' }}>{getLabel(activeTab)}</h2><p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Análise detalhada de seus ativos em {getLabel(activeTab)}</p></div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}><TrendingUp size={14} color="var(--accent-emerald)" /> Subtotal</p>
                                            <p style={{ fontSize: '2.8rem', fontWeight: 950, color: 'var(--accent-blue)' }}>R$ {(portfolio.totais[activeTab] || 0).toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'renda_fixa' ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                                        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                                            <AssetAllocationChart title={activeTab === 'renda_fixa' ? "Alocação por Indexador" : `Distribuição de ${getLabel(activeTab)}`} data={getTabData()} total={portfolio.totais[activeTab] || 0} showLegend={true} colors={COLORS} height="400px" innerRadius={80} outerRadius={120} />
                                        </div>
                                        {activeTab === 'renda_fixa' && (
                                            <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={24} color="var(--accent-amber)" /> Alocação por Emissor (Risco FGC)</h3>
                                                <AssetAllocationChart title="" data={stats.rfEmissoresData} total={stats.rendaFixaTotal || 1} showLegend={true} colors={[...COLORS].reverse()} height="350px" innerRadius={80} outerRadius={110} />
                                            </div>
                                        )}
                                    </div>

                                    <PortfolioTable assets={portfolio.ativos[activeTab] || []} activeTab={activeTab} onEdit={openEditModal} onDelete={handleDelete} onAddAsset={openAddModal} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* Float Elements & Modals */}
            < button onClick={() => setShowAIChat(!showAIChat)} style={{ position: 'fixed', bottom: '2.5rem', right: '3rem', width: '64px', height: '64px', borderRadius: '20px', background: 'var(--accent-blue)', border: 'none', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 1000, transition: 'all 0.3s', transform: showAIChat ? 'rotate(45deg)' : 'none', boxShadow: '0 8px 30px rgba(56, 189, 248, 0.4)' }}> {showAIChat ? <X size={28} /> : <Sparkles size={28} />}</button >

            <div style={{ position: 'fixed', top: '2rem', right: showAIChat ? '3rem' : '-500px', bottom: '2.5rem', width: '450px', background: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)', zIndex: 1001, display: 'flex', flexDirection: 'column', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', opacity: showAIChat ? 1 : 0, overflow: 'hidden' }}>
                <div style={{ padding: '2rem', background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.8rem', borderRadius: '14px' }}><Sparkles size={24} color="var(--accent-blue)" /></div><div><span style={{ fontWeight: 900, fontSize: '1.2rem', display: 'block', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Consultor IA</span><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cérebro Quantitativo Ativo</span></div></div>
                    <button onClick={() => setShowAIChat(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}><X size={24} /></button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}><AIChat /></div>
            </div>

            {/* Existing Modals */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? "Editar Ativo" : "Novo Ativo"}>
                <form onSubmit={handleSaveAsset}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Categoria - Sempre visível e no topo */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>CATEGORIA</label>
                            <select
                                value={selectedCategory}
                                onChange={e => {
                                    const cat = e.target.value;
                                    setSelectedCategory(cat);
                                    // Reset placeholder fields based on category
                                    if (cat === 'cripto') setNewAsset({ ...newAsset, ticker: CRIPTO_OPTIONS[0] });
                                    else if (['renda_fixa', 'tesouro', 'coe'].includes(cat)) setNewAsset({ ...newAsset, indexador: 'CDI' });
                                }}
                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                            >
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>

                        {/* Campos Dinâmicos conforme Categoria */}
                        <div className="asset-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                            {/* TICKER / NOME */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {selectedCategory === 'cripto' ? 'MOEDA'
                                        : selectedCategory === 'imoveis' ? 'NOME DO IMÓVEL'
                                            : selectedCategory === 'fundos' ? 'NOME DO FUNDO'
                                                : ['renda_fixa', 'tesouro', 'coe'].includes(selectedCategory) ? 'NOME DO TÍTULO'
                                                    : 'TICKER'}
                                </label>

                                {/* Categories with dropdown + optional custom input */}
                                {(['cripto', 'acoes_internacionais', 'bonds', 'etfs_internacional'] as string[]).includes(selectedCategory) ? (() => {
                                    const optMap: Record<string, string[]> = {
                                        cripto: CRIPTO_OPTIONS,
                                        acoes_internacionais: ACOES_INTL_OPTIONS,
                                        bonds: BONDS_OPTIONS,
                                        etfs_internacional: ETF_INTL_OPTIONS,
                                    };
                                    const opts = optMap[selectedCategory] || [];
                                    const lastOpt = opts[opts.length - 1]; // 'Outra' or 'Outro'
                                    const isCustom = !opts.includes(newAsset.ticker) || newAsset.ticker === lastOpt;
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <select
                                                value={isCustom ? lastOpt : newAsset.ticker}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setNewAsset({ ...newAsset, ticker: val === lastOpt ? lastOpt : val });
                                                }}
                                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                            >
                                                {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            {isCustom && (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        required
                                                        autoFocus
                                                        placeholder={selectedCategory === 'cripto' ? 'Digite o Ticker (Ex: DOGE)' : 'Digite o Ticker (Ex: AAPL)'}
                                                        value={newAsset.ticker === lastOpt ? '' : newAsset.ticker}
                                                        onChange={e => setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase().trim() })}
                                                        style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewAsset({ ...newAsset, ticker: opts[0] })}
                                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                                    >VOLTAR</button>
                                                </div>
                                            )}
                                            {['acoes_internacionais', 'bonds', 'etfs_internacional'].includes(selectedCategory) && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Globe size={10} /> Preço em USD, convertido para BRL automaticamente
                                                </span>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    <input
                                        required
                                        placeholder={selectedCategory === 'acoes' ? 'Ex: ITUB4' : selectedCategory === 'imoveis' ? 'Ex: Apartamento Centro' : selectedCategory === 'fundos' ? 'Ex: Fundo Multimercado' : 'Ex: CDB Banco X'}
                                        value={newAsset.ticker}
                                        onChange={e => setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase() })}
                                        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                    />
                                )}
                            </div>

                            {/* INSTITUIÇÃO / EMISSOR */}
                            {['renda_fixa', 'tesouro', 'coe', 'caixa', 'acoes', 'fiis'].includes(selectedCategory) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>INSTITUIÇÃO</label>
                                    <select
                                        value={newAsset.Instituição}
                                        onChange={e => setNewAsset({ ...newAsset, Instituição: e.target.value })}
                                        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                    >
                                        <option value="">Selecione...</option>
                                        {B3_INSTITUTIONS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* QUANTIDADE / VALOR INVESTIDO */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {['renda_fixa', 'tesouro', 'coe', 'caixa', 'imoveis'].includes(selectedCategory) ? 'VALOR ATUAL' : 'QUANTIDADE'}
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    min="0.00000001"
                                    value={newAsset.Quantidade}
                                    onChange={e => setNewAsset({ ...newAsset, Quantidade: Number(e.target.value) })}
                                    style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>

                            {/* PREÇO MÉDIO / TAXA */}
                            {['acoes', 'fiis', 'fundos', 'etfs', 'etfs_internacional'].includes(selectedCategory) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>PREÇO MÉDIO (OPCIONAL)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newAsset.precoUnitario}
                                        onChange={e => setNewAsset({ ...newAsset, precoUnitario: Number(e.target.value) })}
                                        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                    />
                                </div>
                            )}

                            {['renda_fixa', 'tesouro', 'coe'].includes(selectedCategory) && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>INDEXADOR</label>
                                        <select
                                            value={newAsset.indexador}
                                            onChange={e => setNewAsset({ ...newAsset, indexador: e.target.value })}
                                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                        >
                                            <option value="CDI">CDI</option>
                                            <option value="IPCA">IPCA</option>
                                            <option value="SELIC">SELIC</option>
                                            <option value="PRE">PREFIXADO</option>
                                            <option value="OUTRO">OUTRO</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>TAXA (Ex: 110 ou 6.5)</label>
                                        <input
                                            placeholder="Ex: 110% do CDI"
                                            value={newAsset.taxa}
                                            onChange={e => setNewAsset({ ...newAsset, taxa: e.target.value })}
                                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>VENCIMENTO</label>
                                        <input
                                            type="date"
                                            value={newAsset.vencimento}
                                            onChange={e => setNewAsset({ ...newAsset, vencimento: e.target.value })}
                                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={isSaving} style={{ width: '100%', background: 'var(--accent-blue)', border: 'none', color: 'white', padding: '1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 25px rgba(56, 189, 248, 0.3)' }}>
                        {isSaving ? 'Salvando...' : editingAsset ? 'Atualizar Ativo' : 'Adicionar à Carteira'}
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Planilha B3">
                <B3Importer onImport={handleBatchImport} onClose={() => setIsImportModalOpen(false)} />
            </Modal>

            <Modal isOpen={isCreatingPortfolio} onClose={() => setIsCreatingPortfolio(false)} title="Nova Carteira">
                <form onSubmit={handleCreatePortfolio}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>NOME DA CARTEIRA</label>
                        <input
                            required
                            autoFocus
                            placeholder="Ex: Aposentadoria, Dividendos..."
                            value={newPortfolioName}
                            onChange={e => setNewPortfolioName(e.target.value)}
                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', outline: 'none' }}
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', background: 'var(--accent-blue)', border: 'none', color: 'white', padding: '1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                        Criar Carteira
                    </button>
                </form>
            </Modal>

            <HowItWorksModal
                isOpen={isHowItWorksOpen}
                onClose={() => setIsHowItWorksOpen(false)}
            />
        </div >
    );
};

export default Dashboard;
