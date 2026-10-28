import { estado } from "./core.js";

// --- CARREGAMENTO DOS DADOS DAS PARTIDAS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-placar.json");
    const dadosPartidas = await resposta.json();
    estado.partidas = dadosPartidas.partidas;
}

// --- SORTEIO DAS PARTIDAS PARA AS RODADAS ---
export function sortearPartidas() {
    const copia = [...estado.partidas];                      
    const sorteadas = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indicePartidaSorteada = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(indicePartidaSorteada, 1)[0]);
    }
    estado.partidasSorteadas = sorteadas;                    
}

// --- OBTENÇÃO DA PARTIDA DA RODADA ATUAL ---
export function obterPartidaAtual() {
    return estado.partidasSorteadas[estado.rodadaAtual];
}