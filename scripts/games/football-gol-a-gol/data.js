import estado from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-gol-a-gol.json');
    const dados = await resp.json();
    estado.gols = dados.gols;
}

export function escolherGol() {
    const disponiveis = estado.gols.filter((_, i) => !estado.golsUsados.includes(i));

    if (disponiveis.length === 0) {
        estado.golsUsados = [];
        return escolherGol();
    }

    const idx = Math.floor(Math.random() * disponiveis.length);
    const golEscolhido = disponiveis[idx];
    const idxOriginal = estado.gols.indexOf(golEscolhido);
    estado.golsUsados.push(idxOriginal);

    return golEscolhido;
}

export function normalizar(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function verificarResposta(palpite, gol) {
    const palpiteNorm = normalizar(palpite);
    return gol.alternativas.some(alt => normalizar(alt) === palpiteNorm);
}
