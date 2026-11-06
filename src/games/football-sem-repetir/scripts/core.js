// --- CONFIGURAÇÕES DE CADA NÍVEL ---
export const NIVEIS = {
    facil: {
        desafios: 5,
        compostos: 0,
        minimoOpcoes: 3,
        maximoOpcoes: 40,
        faixaArmadilha: [0.1, 0.6],
        mostrarOpcoes: true
    },
    medio: {
        desafios: 6,
        compostos: 0.3,
        minimoOpcoes: 2,
        maximoOpcoes: 20,
        faixaArmadilha: [0.25, 0.8],
        mostrarOpcoes: false
    },
    dificil: {
        desafios: 7,
        compostos: 0.6,
        minimoOpcoes: 2,
        maximoOpcoes: 14,
        faixaArmadilha: [0.4, 0.95],
        mostrarOpcoes: false
    }
};

// --- QUANTOS PALPITES ERRADOS A PESSOA PODE DAR ---
export const MAXIMO_ERROS = 3;

// --- ESTADO DO JOGO ---
export const estado = {
    dados:         null,
    jogadores:     [],
    configuracao:  { nivel: "facil" },
    desafios:      [],
    usados:        new Set(),
    respostas:     {},
    desafioAtivo:  0,
    erros:         0,
    jogando:       false
};
