// --- CATEGORIAS FIXAS DO TIME ---
export const CATEGORIAS = [
    { 
        id: "escudo",   
        etiqueta: "Escudo",   
        icone: "fa-shield-halved" 
    },
    { 
        id: "titulos",  
        etiqueta: "Títulos",  
        icone: "fa-trophy" 
    },
    { 
        id: "estadio",  
        etiqueta: "Estádio",  
        icone: "fa-landmark" 
    },
    { 
        id: "historia", 
        etiqueta: "História", 
        icone: "fa-book-open" 
    },
    { 
        id: "dinheiro", 
        etiqueta: "Dinheiro", 
        icone: "fa-sack-dollar" 
    },
    { 
        id: "uniforme", 
        etiqueta: "Uniforme", 
        icone: "fa-shirt" 
    },
    { 
        id: "torcida",  
        etiqueta: "Torcida",  
        icone: "fa-people-group" 
    }
];

// --- LIMITE DE RODADAS ---
export const LIMITE_RODADAS = 20;

// --- ESTADO GLOBAL DO JOGO ---
export const estado = {
    times: [],          
    baralho: [],        
    timeAtual: null,    
    rodada: 0,          
    categoriasPreenchidas: {},
    terminado: false,
    venceu: false
};
