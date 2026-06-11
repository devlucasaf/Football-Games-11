import { estado } from './core.js';

export async function carregarDados() {
    const resp = await fetch('../data/football-conexoes.json');
    const data = await resp.json();
    estado.puzzles = data.puzzles;
}

// --- ESCOLHER PUZZLE ---
export function escolherPuzzle() {
    if (estado.puzzles.length === 0) {
        return null;
    }

    estado.puzzleAtual = estado.puzzles[estado.puzzleIndex % estado.puzzles.length];
    estado.puzzleIndex++;
    return estado.puzzleAtual;
}

// --- EMBARALHAR ARRAY ---
export function embaralhar(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// --- OBTER TODOS OS JOGADORES DO PUZZLE ---
export function obterTodosJogadores(puzzle) {
    const todos = [];
    puzzle.grupos.forEach(g => {
        g.jogadores.forEach(j => todos.push(j));
    });
    return todos;
}

// --- VERIFICAR SE SELEÇÃO FORMA UM GRUPO ---
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
