import { estado } from './core.js';

// --- CARREGA OS DADOS DO ARQUIVO JSON DE CONVOCAÇÕES ---
export async function carregarDados() {
    const resp = await fetch('../data/football-vc-convoca.json');
    estado.dados = await resp.json();
}

// --- RETORNA A LISTA DE SELEÇÕES DO MODO SELECIONADO ---
export function obterSelecoes() {
    if (!estado.dados || !estado.modo) {
        return [];
    }
    const modoData = estado.dados[estado.modo];
    return Object.keys(modoData).map(key => ({
        key,
        nome: key.charAt(0).toUpperCase() + key.slice(1),
        bandeira: modoData[key].bandeira
    }));
}

// --- RETORNA A LISTA DE OPÇÕES DA SELEÇÃO ---
export function obterOpcoes() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return [];
    }
    return estado.dados[estado.modo][estado.selecao].opcoes || [];
}

// --- RETORNA A LISTA OFICIAL DE CONVOCADOS DA SELEÇÃO ---
export function obterConvocadosOficiais() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return [];
    }
    return estado.dados[estado.modo][estado.selecao].convocados || [];
}

// --- RETORNA A BANDEIRA DO PAÍS DA SELEÇÃO ---
export function obterBandeira() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return '';
    }
    return estado.dados[estado.modo][estado.selecao].bandeira || '';
}
