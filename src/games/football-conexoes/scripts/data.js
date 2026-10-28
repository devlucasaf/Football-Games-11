import { estado } from "./core.js";

export async function carregarDados() {
    const respostaCarregamento = await fetch("data/football-conexoes.json");
    const dadosDesafios = await respostaCarregamento.json();
    estado.desafios = dadosDesafios.puzzles;
}

// --- ESCOLHER PUZZLE ---
export function escolherDesafio() {
    if (estado.desafios.length === 0) {
        return null;
    }

    estado.desafioAtual = estado.desafios[estado.indiceDesafioAtual % estado.desafios.length];
    estado.indiceDesafioAtual++;
    return estado.desafioAtual;
}

// --- EMBARALHAR ARRAY ---
export function embaralharJogadores(jogadores) {
    const jogadoresEmbaralhados = [...jogadores];
    for (let indiceJogador = jogadoresEmbaralhados.length - 1; indiceJogador > 0; indiceJogador--) {
        const indiceSorteado = Math.floor(Math.random() * (indiceJogador + 1));
        [jogadoresEmbaralhados[indiceJogador], jogadoresEmbaralhados[indiceSorteado]] = [jogadoresEmbaralhados[indiceSorteado], jogadoresEmbaralhados[indiceJogador]];
    }
    return jogadoresEmbaralhados;
}

// --- OBTER TODOS OS JOGADORES DO PUZZLE ---
export function obterTodosJogadores(desafio) {
    const todosJogadores = [];
    desafio.grupos.forEach(grupo => {
        grupo.jogadores.forEach(jogador => todosJogadores.push(jogador));
    });
    return todosJogadores;
}

// --- VERIFICAR SE SELEÇÃO FORMA UM GRUPO ---
export function verificarGrupo(selecionados, desafio) {
    for (const grupo of desafio.grupos) {
        const jogadoresGrupo = grupo.jogadores;
        const acertos = selecionados.filter(jogadorSelecionado => jogadoresGrupo.includes(jogadorSelecionado)).length;
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
