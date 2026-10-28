export const estado = {
    desafios:               [],
    desafioAtual:           null,
    indiceDesafioAtual:      0,
    selecionados:           [],       
    gruposAcertados:        [],    
    tentativasRestantes:    4,
    jogoAtivo:              true,
    jogadoresRestantes:     []  
};

export function reiniciarEstadoDesafio() {
    estado.selecionados = [];
    estado.gruposAcertados = [];
    estado.tentativasRestantes = 4;
    estado.jogoAtivo = true;
    estado.jogadoresRestantes = [];
}
