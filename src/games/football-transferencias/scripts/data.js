import { estado } from "./core.js";

// --- CARREGA OS DADOS DO ARQUIVO JSON DE TRANSFERÊNCIAS ---
export async function carregarDados() {
    const resp = await fetch("data/football-transferencias.json");
    const data = await resp.json();
    estado.dados = data;
}

// --- SELECIONA O MODO E CARREGA OS JOGADORES CORRESPONDENTES ---
export function selecionarModo(modo) {
    estado.modoAtual = modo;
    estado.jogadores = estado.dados[modo];
}

// --- ESCOLHE UM JOGADOR ALEATÓRIO QUE AINDA NÃO FOI USADO ---
export function escolherJogador() {
    const disponiveis = estado.jogadores
        .map((j, i) => i)
        .filter(i => !estado.jogadoresUsados.includes(i));

    if (disponiveis.length === 0) {
        return null;
    }

    const idx = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    estado.jogadoresUsados.push(idx);
    estado.jogadorAtual = estado.jogadores[idx];
    estado.clubesRevelados = 1; 
    return estado.jogadorAtual;
}

// --- RETORNA UM ARRAY COM OS NOMES DE TODOS OS JOGADORES ---
export function obterNomesJogadores() {
    return estado.jogadores.map(j => j.nome);
}
