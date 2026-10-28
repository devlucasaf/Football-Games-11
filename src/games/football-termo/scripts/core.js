const estado = {
    MAXIMO_TENTATIVAS:  6,
    jogadores:          [],
    jogadorSecreto:     "",
    secretoNormalizado: "",
    tentativaAtual:     0,
    colunaAtual:        0,
    jogoAtivo:          true,
    estadoTeclas:       new Map()
};

export default estado;
