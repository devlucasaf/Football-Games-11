import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-acerta-escalacao.json');
    const data = await resp.json();
    estado.escalacoes = data.escalacoes;
}

export function escolherEscalacao() {
    const idx = Math.floor(Math.random() * estado.escalacoes.length);
    return estado.escalacoes[idx];
}

const posicoesMap = {
    'GOL':  { top: 90, left: 50 },
    'LD':   { top: 75, left: 80 },
    'ZAG1': { top: 75, left: 60 },
    'ZAG2': { top: 75, left: 40 },
    'ZAG3': { top: 75, left: 50 },
    'LE':   { top: 75, left: 20 },
    'VOL1': { top: 55, left: 60 },
    'VOL2': { top: 55, left: 40 },
    'MD':   { top: 55, left: 80 },
    'ME':   { top: 55, left: 20 },
    'MEI':  { top: 40, left: 50 },
    'PD':   { top: 25, left: 75 },
    'PE':   { top: 25, left: 25 },
    'CA':   { top: 15, left: 50 },
    'ATA1': { top: 18, left: 60 },
    'ATA2': { top: 18, left: 40 },
    'SS':   { top: 30, left: 50 },
    'SS2':  { top: 30, left: 35 }
};

// --- AJUSTES POR FORMAÇÃO ESPECÍFICA ---
const ajustesFormacao = {
    '4-4-2': {
        'VOL1': { top: 55, left: 55 },
        'VOL2': { top: 55, left: 45 },
        'MD':   { top: 50, left: 80 },
        'ME':   { top: 50, left: 20 },
        'ATA1': { top: 18, left: 60 },
        'ATA2': { top: 18, left: 40 }
    },
    '4-3-3': {
        'VOL1': { top: 55, left: 60 },
        'VOL2': { top: 55, left: 40 },
        'MEI':  { top: 42, left: 50 },
        'PD':   { top: 20, left: 78 },
        'PE':   { top: 20, left: 22 },
        'CA':   { top: 13, left: 50 }
    },
    '4-2-3-1': {
        'VOL1': { top: 60, left: 60 },
        'VOL2': { top: 60, left: 40 },
        'PD':   { top: 38, left: 78 },
        'PE':   { top: 38, left: 22 },
        'MEI':  { top: 38, left: 50 },
        'CA':   { top: 15, left: 50 }
    },
    '3-4-1-2': {
        'ZAG1': { top: 78, left: 65 },
        'ZAG2': { top: 78, left: 50 },
        'ZAG3': { top: 78, left: 35 },
        'MD':   { top: 55, left: 82 },
        'ME':   { top: 55, left: 18 },
        'VOL1': { top: 55, left: 60 },
        'VOL2': { top: 55, left: 40 },
        'MEI':  { top: 35, left: 50 },
        'ATA1': { top: 16, left: 60 },
        'ATA2': { top: 16, left: 40 }
    },
    '4-5-1': {
        'VOL1': { top: 58, left: 55 },
        'VOL2': { top: 58, left: 45 },
        'MD':   { top: 45, left: 80 },
        'ME':   { top: 45, left: 20 },
        'SS':   { top: 32, left: 50 },
        'CA':   { top: 15, left: 50 }
    },
    '4-3-1-2': {
        'VOL1': { top: 58, left: 60 },
        'VOL2': { top: 58, left: 40 },
        'MEI':  { top: 40, left: 50 },
        'SS':   { top: 30, left: 50 },
        'ATA1': { top: 16, left: 60 },
        'ATA2': { top: 16, left: 40 }
    },
    '4-3-2-1': {
        'VOL1': { top: 58, left: 60 },
        'VOL2': { top: 58, left: 40 },
        'MEI':  { top: 48, left: 50 },
        'SS':   { top: 32, left: 60 },
        'SS2':  { top: 32, left: 40 },
        'CA':   { top: 15, left: 50 }
    }
};

export function obterPosicao(posicaoCode, formacao) {
    const ajustes = ajustesFormacao[formacao] || {};
    if (ajustes[posicaoCode]) {
        return ajustes[posicaoCode];
    }
    return posicoesMap[posicaoCode] || { 
        top: 50, 
        left: 50 
    };
}

export function obterLabelPosicao(posicaoCode) {
    const labels = {
        'GOL':  'GOL',
        'LD':   'LD',
        'ZAG1': 'ZAG',
        'ZAG2': 'ZAG',
        'ZAG3': 'ZAG',
        'LE':   'LE',
        'VOL1': 'VOL',
        'VOL2': 'VOL',
        'MD':   'MD',
        'ME':   'ME',
        'MEI':  'MEI',
        'PD':   'PD',
        'PE':   'PE',
        'CA':   'CA',
        'ATA1': 'ATA',
        'ATA2': 'ATA',
        'SS':   'SS',
        'SS2':  'SS'
    };
    return labels[posicaoCode] || posicaoCode;
}
