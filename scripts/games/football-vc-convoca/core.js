export const estado = {
    modo:       null,           
    selecao:    null,        
    dados:      null,          
    convocados: {         
        GOL: [],
        DEF: [],
        MEI: [],
        ATA: []
    },
    posicaoAtiva: "GOL",  
    limites: { 
        GOL: 3, 
        DEF: 8, 
        MEI: 8, 
        ATA: 7 
    }
};

export function resetConvocados() {
    estado.convocados = { 
        GOL: [], 
        DEF: [], 
        MEI: [], 
        ATA: [] 
    };
}

export function totalConvocados() {
    return Object.values(estado.convocados).reduce((t, arr) => t + arr.length, 0);
}
