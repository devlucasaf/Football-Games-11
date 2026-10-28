export const estado = {
    jogadores:       [],
    atual:           null,
    palavra:         "",
    reveladas:       new Set(),
    usadas:          new Set(),
    erros:           0,
    maximoErros:     6,
    jogoAtivo:       true,
    acertos:         0,
    sequencia:       0,
    melhorSequencia: 0
};
