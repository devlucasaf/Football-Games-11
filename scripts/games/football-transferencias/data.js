import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-transferencias.json');
    const data = await resp.json();
    estado.jogadores = data.jogadores;
}

export function escolherJogador() {
    const disponiveis = estado.jogadores
        .map((j, i) => i)
        .filter(i => !estado.jogadoresUsados.includes(i));

    if (disponiveis.length === 0) {
        return null;
    }

    const idx = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    estado.jogadoresUsados.push(idx);
    estado.jogadorAtual = estado.jogadores[idx];
    estado.clubesRevelados = 1; 
    return estado.jogadorAtual;
}

export function obterNomesJogadores() {
    return estado.jogadores.map(j => j.nome);
}
