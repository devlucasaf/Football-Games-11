import estado from "./core.js";
import { embaralhar } from "./utils.js";

export async function carregarDados() {
    const resposta = await fetch("../data/football-grid.json");
    estado.dados = await resposta.json();
}

export function selecionarJogadores() {
    const jogadores = [...estado.dados.jogadores];
    estado.jogadoresSelecionados = embaralhar(jogadores).slice(0, 6);
}

export function selecionarTimes() {
    const clubes = estado.dados.clubes.map(c => c.nome);
    estado.timesSelecionados = embaralhar([...clubes]).slice(0, 36);
}
