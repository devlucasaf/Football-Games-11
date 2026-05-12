import estado from './core.js';

const JSON_PATH = '../data/football-top10.json';

export async function carregarDados() {
    const res  = await fetch(JSON_PATH);
    const json = await res.json();
    estado.listas = json.listas;
}

export function escolherLista() {
    if (estado.listasUsadas.size >= estado.listas.length) {
        estado.listasUsadas.clear();
    }

    const disponiveis = estado.listas.filter((_, i) => !estado.listasUsadas.has(i));
    const idx = Math.floor(Math.random() * disponiveis.length);
    const listaEscolhida = disponiveis[idx];
    const idxReal = estado.listas.indexOf(listaEscolhida);

    estado.listasUsadas.add(idxReal);
    estado.listaAtual = listaEscolhida;

    return listaEscolhida;
}

export function obterNomesItens() {
    if (!estado.listaAtual) {
        return [];
    }
    return estado.listaAtual.itens.map(item => item.nome);
}

export function obterOpcoes() {
    if (!estado.listaAtual) {
        return [];
    }
    return estado.listaAtual.opcoes || estado.listaAtual.itens.map(item => item.nome);
}
