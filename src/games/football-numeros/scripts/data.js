import { estado } from "./core.js";

// --- CARREGA OS DADOS DO ARQUIVO JSON DE NÚMEROS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-numeros.json");
    const dadosJogadores = await resposta.json();
    estado.jogadores = dadosJogadores.jogadores;
}

// --- SORTEIA UMA SELEÇÃO DE JOGADORES PARA AS RODADAS ---
export function sortearJogadoresDasRodadas() {
    const copia = [...estado.jogadores];
    const sorteados = [];

    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceJogadorSorteado = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(indiceJogadorSorteado, 1)[0]);
    }

    estado.sorteados = sorteados;
}
