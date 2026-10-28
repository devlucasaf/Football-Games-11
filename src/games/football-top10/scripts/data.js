import estado from "./core.js";

const CAMINHO_DADOS_LISTAS = "data/football-top10.json";

// --- CARREGA OS DADOS DO ARQUIVO JSON ---
export async function carregarDados() {
    const resposta = await fetch(CAMINHO_DADOS_LISTAS);
    const dadosListas = await resposta.json();
    estado.listas = dadosListas.listas;
}

// --- ESCOLHE UMA LISTA ALEATÓRIA QUE AINDA NÃO FOI USADA ---
export function escolherLista() {
    if (estado.listasUsadas.size >= estado.listas.length) {
        estado.listasUsadas.clear();
    }

    const disponiveis = estado.listas.filter((listaCandidata, indiceLista) => !estado.listasUsadas.has(indiceLista));
    const indiceListaSorteada = Math.floor(Math.random() * disponiveis.length);
    const listaEscolhida = disponiveis[indiceListaSorteada];
    const indiceListaOriginal = estado.listas.indexOf(listaEscolhida);

    estado.listasUsadas.add(indiceListaOriginal);
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
