const estado = {
    categorias:          [],
    jogadores:           [],
    mapeamentoSelecao:   {},
    gradeCategorias:      [],       
    filaJogadores:       [],       
    indiceJogadorAtual:   0,        
    acertos:             0,
    erros:               0,
    bingos:              0,
    celulasMarcadas:     new Set() 
};

export default estado;
