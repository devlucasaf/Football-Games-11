import { estado } from "./core.js";

// --- CARREGA OS DADOS DO ARQUIVO JSON DE NÚMEROS ---
export async function carregarDados() {
    const resp = await fetch("data/football-numeros.json");
    const data = await resp.json();
    estado.jogadores = data.jogadores;
}

// --- SORTEIA UMA SELEÇÃO DE JOGADORES PARA AS RODADAS ---
export function sortear() {
    const copia = [...estado.jogadores];
    const sorteados = [];

    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(idx, 1)[0]);
    }

    estado.sorteados = sorteados;
}
