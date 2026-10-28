import estado from "./core.js";

// --- CARREGAMENTO DOS DADOS DOS GOLS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-gol-a-gol.json");
    const dados = await resposta.json();
    estado.gols = dados.gols;
}

// --- SORTEIO DOS GOLS PARA AS RODADAS ---
export function sortearGols() {
    const copia = [...estado.gols];                      
    const sorteados = [];
    for (let indiceRodada = 0; indiceRodada < estado.totalRodadas && copia.length > 0; indiceRodada++) {
        const indiceGol = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(indiceGol, 1)[0]);
    }
    estado.sorteados = sorteados;                        
}

// --- FUNÇÃO DE NORMALIZAÇÃO DE TEXTO ---
export function normalizarNomeJogador(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- VERIFICAÇÃO DA RESPOSTA DO USUÁRIO ---
export function verificarResposta(palpite, gol) {
    return gol.alternativas.some(alternativa => normalizarNomeJogador(alternativa) === normalizarNomeJogador(palpite));
}

// --- OBTENÇÃO DOS NOMES ÚNICOS DOS GOLS ---
export function obterNomesUnicos() {
    return [...new Set(estado.gols.map(gol => gol.resposta))];
}
