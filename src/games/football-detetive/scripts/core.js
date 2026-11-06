// --- CONFIGURAÇÕES DE CADA NÍVEL ---
export const NIVEIS = {
    facil: { 
        contratacoes: 3 
    },
    medio: { 
        contratacoes: 4 
    },
    dificil: { 
        contratacoes: 5 
    }
};

// --- ESTADO DO JOGO ---
export const estado = {
    dados:                  null,
    configuracao:           { nivel: "facil" },
    caso:                   null,
    marcas:                 { clube: [], temporada: [] },
    pistasRiscadas:         new Set(),
    verificacoesErradas:    0,
    dicasUsadas:            0,
    jogando:                false
};
