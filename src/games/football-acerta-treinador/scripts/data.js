import { estado } from "./core.js";

// --- CARREGA DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-acerta-treinador.json");
    const data = await resp.json();
    estado.treinadores = data.treinadores;
}

// --- SORTEIA TREINADORES PARA O JOGO ---
export function sortear() {
    const copia = [...estado.treinadores];
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

// --- VERIFICA SE O PALPITE ESTÁ CORRETO ---
export function obterDicas(treinador) {
    return [
        { 
            label: "Nacionalidade", 
            valor: treinador.nacionalidade 
        },
        { 
            label: "Nascimento", 
            valor: treinador.anoNascimento.toString() 
        },
        { 
            label: "Clubes", 
            valor: treinador.clubes.slice(0, 3).join(", ") + "..." 
        },
        { 
            label: "Títulos", 
            valor: treinador.titulos.slice(0, 2).join(", ") 
        },
        { 
            label: "Curiosidade", 
            valor: treinador.curiosidade 
        }
    ];
}
