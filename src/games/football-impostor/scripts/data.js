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

    let idx;
    do {
        idx = Math.floor(Math.random() * estado.rodadas.length);  
    } 
    while (estado.rodadasUsadas.has(idx));                        

    estado.rodadasUsadas.add(idx);                                
    estado.rodadaAtual = estado.rodadas[idx];                     
}