import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-adivinha-clube.json");
    const dadosTimes = await respostaCarregamento.json();
    estado.times = dadosTimes.times;
}

// --- SORTEIA TIMES PARA O JOGO ---
export function sortearTimesRodadas() {
    const copia = [...estado.times];
    const sorteados = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceTime = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(indiceTime, 1)[0]);
    }
    estado.sorteados = sorteados;
}

// --- NORMALIZAÇÃO DE TEXTO ---
export function normalizarTextoComparacao(textoComparacao) {
    return textoComparacao.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- MONTA AS DICAS DO TIME ---
export function obterDicas(time) {
    return [
        {
            rotulo: "País",
            valor: time.pais
        },
        {
            rotulo: "Ano de Fundação",
            valor: time.anoFundacao.toString()
        },
        {
            rotulo: "Fornecedor Esportivo",
            valor: time.fornecedorEsportivo
        },
        {
            rotulo: "Maior Rival",
            valor: time.maiorRival
        },
        {
            rotulo: "Estádio",
            valor: time.estadio
        }
    ];
}
