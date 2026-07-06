import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-adivinha-estadio.json");
    const data = await resp.json();
    estado.estadios = data.estadios;
}

// --- SORTEIA ESTÁDIOS PARA O JOGO ---
export function sortear() {
    const copia = [...estado.estadios];
    const sorteados = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(idx, 1)[0]);
    }
    estado.sorteados = sorteados;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- MONTA A LISTA DE DICAS DO ESTÁDIO ---
export function obterDicas(estadio) {
    return [
        {
            label: "País",
            valor: estadio.pais
        },
        {
            label: "Estado / Região",
            valor: estadio.estado
        },
        {
            label: "Inauguração",
            valor: estadio.inauguracao.toString()
        },
        {
            label: "Capacidade",
            valor: `${estadio.capacidade} lugares`
        },
        {
            label: "Primeiro jogo",
            valor: estadio.primeiroJogo
        },
        {
            label: "Clube",
            valor: estadio.clube
        }
    ];
}
