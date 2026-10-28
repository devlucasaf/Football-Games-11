// --- FUNÇÃO DE EMBARALHAMENTO ---
export function embaralharJogadores(jogadores) {
    for (let indiceAtual = jogadores.length - 1; indiceAtual > 0; indiceAtual--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceAtual + 1));
        [jogadores[indiceAtual], jogadores[indiceSorteado]] = [jogadores[indiceSorteado], jogadores[indiceAtual]];
    }
    return jogadores;
}

// --- FUNÇÃO DE NORMALIZAÇÃO DE TEXTO ---
export function normalizarNomeJogador(texto) {
    return texto
        .toLowerCase()                                    
        .normalize("NFD")                                 
        .replace(/[\u0300-\u036f]/g, "")                  
        .trim();                                          
}