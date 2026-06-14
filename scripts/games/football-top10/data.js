import estado from "./core.js";

const JSON_PATH = "../data/football-top10.json";

// --- CARREGA OS DADOS DO ARQUIVO JSON ---
export async function carregarDados() {
    const res  = await fetch(JSON_PATH);
    const json = await res.json();
    estado.listas = json.listas;
}

// --- ESCOLHE UMA LISTA ALEATÓRIA QUE AINDA NÃO FOI USADA ---
export function escolherLista() {
    if (estado.listasUsadas.size >= estado.listas.length) {
        estado.listasUsadas.clear();
    }

    const disponiveis    = estado.listas.filter((_, i) => !estado.listasUsadas.has(i));
    const idx            = Math.floor(Math.random() * disponiveis.length);
    const listaEscolhida = disponiveis[idx];
    const idxReal        = estado.listas.indexOf(listaEscolhida);

    estado.listasUsadas.add(idxReal);
    estado.listaAtual = listaEscolhida;

    return listaEscolhida;
}

// --- RETORNA UM ARRAY COM OS NOMES DOS ITENS DA LISTA ATUAL ---
export function obterNomesItens() {
    if (!estado.listaAtual) {
        return [];
    }
    return estado.listaAtual.itens.map(item => item.nome);
}

// --- RETORNA AS OPÇÕES DE RESPOSTA DA LISTA ATUAL ---
export function obterOpcoes() {
    if (!estado.listaAtual) {
        return [];
    }
    return estado.listaAtual.opcoes || estado.listaAtual.itens.map(item => item.nome);
}
