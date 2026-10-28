import estado from "./core.js";
import { normalizar } from "./utils.js";
import { revelarProximo, revelarTodos } from "./grid.js";
import { atualizarInformacoesCarreira, mostrarResultado, esconderSugestoes } from "./ui.js";

// --- TRATAR PALPITE DO JOGADOR ---
export function tratarPalpite() {
    if (!estado.jogoAtivo) {
        return;
    }

    const campoPalpite = document.getElementById("playerInput");
    const palpite = campoPalpite.value.trim();
    if (!palpite) {
        return;
    }

    const palpiteNormalizado = normalizar(palpite);
    const nomeJogadorNormalizado = normalizar(estado.jogadorAtual.nome);

    campoPalpite.value = "";
    esconderSugestoes();

    if (palpiteNormalizado === nomeJogadorNormalizado || nomeJogadorNormalizado.includes(palpiteNormalizado) || palpiteNormalizado.includes(nomeJogadorNormalizado)) {
        estado.jogoAtivo = false;
        revelarTodos();
        setTimeout(() => {
            mostrarResultado(true);
        }, estado.jogadorAtual.clubes.length * 80 + 400);
    } else {
        estado.erros++;
        atualizarInformacoesCarreira();

        campoPalpite.classList.add("shake");
        setTimeout(() => campoPalpite.classList.remove("shake"), 500);

        if (estado.clubesRevelados < estado.jogadorAtual.clubes.length) {
            revelarProximo();
        } else {
            estado.jogoAtivo = false;
            mostrarResultado(false);
        }
    }
}

// --- PULAR RODADA ---
export function pularRodadaCarreira() {
    if (!estado.jogoAtivo) {
        return;
    }

    estado.jogoAtivo = false;
    revelarTodos();
    setTimeout(() => {
        mostrarResultado(false);
    }, estado.jogadorAtual.clubes.length * 80 + 400);
}
