// --- POSIÇÕES OBRIGATÓRIAS DO ELENCO ---
export const VAGAS_ELENCO = { 
    GOL: 1, 
    DEF: 2, 
    MEI: 2, 
    ATA: 2 
};

// --- POSIÇÕES DISPONÍVEIS PARA O LEILÃO ---
export const POSICOES = [
    "GOL", 
    "DEF", 
    "MEI", 
    "ATA"
];

// --- PREÇO MÍNIMO DE UM LANCE ---
export const PRECO_MINIMO = 1;

// --- NOTA DO JOGADOR GENÉRICO USADO QUANDO O ELENCO NÃO FECHA ---
export const NOTA_RESERVA = 60;

// --- CONFIGURAÇÕES DE CADA NÍVEL ---
export const NIVEIS = {
    facil: { 
        orcamento: 130, 
        orcamentoAdversarios: 105, 
        perfis: [
            "economico",
            "equilibrado"
        ] 
    },
    medio:   { 
        orcamento: 115, 
        orcamentoAdversarios: 115, 
        perfis: [
            "agressivo", 
            "economico", 
            "posicional"
        ] 
    },
    dificil: { 
        orcamento: 100, 
        orcamentoAdversarios: 135, 
        perfis: [
            "agressivo", 
            "estrelas", 
            "posicional"
        ] 
    }
};

// --- PERFIS DOS ADVERSÁRIOS ---
export const PERFIS = {
    agressivo: { 
        nome: "Dom Agressivo",     
        icone: "fa-fire",            
        passo: 2, 
        reserva: 3, 
        descricao: "Paga caro e cobre quase todo lance, principalmente no começo." 
    },
    economico: { 
        nome: "Seu Econômico",     
        icone: "fa-piggy-bank",      
        passo: 1, 
        reserva: 5, 
        descricao: "Só compra barato e desiste rápido quando o preço sobe." 
    },
    estrelas: { 
        nome: "Madame Estrelas",   
        icone: "fa-star",            
        passo: 3, 
        reserva: 2, 
        descricao: "Gasta pesado nos craques e quase ignora o resto." 
    },
    posicional: { 
        nome: "Professor Tático",  
        icone: "fa-chess",           
        passo: 1, 
        reserva: 4, 
        descricao: "Paga mais quando sobram poucos jogadores da posição que ele precisa." 
    },
    equilibrado: { 
        nome: "Doutor Equilíbrio", 
        icone: "fa-scale-balanced",  
        passo: 1, 
        reserva: 5, 
        descricao: "Divide o orçamento pelas vagas que ainda faltam." 
    }
};

// --- ESTADO DO JOGO ---
export const estado = {
    jogadores:    [],
    configuracao: { nivel: "facil" },
    leilao:       null,
    ocupado:      false,
    jogando:      false
};
