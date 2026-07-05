import { estado } from "./core.js";

// --- CARREGAMENTO DOS DADOS DOS DESAFIOS ---
export async function carregarDados() {
    const resp = await fetch("data/football-quem-falta.json");
    const data = await resp.json();
    estado.desafios = data.desafios;
}

// --- SORTEIO DOS DESAFIOS PARA AS RODADAS ---
export function sortear() {
    const copia = [...estado.desafios];
    const sorteados = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(idx, 1)[0]);
    }
    estado.sorteados = sorteados;
}

// --- NORMALIZAÇÃO DE STRINGS ---
export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- OBTENÇÃO DE TODOS OS NOMES ÚNICOS DOS DESAFIOS ---
export function obterNomes() {
    const nomes = new Set();
    estado.desafios.forEach(desafio => {
        desafio.lista.forEach(nome => nomes.add(nome));
    });
    return [...nomes].sort((a, b) => a.localeCompare(b));
}