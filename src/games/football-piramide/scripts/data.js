import estado from "./core.js";

export async function carregarDados() {
    const resp = await fetch("data/football-piramide.json");
    const dados = await resp.json();
    estado.categorias = dados.categorias;
}

export function sortearCategoria() {
    const idx = Math.floor(Math.random() * estado.categorias.length);
    estado.categoriaAtual = estado.categorias[idx];
    
    estado.jogadoresOrdenados = [...estado.categoriaAtual.jogadores]
        .sort((a, b) => b.valor - a.valor);

    estado.jogadoresEmbaralhados = [...estado.jogadoresOrdenados]
        .sort(() => Math.random() - 0.5);
}

export function obterTierDoJogador(jogador) {
    const idx = estado.jogadoresOrdenados.findIndex(j => j.nome === jogador.nome);
    if (idx === 0) {
        return 1;
    }

    if (idx <= 2) {
        return 2;
    }

    if (idx <= 5) {
        return 3;
    }
    return 4;
}

export function obterPosicaoCorreta(jogador) {
    return estado.jogadoresOrdenados.findIndex(j => j.nome === jogador.nome);
}

export function calcularAcertos() {
    let acertos = 0;
    for (let i = 0; i < 10; i++) {
        if (estado.piramide[i] && estado.piramide[i].nome === estado.jogadoresOrdenados[i].nome) {
            acertos++;
        }
    }
    estado.acertos = acertos;
    return acertos;
}

export function obterSlotsDoTier(tier) {
    switch (tier) {
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
