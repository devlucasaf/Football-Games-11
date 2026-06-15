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

export const LABELS = {
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

export function resetConvocados() {
    POSICOES.forEach(pos => { estado.convocados[pos] = []; });
}

export function totalConvocados() {
    return Object.values(estado.convocados).reduce((t, arr) => t + arr.length, 0);
}
