// --- COMPETIÇÕES DISPONÍVEIS ---
export const COMPETICOES = {
    "todas": { 
        nome: "Surpresa", 
        chave: "taca-comp-todas", 
        icone: "fa-shuffle" 
    },
    "copa-do-mundo": { 
        nome: "Copa do Mundo", 
        chave: "taca-comp-copa", 
        icone: "fa-earth-americas" 
    },
    "eurocopa": { 
        nome: "Eurocopa", 
        chave: "taca-comp-euro", 
        icone: "fa-star" 
    },
    "copa-america":  { 
        nome: "Copa América", 
        chave: "taca-comp-america", 
        icone: "fa-compass" 
    }
};

// --- NOME DE CADA FASE ---
export const NOMES_FASE = {
    G: { 
        nome: "Fase de grupos", 
        chave: "taca-phase-group" 
    },
    O: { 
        nome: "Oitavas de final", 
        chave: "taca-phase-r16" 
    },
    Q: { 
        nome: "Quartas de final", 
        chave: "taca-phase-qf" 
    },
    S: { 
        nome: "Semifinal", 
        chave: "taca-phase-sf" 
    },
    F: { 
        nome: "Final", 
        chave: "taca-phase-final" 
    }
};

// --- PONTUAÇÃO ---
export const PONTOS_POR_JOGO = 100;
export const PONTOS_MINIMOS_POR_JOGO = 25;
export const CUSTO_DICAS = { pais: 10, bandeira: 20, placar: 15 };
export const PENALIDADE_ERRO = 5;
export const MAXIMO_ERROS = 8;

// --- PERCENTUAL DE PONTOS PARA GANHAR E PARA CADA ESTRELA ---
export const META_ESTRELAS = [0.4, 0.65, 0.85];

// --- ESTADO DO JOGO ---
export const estado = {
    dados:          null,
    configuracao:   { competicao: "todas" },
    edicao:         null,
    jogos:          [],
    selecionado:    0,
    erros:          0,
    ultimaEdicao:   null,
    jogando:        false
};
