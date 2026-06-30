export const estado = {
    dados:              null,
    modoAtual:          "",
    jogadores:          [],          
    jogadoresUsados:    [],    
    jogadorAtual:       null,     
    clubesRevelados:    0,     
    rodada:             1,
    totalRodadas:       5,
    pontuacao:          0,
    jogoAtivo:          true,
    palpite: ""
};

export function resetEstado() {
    estado.jogadoresUsados = [];
    estado.jogadorAtual = null;
    estado.clubesRevelados = 0;
    estado.rodada = 1;
    estado.pontuacao = 0;
    estado.jogoAtivo = true;
    estado.palpite = "";
}
