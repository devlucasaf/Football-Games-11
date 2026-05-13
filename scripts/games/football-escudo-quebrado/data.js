import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-escudo-quebrado.json');
    const data = await resp.json();
    estado.clubes = data.clubes;
}

export function escolherClube() {
    const disponiveis = estado.clubes.filter(c => !estado.clubesUsados.includes(c.nome));
    const idx = Math.floor(Math.random() * disponiveis.length);
    const clube = disponiveis[idx];
    estado.clubesUsados.push(clube.nome);
    return clube;
}

export function obterDica(nivel) {
    if (!estado.clubeAtual) {
        return null;
    }
    return estado.clubeAtual.dicas.find(d => d.nivel === nivel) || null;
}

export function obterCores() {
    const dica1 = estado.clubeAtual.dicas.find(d => d.nivel === 1);
    return dica1 ? dica1.cores : [];
}
