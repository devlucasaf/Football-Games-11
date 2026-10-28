import { estado } from "./core.js";

// --- CARREGAMENTO DOS DADOS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-linha-do-tempo.json");
    const dados = await resposta.json();
    estado.rodadas = dados.rodadas;
}

// --- SORTEIO DAS RODADAS PARA A SESSÃO ATUAL ---
export function sortearRodadas() {
    const copia = [...estado.rodadas];                      
    const sorteadas = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceSorteado = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(indiceSorteado, 1)[0]);
    }
    estado.sorteadas = sorteadas;                            
}

// --- FUNÇÃO DE EMBARALHAMENTO ---
export function embaralharEventos(eventos) {
    const copia = [...eventos];
    for (let indiceAtual = copia.length - 1; indiceAtual > 0; indiceAtual--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceAtual + 1));
        [copia[indiceAtual], copia[indiceSorteado]] = [copia[indiceSorteado], copia[indiceAtual]];
    }
    return copia;                                            
}