const estado = {
    rodadas:         [],
    rodadaAtual:     null,
    rodadasUsadas:   new Set(),
    acertos:         0,
    totalJogado:     0,
    sequencia:       0,
    melhorSequencia: 0,
    jogoAtivo:       false
};

export default estado;
