import estado from "./core.js";

// --- CARREGAMENTO DOS DADOS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-piramide.json");
    const dados = await resposta.json();
    estado.categorias = dados.categorias;
}

// --- SORTEIO DE UMA CATEGORIA E PREPARAÇÃO DOS JOGADORES ---
export function sortearCategoria() {
    const indiceCategoria = Math.floor(Math.random() * estado.categorias.length);
    estado.categoriaAtual = estado.categorias[indiceCategoria];
    
    estado.jogadoresOrdenados = [...estado.categoriaAtual.jogadores]
        .sort((primeiroJogador, segundoJogador) => segundoJogador.valor - primeiroJogador.valor);

    estado.jogadoresEmbaralhados = [...estado.jogadoresOrdenados]
        .sort(() => Math.random() - 0.5);
}

// --- DETERMINAÇÃO DO TIER DE UM JOGADOR ---
export function obterNivelDoJogador(jogador) {
    const indiceJogador = estado.jogadoresOrdenados.findIndex(jogadorOrdenado => jogadorOrdenado.nome === jogador.nome);
    if (indiceJogador === 0) {
        return 1;          
    }

    if (indiceJogador <= 2) {
        return 2;          
    }

    if (indiceJogador <= 5) {
        return 3;          
    }
    return 4;             
}

// --- OBTÉM A POSIÇÃO CORRETA DE UM JOGADOR NA ORDENAÇÃO ---
export function obterPosicaoCorreta(jogador) {
    return estado.jogadoresOrdenados.findIndex(jogadorOrdenado => jogadorOrdenado.nome === jogador.nome);
}

// --- CÁLCULO DA PONTUAÇÃO FINAL ---
export function calcularAcertos() {
    let acertos = 0;
    for (let indicePosicao = 0; indicePosicao < 10; indicePosicao++) {
        if (estado.piramide[indicePosicao] && estado.piramide[indicePosicao].nome === estado.jogadoresOrdenados[indicePosicao].nome) {
            acertos++;
        }
    }
    estado.acertos = acertos;
    return acertos;
}

// --- MAPEAMENTO DE TIERS PARA SLOTS ---
export function obterPosicoesDoNivel(nivel) {
    switch (nivel) {
        case 1: 
            return [0];
        case 2: 
            return [1, 2];
        case 3: 
            return [3, 4, 5];
        case 4: 
            return [6, 7, 8, 9];
        default: 
            return [];
    }
}
