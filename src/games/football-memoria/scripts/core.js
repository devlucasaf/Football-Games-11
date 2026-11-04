// --- CONFIGURAÇÕES DE CADA TAMANHO DE PARTIDA ---
export const TAMANHOS = {
    facil: { 
        pares: 6,  
        colunas: 4, 
        tempo: 75,  
        movimentos: 15, 
        previa: 3000 
    },
    medio: { 
        pares: 8,  
        colunas: 4, 
        tempo: 100, 
        movimentos: 20, 
        previa: 4000 
    },
    dificil: { 
        pares: 10, 
        colunas: 5, 
        tempo: 130, 
        movimentos: 26, 
        previa: 5000 
    }
};

// --- TEMAS DISPONÍVEIS ---
export const TEMAS = [
    "nacionalidade", 
    "estadio", 
    "escudo", 
    "misto"
];

// --- MODOS DE JOGO DISPONÍVEIS ---
export const MODOS = [
    "tempo", 
    "movimentos", 
    "livre"
];

// --- ESTADO DO JOGO ---
export const estado = {
    temas:                      {},
    configuracao:               { tema: "nacionalidade", modo: "tempo", tamanho: "facil" },
    cartas:                     [],
    paresPartida:               [],
    cartasViradas:              [],
    paresEncontrados:           0,
    movimentos:                 0,
    tempoRestante:              0,
    tempoDecorrido:             0,
    identificadorCronometro:    null,
    identificadorPrevia:        null,
    tabuleiroBloqueado:         true,
    jogando:                    false
};
