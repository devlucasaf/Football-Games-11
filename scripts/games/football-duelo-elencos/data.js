import { estado } from './core.js';

// --- CARREGAMENTO DE DADOS ---
export async function carregarDados() {
    const resp = await fetch('../data/football-duelo-elencos.json');
    const data = await resp.json();
    estado.duelos = data.duelos;
}

// --- ESCOLHER DUELO ALEATÓRIO ---
export function escolherDuelo() {
    const disponiveis = estado.duelos.filter((_, i) => !estado.duelosUsados.includes(i));
    const idx = Math.floor(Math.random() * disponiveis.length);
    const realIdx = estado.duelos.indexOf(disponiveis[idx]);
    estado.duelosUsados.push(realIdx);
    return disponiveis[idx];
}

// --- EMBARALHAR JOGADORES ---
export function embaralharJogadores(jogadores) {
    const arr = [...jogadores];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
