import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-adivinha-estadio.json");
    const dadosEstadios = await respostaCarregamento.json();
    estado.estadios = dadosEstadios.estadios;
}

// --- SORTEIA ESTÁDIOS PARA O JOGO ---
export function sortearEstadiosRodadas() {
    const copia = [...estado.estadios];
    const sorteados = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceEstadio = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(indiceEstadio, 1)[0]);
    }
    estado.sorteados = sorteados;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizarTextoComparacao(textoComparacao) {
    return textoComparacao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- MONTA A LISTA DE DICAS DO ESTÁDIO ---
export function obterDicas(estadio) {
    return [
        {
            rotulo: "País",
            valor: estadio.pais
        },
        {
            rotulo: "Estado / Região",
            valor: estadio.estado
        },
        {
            rotulo: "Inauguração",
            valor: estadio.inauguracao.toString()
        },
        {
            rotulo: "Capacidade",
            valor: `${estadio.capacidade} lugares`
        },
        {
            rotulo: "Primeiro jogo",
            valor: estadio.primeiroJogo
        },
        {
            rotulo: "Clube",
            valor: estadio.clube
        }
    ];
}
