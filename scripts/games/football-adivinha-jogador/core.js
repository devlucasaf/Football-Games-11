const estado = {
    jogadores:        [],
    jogadorAtual:     null,
    jogadoresUsados:  new Set(),
    pistasReveladas:  1,       
    tentativas:       0,
    acertos:          0,
    totalRodadas:     0,
    sequencia:        0,
    melhorSequencia:  0,
    pontos:           0,
    jogoAtivo:        true
};

export default estado;
