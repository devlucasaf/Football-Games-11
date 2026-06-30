import { estado } from "./core.js";

// --- CARREGAMENTO DE DADOS ---
export async function carregarDados() {
    const resp = await fetch("data/football-multiplica.json");
    const data = await resp.json();
    
    estado.desafios = data.desafios;
    estado.jogadores = data.jogadores;
}

// --- SORTEAR DESAFIO ---
export function sortearDesafio() {
    const idx = Math.floor(Math.random() * estado.desafios.length);
    estado.desafioAtual = estado.desafios[idx];
    estado.multiplicadores = obterMultiplicadoresPorMeta(estado.desafioAtual.meta);
}

// --- OBTER MULTIPLICADORES POR META ---
function obterMultiplicadoresPorMeta(meta) {
    if (meta >= 750000) {
        return [200, 200, 150, 150, 150, 100, 100, 100];
    } else if (meta >= 100000) {
        return [200, 200, 150, 150, 150, 100, 100, 100];
    } else if (meta >= 50000) {
        return [150, 150, 100, 100, 100, 75, 75, 75];
    } else if (meta >= 200) {
        return [20, 10, 10, 5, 5, 5, 2, 2];
    } else if (meta >= 100) {
        return [10, 10, 5, 5, 5, 2, 2, 2];
    } else {
        return [10, 5, 5, 5, 2, 2, 2, 2];
    }
}

// --- SORTEAR JOGADORES ---
export function sortearJogadores() {
    const tipo = estado.desafioAtual.tipo;
    const jogadoresCategoria = estado.jogadores[tipo] || [];
    const copia = [...jogadoresCategoria];
    const sorteados = [];
    const total = estado.desafioAtual.rodadas;

    for (let i = 0; i < total && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(idx, 1)[0]);
    }
    estado.jogadoresSorteados = sorteados;
}

// --- OBTER JOGADOR ATUAL ---
export function jogadorAtual() {
    return estado.jogadoresSorteados[estado.indiceSorteados] || null;
}

// --- OBTER VALOR DO JOGADOR ---
export function valorDoJogador(jogador) {
    if (!jogador || !estado.desafioAtual) {
        return 0;
    }
    return jogador.valor || jogador[estado.desafioAtual.tipo] || 0;
}

// --- MAPA DE NOMES DOS TIPOS ---
const NOMES_TIPO = {
    gols: "Gols",
    assistencias: "Assistências",
    copas: "Copas do Mundo",
    champions: "Champions League",
    libertadores: "Libertadores",
    bolasDeOuro: "Bolas de Ouro",
    brasileirao: "Brasileirão",
    premierLeague: "Premier League"
};

// --- OBTER NOME DO TIPO ---
export function nomeTipo(tipo) {
    return NOMES_TIPO[tipo] || tipo;
}
