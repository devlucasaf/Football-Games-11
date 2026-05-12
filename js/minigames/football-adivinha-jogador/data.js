import estado from "./core.js";

export async function carregarDados() {
    const resposta = await fetch("../data/football-adivinha-jogador.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }

    const dados = await resposta.json();
    estado.jogadores = dados.jogadores;
}

export function escolherJogador() {
    const disponiveis = estado.jogadores.filter((_, i) => !estado.jogadoresUsados.has(i));

    if (disponiveis.length === 0) {
        estado.jogadoresUsados.clear();
        return escolherJogador();
    }

    const indices = estado.jogadores
        .map((_, i) => i)
        .filter(i => !estado.jogadoresUsados.has(i));

    const idx = indices[Math.floor(Math.random() * indices.length)];
    
    estado.jogadoresUsados.add(idx);
    estado.jogadorAtual = estado.jogadores[idx];
    estado.pistasReveladas = 1;
    estado.tentativas = 0;
    estado.jogoAtivo = true;
}

export function obterNomesJogadores() {
    return estado.jogadores.map(j => j.nome);
}
