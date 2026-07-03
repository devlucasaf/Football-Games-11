import { estado } from "./core.js";

// --- CARREGAMENTO DOS DADOS DAS PARTIDAS ---
export async function carregarDados() {
    const resp = await fetch("data/football-placar.json");
    const data = await resp.json();
    estado.partidas = data.partidas;
}

// --- SORTEIO DAS PARTIDAS PARA AS RODADAS ---
export function sortearPartidas() {
    const copia = [...estado.partidas];                      
    const sorteadas = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length); 
        sorteadas.push(copia.splice(idx, 1)[0]);             
    }
    estado.partidasSorteadas = sorteadas;                    
}

// --- OBTENÇÃO DA PARTIDA DA RODADA ATUAL ---
export function obterPartidaAtual() {
    return estado.partidasSorteadas[estado.rodadaAtual];
}