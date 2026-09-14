import React from 'react';

const TermsOfUse: React.FC = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
            <h1>Termos de Uso - Intelligent Portfolio</h1>
            <p><strong>Última atualização:</strong> 14 de Março de 2026 (v1.0.0)</p>

            <h2>1. Natureza Informativa e Educacional</h2>
            <p>O Intelligent Portfolio é uma ferramenta de auxílio à gestão de investimentos com caráter exclusivamente informativo e educacional.</p>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>IMPORTANTE: Não somos uma corretora, casa de análise ou consultoria de investimentos. Nenhuma informação apresentada constitui recomendação de compra ou venda de ativos.</p>

            <h2>2. Isenção de Responsabilidade</h2>
            <p>Os dados de mercado são obtidos de provedores terceiros (como Yahoo Finance e Brapi). Não garantimos a precisão absoluta ou em tempo real desses dados.</p>

            <h2>3. Propriedade Intelectual</h2>
            <p>Todo o código, design e algoritmos de IA são de propriedade exclusiva do Intelligent Portfolio.</p>
        </div>
    );
};

export default TermsOfUse;
