import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-conexoes.json');
    const data = await resp.json();
    estado.puzzles = data.puzzles;
}

export function escolherPuzzle() {
    if (estado.puzzles.length === 0) {
        return null;
    }

    estado.puzzleAtual = estado.puzzles[estado.puzzleIndex % estado.puzzles.length];
    estado.puzzleIndex++;
    return estado.puzzleAtual;
}

export function embaralhar(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function obterTodosJogadores(puzzle) {
    const todos = [];
    puzzle.grupos.forEach(g => {
        g.jogadores.forEach(j => todos.push(j));
    });
    return todos;
}

export function verificarGrupo(selecionados, puzzle) {
    for (const grupo of puzzle.grupos) {
        const jogadoresGrupo = grupo.jogadores;
        const acertos = selecionados.filter(s => jogadoresGrupo.includes(s)).length;
        if (acertos === 4) {
            return { 
                acertou: true, 
                grupo, 
                quaseLa: false 
            };
        }
        if (acertos === 3) {
            return { 
                acertou: false, 
                grupo:   null, 
                quaseLa: true 
            };
        }
    }
    return { 
        acertou: false, 
        grupo:   null, 
        quaseLa: false 
    };
}
