import estado from "./core.js";

// --- CARREGAMENTO DOS DADOS DAS RODADAS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-jogou-com.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }

    const dados = await resposta.json();
    
    estado.rodadas = dados.rodadas;                
}

// --- SELEÇÃO DE UMA RODADA ALEATÓRIA NÃO UTILIZADA ---
export function escolherRodada() {
    const disponiveis = estado.rodadas.filter((rodada, indiceRodada) => !estado.rodadasUsadas.has(indiceRodada));

    if (disponiveis.length === 0) {
        estado.rodadasUsadas.clear();               
        return escolherRodada();                    
    }

    const indices = estado.rodadas
        .map((rodada, indiceRodada) => indiceRodada)
        .filter(indiceRodada => !estado.rodadasUsadas.has(indiceRodada));

    const indiceRodada = indices[Math.floor(Math.random() * indices.length)];

    estado.rodadasUsadas.add(indiceRodada);
    estado.rodadaAtual = estado.rodadas[indiceRodada];
    estado.companheirosRevelados = 0;
    estado.tentativas = 0;
    estado.jogoAtivo = true;
}

// --- OBTENÇÃO DA LISTA DE TODOS OS NOMES DOS JOGADORES ---
export function obterNomesJogadores() {
    return estado.rodadas.map(rodada => rodada.resposta);
}