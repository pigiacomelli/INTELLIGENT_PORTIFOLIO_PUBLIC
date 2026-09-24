import * as XLSX from 'xlsx';
import type { Asset } from './dashboardUtils';

export interface B3SheetSummary {
    name: string;
    rows: number;
    imported: number;
    ignored: number;
    recognized: boolean;
    note?: string;
}

export interface B3ParseResult {
    assets: Asset[];
    sheets: B3SheetSummary[];
    warnings: string[];
}

const HEADER_ALIASES = [
    'Produto', 'Código de Negociação', 'Codigo de Negociacao', 'Ativo', 'Ticker', 'Papel',
    'Código do Ativo', 'Codigo do Ativo', 'Título', 'Titulo', 'Quantidade', 'Qtde', 'Qtd',
    'Valor Atualizado', 'Valor Total', 'Valor Bruto', 'Financeiro', 'Saldo Bruto', 'Total'
];

const normalizeText = (value: unknown) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizedHeaders = new Set(HEADER_ALIASES.map(normalizeText));

const findValue = (row: Record<string, unknown>, possibleNames: string[]) => {
    const rowKeys = Object.keys(row);
    for (const name of possibleNames) {
        const target = normalizeText(name);
        const match = rowKeys.find(key => normalizeText(key) === target);
        if (match !== undefined) return row[match];
    }
    return null;
};

const cleanNumber = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const raw = String(value ?? '').replace(/R\$/gi, '').replace(/\s/g, '');
    if (!raw) return 0;
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
    const parsed = Number(normalized.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
};

const findHeaderRow = (sheet: XLSX.WorkSheet) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: false, raw: true });
    let bestRow = 0;
    let bestScore = 0;
    rows.slice(0, 12).forEach((row, index) => {
        const score = (row || []).reduce<number>((total, cell) => total + (normalizedHeaders.has(normalizeText(cell)) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestRow = index;
        }
    });
    return { headerRow: bestRow, recognized: bestScore > 0 };
};

const categoryFromSheet = (sheetName: string) => {
    const sheet = normalizeText(sheetName);
    if (sheet.includes('emprestimo')) return 'emprestimos';
    if (sheet.includes('fundo imobiliario') || sheet === 'fii' || sheet === 'fiis') return 'fiis';
    if (sheet.includes('imovel') || sheet.includes('imovei') || sheet.includes('real estate')) return 'imoveis';
    if (sheet.includes('tesouro')) return 'tesouro';
    if (sheet.includes('renda fixa')) return 'renda_fixa';
    if (sheet === 'coe' || sheet.includes('operacoes estruturadas')) return 'coe';
    if (sheet.includes('fundo')) return 'fundos';
    if (sheet.includes('etf')) return 'etfs';
    if (sheet.includes('bdr')) return 'etfs_internacional';
    if (sheet.includes('cripto')) return 'cripto';
    if (sheet.includes('acao') || sheet.includes('acoes')) return 'acoes';
    return null;
};

const rowToAsset = (row: Record<string, unknown>, sheetName: string): Asset | null => {
    const rawProduct = findValue(row, [
        'Código de Negociação', 'Codigo de Negociacao', 'Produto', 'Ativo', 'Ticker', 'Papel',
        'Código do Ativo', 'Codigo do Ativo', 'Título', 'Titulo', 'Nome do Imóvel', 'Nome do Imovel'
    ]);
    if (!String(rawProduct ?? '').trim()) return null;

    let ticker = String(rawProduct).split(' - ')[0].replace(/[^\x20-\x7E\u00C0-\u024F]/g, '').trim();
    const rawCode = findValue(row, ['Código', 'Codigo', 'Protocolo']);
    const indexador = String(findValue(row, ['Indexador', 'Index', 'Remuneracao', 'Rentabilidade', 'Tipo de Rentabilidade']) || '').trim() || 'Indeterminado';
    const categoryText = normalizeText(findValue(row, ['Tipo de Ativo', 'Tipo', 'Categoria', 'Classe', 'Produto']));
    const sheetText = normalizeText(sheetName);
    const productText = normalizeText(rawProduct);
    const tickerUpper = ticker.toUpperCase();
    const sheetCategory = categoryFromSheet(sheetName);

    const fixedIncomeKeywords = ['CDB', 'LCA', 'LCI', 'LC', 'LIG', 'CRI', 'CRA', 'DEBENTURE', 'DEBÊNTURE'];
    const canInferCategory = !sheetCategory;
    const isFixedIncome = sheetCategory === 'renda_fixa' || (canInferCategory && (
        fixedIncomeKeywords.some(keyword => tickerUpper.startsWith(keyword))
        || ['cdb', 'lca', 'lci', 'renda fixa'].some(keyword => categoryText.includes(keyword))
    ));
    const isTreasury = sheetCategory === 'tesouro' || (canInferCategory && (tickerUpper.includes('TESOURO') || categoryText.includes('tesouro') || sheetText.includes('tesouro')));

    if (isFixedIncome) {
        const issuer = String(findValue(row, ['Empresa', 'Emissor', 'Administrador', 'Instituicao', 'Agente Custodiante']) || '').trim();
        const indexPart = indexador !== 'Indeterminado' ? ` ${indexador}` : '';
        const codePart = rawCode ? ` (${rawCode})` : '';
        const issuerPart = issuer && !codePart ? ` [${issuer.substring(0, 20)}]` : '';
        ticker = `${ticker}${indexPart}${codePart || issuerPart}`;
    } else if (isTreasury) {
        ticker = String(rawProduct).trim();
    }

    const totalValue = cleanNumber(findValue(row, [
        'Valor Atualizado CURVA', 'Valor Atualizado MTM', 'Valor Atualizado FECHAMENTO', 'Valor Atualizado',
        'Valor Total', 'Valor Bruto', 'Valor Liquido', 'Valor Líquido', 'Financeiro', 'Saldo Bruto',
        'Saldo', 'Valor', 'Total', 'Valor de Mercado'
    ]));
    const quantity = cleanNumber(findValue(row, [
        'Quantidade', 'Quantidade Disponivel', 'Quantidade Disponível', 'Qtde', 'Qtd', 'Posicao', 'Posição', 'Cotas'
    ]));
    const unitPrice = cleanNumber(findValue(row, [
        'Preço de Fechamento', 'Preco de Fechamento', 'Preço Unitário', 'Preco Unitario', 'Preco', 'Preço',
        'Preco de Custo', 'Cotacao', 'Cotação', 'Valor Unitário', 'Valor Unitario', 'Valor da Cota'
    ]));

    let category = sheetCategory === 'emprestimos'
        ? (productText.includes('fundo de indice') || productText.includes('etf') ? 'etfs'
            : productText.includes('fundo imobiliario') || productText.includes('fii') ? 'fiis'
                : 'acoes')
        : sheetCategory || 'acoes';
    if (isTreasury) category = 'tesouro';
    else if (isFixedIncome) category = 'renda_fixa';
    else if (sheetCategory === 'fundos' && (categoryText.includes('fundo imobiliario') || /^[A-Z]{4}11$/.test(tickerUpper))) category = 'fiis';
    else if (!sheetCategory && (categoryText.includes('cripto') || categoryText.includes('crypto'))) category = 'cripto';
    else if (!sheetCategory && (categoryText.includes('fundo imobiliario') || /^[A-Z]{4}11$/.test(tickerUpper))) category = 'fiis';
    else if (!sheetCategory && categoryText.includes('fundo')) category = 'fundos';
    else if (!sheetCategory && (categoryText.includes('imovel') || categoryText.includes('imovei'))) category = 'imoveis';
    else if (!sheetCategory && (categoryText.startsWith('coe') || categoryText.includes('certificado de operacoes estruturadas'))) category = 'coe';

    const valueBased = ['renda_fixa', 'tesouro', 'coe', 'caixa', 'imoveis'].includes(category);
    let finalQuantity = quantity;
    let finalPrice = unitPrice;
    if (totalValue > 0 && valueBased) {
        finalQuantity = totalValue;
        finalPrice = 1;
    } else if (valueBased && quantity > 0) {
        finalQuantity = quantity;
        finalPrice = 1;
    } else if (totalValue > 0 && quantity > 0) {
        finalPrice = totalValue / quantity;
    } else if (totalValue > 0) {
        finalQuantity = totalValue;
        finalPrice = 1;
    }

    let finalTicker = ticker.toUpperCase().trim();
    const noSuffixCategories = ['cripto', 'etfs_internacional', 'renda_fixa', 'tesouro', 'coe', 'fundos', 'imoveis'];
    if (!noSuffixCategories.includes(category) && !finalTicker.includes('.') && !finalTicker.includes(' ')) {
        if (finalTicker.length >= 4 && finalTicker.length <= 6) finalTicker += '.SA';
    }
    if (!finalTicker || finalQuantity <= 0) return null;

    return {
        ticker: finalTicker,
        Quantidade: finalQuantity,
        precoUnitario: finalPrice,
        'Valor Atualizado': totalValue > 0 ? totalValue : finalQuantity * finalPrice,
        'Instituição': String(findValue(row, ['Agente Custodiante', 'Corretora', 'Instituicao', 'Instituição', 'Custodiante']) || '').trim(),
        Emissor: String(findValue(row, ['Empresa', 'Emissor', 'Administrador', 'Instituicao', 'Instituição']) || '').trim(),
        indexador: ['renda_fixa', 'tesouro', 'coe'].includes(category) ? indexador : undefined,
        category,
        source: 'b3'
    };
};

export const parseB3Workbook = (workbook: XLSX.WorkBook): B3ParseResult => {
    const regularAssets: Asset[] = [];
    const loanedAssets: Asset[] = [];
    const sheets: B3SheetSummary[] = [];
    const warnings: string[] = [];
    let ignoredBorrowerPositions = 0;

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const sheetCategory = categoryFromSheet(sheetName);
        const { headerRow, recognized } = findHeaderRow(sheet);
        const rows = recognized
            ? XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: headerRow, defval: null, raw: true })
            : [];

        const targetAssets = sheetCategory === 'emprestimos' ? loanedAssets : regularAssets;
        const before = targetAssets.length;
        rows.forEach(row => {
            if (sheetCategory === 'emprestimos') {
                const nature = normalizeText(findValue(row, ['Natureza', 'Posição', 'Posicao']));
                if (!nature.startsWith('doador')) {
                    if (String(findValue(row, ['Produto', 'Ativo', 'Ticker']) ?? '').trim()) ignoredBorrowerPositions += 1;
                    return;
                }
            }
            const asset = rowToAsset(row, sheetName);
            if (asset) targetAssets.push(asset);
        });
        const imported = targetAssets.length - before;
        sheets.push({
            name: sheetName,
            rows: rows.length,
            imported,
            ignored: Math.max(0, rows.length - imported),
            recognized: recognized || sheetCategory !== null,
            note: sheetCategory === 'emprestimos'
                ? `${imported} ${imported === 1 ? 'posição' : 'posições'} como doador ${imported === 1 ? 'incluída' : 'incluídas'}`
                : rows.length === 0 && (recognized || sheetCategory !== null) ? 'Aba válida, sem posições.' : undefined
        });
    }

    const regularPositionKeys = new Set(regularAssets.map(asset => (
        `${asset.category}|${asset.ticker}|${normalizeText(asset['Instituição'])}`
    )));
    const uniqueLoanedAssets = loanedAssets.filter(asset => !regularPositionKeys.has(
        `${asset.category}|${asset.ticker}|${normalizeText(asset['Instituição'])}`
    ));
    const duplicateLoans = loanedAssets.length - uniqueLoanedAssets.length;
    const parsedAssets = [...regularAssets, ...uniqueLoanedAssets];

    const consolidated = new Map<string, Asset>();
    parsedAssets.forEach(asset => {
        const key = `${asset.category}|${asset.ticker}`;
        const existing = consolidated.get(key);
        if (!existing) {
            consolidated.set(key, asset);
            return;
        }
        const quantity = existing.Quantidade + asset.Quantidade;
        const totalValue = (existing['Valor Atualizado'] || 0) + (asset['Valor Atualizado'] || 0);
        consolidated.set(key, { ...existing, Quantidade: quantity, 'Valor Atualizado': totalValue, precoUnitario: quantity > 0 ? totalValue / quantity : existing.precoUnitario });
    });

    if (workbook.SheetNames.length === 0) warnings.push('A planilha não contém abas.');
    if (parsedAssets.length === 0 && sheets.some(sheet => sheet.recognized)) warnings.push('O arquivo é compatível, mas não contém posições para importar.');
    if (!sheets.some(sheet => sheet.recognized)) warnings.push('Nenhuma aba com o formato esperado da B3 foi encontrada.');
    if (ignoredBorrowerPositions > 0) warnings.push(`${ignoredBorrowerPositions} ${ignoredBorrowerPositions === 1 ? 'posição como tomador foi ignorada, pois representa ativo alugado' : 'posições como tomador foram ignoradas, pois representam ativos alugados'} de terceiros.`);
    if (duplicateLoans > 0) warnings.push(`${duplicateLoans} ${duplicateLoans === 1 ? 'posição em empréstimo já constava na posição principal e não foi somada' : 'posições em empréstimo já constavam na posição principal e não foram somadas'} novamente.`);

    return { assets: [...consolidated.values()], sheets, warnings };
};
