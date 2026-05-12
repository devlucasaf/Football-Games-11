import estado from "./core.js";
import { embaralhar } from "./utils.js";

export async function carregarDados() {
    const resposta = await fetch("../data/football-jogou-com.json", { cache: "no-store" });
    if (!resposta.ok) {
        throw new Error(`Erro ao carregar dados (${resposta.status})`);
    }

    const dados = await resposta.json();
    
    estado.rodadas = dados.rodadas;
}

export function escolherRodada() {
    const disponiveis = estado.rodadas.filter((_, i) => !estado.rodadasUsadas.has(i));

    if (disponiveis.length === 0) {
        estado.rodadasUsadas.clear();
        return escolherRodada();
    }

    const indices = estado.rodadas
        .map((_, i) => i)
        .filter(i => !estado.rodadasUsadas.has(i));

    const idx = indices[Math.floor(Math.random() * indices.length)];

    estado.rodadasUsadas.add(idx);
    estado.rodadaAtual = estado.rodadas[idx];
    estado.companheirosRevelados = 0;
    estado.tentativas = 0;
    estado.jogoAtivo = true;
}

export function obterNomesJogadores() {
    return estado.rodadas.map(r => r.resposta);
}
