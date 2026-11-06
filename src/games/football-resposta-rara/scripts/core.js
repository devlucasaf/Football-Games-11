// --- CONFIGURAÇÕES DE CADA NÍVEL ---
export const NIVEIS = {
    facil: {
        rodadas: 5,
        compostos: 0.2,
        minimoOpcoes: 8
    },
    medio: {
        rodadas: 6,
        compostos: 0.5,
        minimoOpcoes: 6
    },
    dificil: {
        rodadas: 7,
        compostos: 0.8,
        minimoOpcoes: 5
    }
};

// --- TENTATIVAS POR RODADA E CUSTO DA DICA ---
export const TENTATIVAS_POR_RODADA = 2;
export const CUSTO_DICA = 15;

// --- PONTOS PELA FAMA ---
export const FAIXAS = [
    { 
        ate: 2, 
        pontos: 100, 
        rotulo: "Raríssima",    
        chave: "rara-tier-1" 
    },
    { 
        ate: 3, 
        pontos: 80,  
        rotulo: "Muito rara",   
        chave: "rara-tier-2" 
    },
    { 
        ate: 4, 
        pontos: 60,  
        rotulo: "Rara",         
        chave: "rara-tier-3" 
    },
    { 
        ate: 5, 
        pontos: 45,  
        rotulo: "Pouco óbvia",  
        chave: "rara-tier-4" 
    },
    { 
        ate: 6, 
        pontos: 30,  
        rotulo: "Conhecida",    
        chave: "rara-tier-5" 
    },
    { 
        ate: 7, 
        pontos: 20,  
        rotulo: "Comum",        
        chave: "rara-tier-6" 
    },
    { 
        ate: 8, 
        pontos: 10,  
        rotulo: "Muito comum",  
        chave: "rara-tier-7" 
    },
    { 
        ate: 10, 
        pontos: 5,  
        rotulo: "Óbvia",        
        chave: "rara-tier-8" 
    }
];

// --- PONTUAÇÃO MÉDIA POR RODADA PARA GANHAR E PARA CADA ESTRELA ---
export const META_MEDIA = [24, 40, 60];

// --- ESTADO DO JOGO ---
export const estado = {
    dados:           null,
    jogadores:       [],
    configuracao:    { nivel: "facil" },
    rodadas:         [],
    rodadaAtual:     0,
    tentativas:      0,
    dicaUsada:       false,
    usados:          new Set(),
    resultados:      [],
    jogando:         false,
    rodadaEncerrada: false
};
