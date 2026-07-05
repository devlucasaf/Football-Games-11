import { estado } from "./core.js";

// --- CARREGAMENTO DOS DADOS ---
export async function carregarDados() {
    const resp = await fetch("data/football-linha-do-tempo.json");
    const data = await resp.json();
    estado.rodadas = data.rodadas;
}

// --- SORTEIO DAS RODADAS PARA A SESSÃO ATUAL ---
export function sortear() {
    const copia = [...estado.rodadas];                      
    const sorteadas = [];
    for (let i = 0; i < estado.totalRodadas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length); 
        sorteadas.push(copia.splice(idx, 1)[0]);              
    }
    estado.sorteadas = sorteadas;                            
}

// --- FUNÇÃO DE EMBARALHAMENTO ---
export function embaralhar(arr) {
    const copia = [...arr];                                  
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));       
        [copia[i], copia[j]] = [copia[j], copia[i]];         
    }
    return copia;                                            
}