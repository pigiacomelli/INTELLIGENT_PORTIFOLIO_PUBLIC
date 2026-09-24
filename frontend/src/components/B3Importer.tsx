import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertCircle, CheckCircle2, FileSpreadsheet, RefreshCw, Upload, X } from 'lucide-react';
import { CATEGORIES, type Asset } from '../utils/dashboardUtils';
import { parseB3Workbook, type B3ParseResult } from '../utils/b3Parser';

interface B3ImporterProps {
    onImport: (assets: Asset[]) => Promise<void> | void;
    onClose: () => void;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

export const B3Importer: React.FC<B3ImporterProps> = ({ onImport, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<B3ParseResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const chooseFile = (selected?: File) => {
        if (!selected) return;
        if (!/\.(xlsx|xls)$/i.test(selected.name)) {
            setError('Selecione um arquivo Excel (.xlsx ou .xls).');
            return;
        }
        setFile(selected);
        setResult(null);
        setError(null);
    };

    const parseFile = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            setResult(parseB3Workbook(workbook));
        } catch (parseError) {
            console.error('Error parsing Excel:', parseError);
            setError('Não foi possível ler o arquivo. Baixe novamente a posição consolidada na Área do Investidor B3.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmImport = async () => {
        if (!result?.assets.length) return;
        setIsImporting(true);
        setError(null);
        try {
            await onImport(result.assets);
            onClose();
        } catch (importError) {
            console.error('Error importing assets:', importError);
            setError('A planilha foi lida, mas não foi possível salvar os ativos. Tente novamente.');
        } finally {
            setIsImporting(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    if (!result) {
        return (
            <div className="importer-stack">
                <div
                    className={`import-dropzone${isDragging ? ' is-dragging' : ''}`}
                    onDragOver={event => { event.preventDefault(); setIsDragging(true); }}
                    onDragLeave={event => { event.preventDefault(); setIsDragging(false); }}
                    onDrop={event => {
                        event.preventDefault();
                        setIsDragging(false);
                        chooseFile(event.dataTransfer.files?.[0]);
                    }}
                    onClick={() => document.getElementById('b3-upload')?.click()}
                >
                    <div className="import-dropzone__icon"><FileSpreadsheet size={34} /></div>
                    <h3>Importar posição da B3</h3>
                    <p>Use o arquivo “Posição” em Excel. A leitura acontece no seu navegador antes da confirmação.</p>
                    <input
                        id="b3-upload"
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={event => chooseFile(event.target.files?.[0])}
                    />
                    {file && (
                        <div className="import-file-pill" onClick={event => event.stopPropagation()}>
                            <span>{file.name}</span>
                            <button type="button" onClick={reset} aria-label="Remover arquivo"><X size={16} /></button>
                        </div>
                    )}
                </div>

                {error && <div className="inline-alert is-error"><AlertCircle size={20} /><span>{error}</span></div>}

                <button className="btn-primary importer-primary" onClick={parseFile} disabled={!file || isLoading}>
                    {isLoading ? <><RefreshCw size={20} className="animate-spin" /> Lendo planilha...</> : <><Upload size={20} /> Analisar arquivo</>}
                </button>
                <p className="import-helper">Compatível com abas como Ações, ETF, Fundos, Renda Fixa, Tesouro Direto e Empréstimos. Posições como doador entram no patrimônio.</p>
            </div>
        );
    }

    const total = result.assets.reduce((sum, asset) => sum + (asset['Valor Atualizado'] || 0), 0);
    const empty = result.assets.length === 0;

    return (
        <div className="importer-stack">
            <div className={`import-summary${empty ? ' is-empty' : ''}`}>
                {empty ? <AlertCircle size={26} /> : <CheckCircle2 size={26} />}
                <div>
                    <strong>{empty ? 'Arquivo reconhecido, sem posições' : `${result.assets.length} ativos encontrados`}</strong>
                    <span>{empty ? 'As abas estão no formato esperado, mas contêm apenas os cabeçalhos.' : `${formatCurrency(total)} em posições consolidadas`}</span>
                </div>
            </div>

            <div className="import-sheet-list" aria-label="Abas analisadas">
                {result.sheets.map(sheet => (
                    <div key={sheet.name} className="import-sheet-row">
                        <span>{sheet.name}</span>
                        <small>{sheet.note || `${sheet.imported} importado${sheet.imported === 1 ? '' : 's'}`}</small>
                    </div>
                ))}
            </div>

            {result.warnings.map(warning => (
                <div key={warning} className="inline-alert is-warning"><AlertCircle size={18} /><span>{warning}</span></div>
            ))}
            {error && <div className="inline-alert is-error"><AlertCircle size={18} /><span>{error}</span></div>}

            {!empty && (
                <div className="import-preview">
                    <table>
                        <thead><tr><th>Ativo</th><th>Classe</th><th>Quantidade</th><th>Valor</th></tr></thead>
                        <tbody>
                            {result.assets.map(asset => (
                                <tr key={`${asset.category}-${asset.ticker}`}>
                                    <td><strong>{asset.ticker}</strong></td>
                                    <td>{CATEGORIES.find(category => category.id === asset.category)?.label || asset.category}</td>
                                    <td>{asset.Quantidade.toLocaleString('pt-BR')}</td>
                                    <td>{formatCurrency(asset['Valor Atualizado'] || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="import-actions">
                <button type="button" className="btn-secondary" onClick={reset}>Escolher outro arquivo</button>
                {!empty && (
                    <button type="button" className="btn-primary" onClick={confirmImport} disabled={isImporting}>
                        {isImporting ? <><RefreshCw size={18} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={18} /> Importar {result.assets.length} ativos</>}
                    </button>
                )}
            </div>
        </div>
    );
};
