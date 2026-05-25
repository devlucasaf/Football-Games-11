import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-quiz.json');
    const data = await resp.json();
    estado.temas = data.temas;
}

export function selecionarTema(temaId) {
    estado.temaAtual = estado.temas.find(t => t.id === temaId);
}

export function sortearPerguntas() {
    if (!estado.temaAtual) {
        return;
    }
    const copia = [...estado.temaAtual.perguntas];
    const sorteadas = [];

    for (let i = 0; i < estado.totalPerguntas && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(idx, 1)[0]);
    }

    estado.perguntas = sorteadas;
}

export function perguntaAtual() {
    return estado.perguntas[estado.perguntaAtual] || null;
}
