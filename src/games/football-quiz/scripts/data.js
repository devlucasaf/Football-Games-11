import { estado } from "./core.js";

// --- CARREGAMENTO DE DADOS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-quiz.json");
    const dadosTemas = await resposta.json();
    estado.temas = dadosTemas.temas;
}

// --- SELECIONAR TEMA ---
export function selecionarTema(identificadorTema) {
    estado.temaAtual = estado.temas.find(tema => tema.id === identificadorTema);
}

// --- SORTEAR PERGUNTAS ---
export function sortearPerguntas() {
    if (!estado.temaAtual) {
        return;
    }
    const copia = [...estado.temaAtual.perguntas];
    const sorteadas = [];

    for (let indicePergunta = 0; indicePergunta < estado.totalPerguntas && copia.length > 0; indicePergunta++) {
        const indicePerguntaSorteada = Math.floor(Math.random() * copia.length);
        sorteadas.push(copia.splice(indicePerguntaSorteada, 1)[0]);
    }

    estado.perguntas = sorteadas;
}

// --- OBTER PERGUNTA ATUAL ---
export function obterPerguntaAtual() {
    return estado.perguntas[estado.perguntaAtual] || null;
}
