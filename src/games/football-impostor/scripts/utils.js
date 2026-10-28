// --- FUNÇÃO DE EMBARALHAMENTO ---
export function embaralharJogadores(jogadores) {
    const jogadoresEmbaralhados = [...jogadores];
    for (let indiceAtual = jogadoresEmbaralhados.length - 1; indiceAtual > 0; indiceAtual--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceAtual + 1));
        [jogadoresEmbaralhados[indiceAtual], jogadoresEmbaralhados[indiceSorteado]] = [jogadoresEmbaralhados[indiceSorteado], jogadoresEmbaralhados[indiceAtual]];
    }
    return jogadoresEmbaralhados;
}
