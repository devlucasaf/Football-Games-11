import { estado } from "./core.js";

// --- CARREGA OS DADOS DO ARQUIVO JSON DE TRANSFERÊNCIAS ---
export async function carregarDados() {
    const resposta = await fetch("data/football-transferencias.json");
    const dadosTransferencias = await resposta.json();
    estado.dados = dadosTransferencias;
}

// --- SELECIONA O MODO E CARREGA OS JOGADORES CORRESPONDENTES ---
export function selecionarModo(modo) {
    estado.modoAtual = modo;
    estado.jogadores = estado.dados[modo];
}

// --- ESCOLHE UM JOGADOR ALEATÓRIO QUE AINDA NÃO FOI USADO ---
export function escolherJogador() {
    const disponiveis = estado.jogadores
        .map((jogadorCandidato, indiceJogador) => indiceJogador)
        .filter(indiceJogador => !estado.jogadoresUsados.includes(indiceJogador));

    if (disponiveis.length === 0) {
        return null;
    }

    const indiceJogadorSorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    estado.jogadoresUsados.push(indiceJogadorSorteado);
    estado.jogadorAtual = estado.jogadores[indiceJogadorSorteado];
    estado.clubesRevelados = 1; 
    return estado.jogadorAtual;
}

// --- RETORNA UM ARRAY COM OS NOMES DE TODOS OS JOGADORES ---
export function obterNomesJogadores() {
    return estado.jogadores.map(jogador => jogador.nome);
}
