import { estado } from "./core.js";

export async function carregarDados() {
    const resp = await fetch("../data/football-conecta-clubes.json");
    const data = await resp.json();
    estado.conexoes = data.conexoes;
}

// --- SORTEAR CONEXÕES PARA AS RODADAS ---
export function sortear() {
    const copia = [...estado.conexoes];
    const sorteadas = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(idx, 1)[0]);
    }
    estado.sorteadas = sorteadas;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
