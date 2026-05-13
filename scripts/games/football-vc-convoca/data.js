import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-vc-convoca.json');
    estado.dados = await resp.json();
}

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

export function obterOpcoes() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return [];
    }
    return estado.dados[estado.modo][estado.selecao].opcoes || [];
}

export function obterConvocadosOficiais() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return [];
    }
    return estado.dados[estado.modo][estado.selecao].convocados || [];
}

export function obterBandeira() {
    if (!estado.dados || !estado.modo || !estado.selecao) {
        return '';
    }
    return estado.dados[estado.modo][estado.selecao].bandeira || '';
}
