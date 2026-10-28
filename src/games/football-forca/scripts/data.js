import { estado } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resposta = await fetch("data/football-forca.json");
    const dados = await resposta.json();
    estado.jogadores = dados.jogadores;
}

// --- NORMALIZA PARA LETRAS A-Z E ESPAÇOS ---
export function normalizarTextoJogador(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// --- ESCOLHE UM JOGADOR ALEATÓRIO PARA A RODADA ---
export function escolherJogador() {
    const indiceJogador = Math.floor(Math.random() * estado.jogadores.length);
    estado.atual = estado.jogadores[indiceJogador];
    estado.palavra = normalizarTextoJogador(estado.atual.nome);
    estado.reveladas = new Set();
    estado.usadas = new Set();
    estado.erros = 0;
    estado.jogoAtivo = true;
}
