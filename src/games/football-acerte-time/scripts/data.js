import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-acerta-time.json");
    const data = await resp.json();
    estado.times = data.times;
}

// --- SORTEIA TIMES PARA O JOGO ---
export function sortear() {
    const copia = [...estado.times];
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

// --- MONTA AS DICAS DO TIME ---
export function obterDicas(time) {
    return [
        {
            label: "País",
            valor: time.pais
        },
        {
            label: "Ano de Fundação",
            valor: time.anoFundacao.toString()
        },
        {
            label: "Fornecedor Esportivo",
            valor: time.fornecedorEsportivo
        },
        {
            label: "Maior Rival",
            valor: time.maiorRival
        },
        {
            label: "Estádio",
            valor: time.estadio
        }
    ];
}
