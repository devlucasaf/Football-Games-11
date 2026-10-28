export const POSICOES = ["GOL", "LE", "LD", "ZAG", "VOL", "MEI", "PE", "PD", "CA"];

export const LIMITES = {
    GOL: 3,
    LE: 2,
    LD: 2,
    ZAG: 4,
    VOL: 3,
    MEI: 3,
    PE: 2,
    PD: 2,
    CA: 5
};

export const ROTULOS_POSICOES = {
    GOL: "Goleiro",
    LE: "Lateral Esquerdo",
    LD: "Lateral Direito",
    ZAG: "Zagueiro",
    VOL: "Volante",
    MEI: "Meio-Campo",
    PE: "Ponta Esquerda",
    PD: "Ponta Direita",
    CA: "Centroavante"
};

export const estado = {
    modo: null,
    selecao: null,
    dados: null,
    convocados: {
        GOL: [], 
        LE: [], 
        LD: [], 
        ZAG: [], 
        VOL: [],
        MEI: [], 
        PE: [], 
        PD: [], 
        CA: []
    }
};

export function reiniciarConvocados() {
    POSICOES.forEach(posicao => { estado.convocados[posicao] = []; });
}

export function obterTotalConvocados() {
    return Object.values(estado.convocados).reduce((totalJogadores, jogadoresPosicao) => totalJogadores + jogadoresPosicao.length, 0);
}
