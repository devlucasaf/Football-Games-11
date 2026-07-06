import { estado } from "./core.js";

// --- CARREGA OS DADOS DO JOGO ---
export async function carregarDados() {
    const resp = await fetch("data/football-forca.json");
    const data = await resp.json();
    estado.jogadores = data.jogadores;
}

// --- NORMALIZA PARA LETRAS A-Z E ESPAÇOS ---
export function normalizar(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// --- ESCOLHE UM JOGADOR ALEATÓRIO PARA A RODADA ---
export function escolherJogador() {
    const idx = Math.floor(Math.random() * estado.jogadores.length);
    estado.atual = estado.jogadores[idx];
    estado.palavra = normalizar(estado.atual.nome);
    estado.reveladas = new Set();
    estado.usadas = new Set();
    estado.erros = 0;
    estado.jogoAtivo = true;
}
