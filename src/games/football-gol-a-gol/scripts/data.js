import estado from "./core.js";

// --- CARREGAMENTO DOS DADOS DOS GOLS ---
export async function carregarDados() {
    const resp = await fetch("data/football-gol-a-gol.json");
    const dados = await resp.json();
    estado.gols = dados.gols;
}

// --- SORTEIO DOS GOLS PARA AS RODADAS ---
export function sortear() {
    const copia = [...estado.gols];                      
    const sorteados = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length); 
        sorteados.push(copia.splice(idx, 1)[0]);            
    }
    estado.sorteados = sorteados;                        
}

// --- FUNÇÃO DE NORMALIZAÇÃO DE TEXTO ---
export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// --- VERIFICAÇÃO DA RESPOSTA DO USUÁRIO ---
export function verificarResposta(palpite, gol) {
    return gol.alternativas.some(alt => normalizar(alt) === normalizar(palpite));
}

// --- OBTENÇÃO DOS NOMES ÚNICOS DOS GOLS ---
export function obterNomesUnicos() {
    return [...new Set(estado.gols.map(g => g.resposta))];
}
