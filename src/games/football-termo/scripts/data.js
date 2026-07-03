import estado           from "./core.js";
import { normalizar }   from "./utils.js";

// --- CARREGAMENTO DOS DADOS DOS JOGADORES ---
export async function carregarDados() {
    const resposta = await fetch("data/football-termo.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar JSON (${resposta.status})`);
    }
    const dados = await resposta.json();
    estado.jogadores = dados.jogadores;
}

// --- SELEÇÃO DO JOGADOR SECRETO ---
export function escolherJogador() {
    const idx = Math.floor(Math.random() * estado.jogadores.length);
    estado.jogadorSecreto = estado.jogadores[idx];
    estado.secretoNormalizado = normalizar(estado.jogadorSecreto);
}