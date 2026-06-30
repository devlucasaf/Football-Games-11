export const estado = {
    puzzles:                [],
    puzzleAtual:            null,
    puzzleIndex:            0,
    selecionados:           [],       
    gruposAcertados:        [],    
    tentativasRestantes:    4,
    jogoAtivo:              true,
    jogadoresRestantes:     []  
};

export function resetPuzzle() {
    estado.selecionados = [];
    estado.gruposAcertados = [];
    estado.tentativasRestantes = 4;
    estado.jogoAtivo = true;
    estado.jogadoresRestantes = [];
}
