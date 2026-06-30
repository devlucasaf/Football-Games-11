const estado = {
    categorias:          [],
    jogadores:           [],
    mapeamentoSelecao:   {},
    gridCategorias:      [],       
    filaJogadores:       [],       
    jogadorIdx:          0,        
    acertos:             0,
    erros:               0,
    bingos:              0,
    celulasMarcadas:     new Set() 
};

export default estado;
