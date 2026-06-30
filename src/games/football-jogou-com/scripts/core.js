const estado = {
    rodadas:                [],
    rodadaAtual:            null,
    rodadasUsadas:          new Set(),
    companheirosRevelados:  0,   
    tentativas:             0,        
    acertos:                0,
    totalRodadas:           0,
    sequencia:              0,
    melhorSequencia:        0,
    pontos:                 0,
    jogoAtivo:              true
};

export default estado;
