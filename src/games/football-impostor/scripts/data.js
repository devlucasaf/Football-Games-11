import estado from "./core.js";

// --- CARREGAMENTO DOS DADOS DAS RODADAS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-impostor.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }
    const dados = await resposta.json();
    estado.rodadas = dados.rodadas;               
}

// --- SELEÇÃO DE UMA RODADA ALEATÓRIA NÃO UTILIZADA ---
export function escolherRodada() {
    if (estado.rodadasUsadas.size >= estado.rodadas.length) {
        estado.rodadasUsadas.clear();
    }

    let indiceRodada;
    do {
        indiceRodada = Math.floor(Math.random() * estado.rodadas.length);
    } 
    while (estado.rodadasUsadas.has(indiceRodada));

    estado.rodadasUsadas.add(indiceRodada);
    estado.rodadaAtual = estado.rodadas[indiceRodada];
}