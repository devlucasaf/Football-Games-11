const estado = {
    listas:         [],
    listaAtual:     null,
    listasUsadas:   new Set(),
    itensAcertados: new Set(),   
    vidas:          3,
    acertosRodada:  0,
    pontosTotal:    0,
    totalRodadas:   0,
    jogoAtivo:      true
};

export default estado;
