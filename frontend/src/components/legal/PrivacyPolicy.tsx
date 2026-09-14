import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
            <h1>Política de Privacidade (LGPD)</h1>
            <p><strong>Última atualização:</strong> 14 de Março de 2026 (v1.0.0)</p>

            <h2>1. Coleta de Dados</h2>
            <p>Coletamos seu email para autenticação e dados de sua carteira (ativos e quantidades) para prover as análises solicitadas.</p>

            <h2>2. Finalidade</h2>
            <p>Os dados são processados exclusivamente para a visualização e diagnóstico do seu portfolio de investimentos.</p>

            <h2>3. Seus Direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul>
                <li>Confirmar a existência do tratamento de seus dados.</li>
                <li>Acessar seus dados.</li>
                <li>Corrigir dados incompletos ou inexatos.</li>
                <li>Solicitar a exclusão de seus dados.</li>
            </ul>
        </div>
    );
};

export default PrivacyPolicy;
