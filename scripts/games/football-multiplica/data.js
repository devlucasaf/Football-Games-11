import { estado } from './core.js';

// --- CARREGAMENTO DE DADOS ---
export async function carregarDados() {
    const resp = await fetch('../data/football-multiplica.json');
    const data = await resp.json();
    
    estado.desafios = data.desafios;
    estado.jogadores = data.jogadores;
    estado.multiplicadores = data.multiplicadores;
}

// --- SORTEAR DESAFIO ---
export function sortearDesafio() {
    const idx = Math.floor(Math.random() * estado.desafios.length);
    estado.desafioAtual = estado.desafios[idx];
}

// --- SORTEAR JOGADORES ---
export function sortearJogadores() {
    const copia     = [...estado.jogadores];
    const sorteados = [];
    const total     = estado.desafioAtual.rodadas;

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
    return jogador[estado.desafioAtual.tipo] || 0;
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
