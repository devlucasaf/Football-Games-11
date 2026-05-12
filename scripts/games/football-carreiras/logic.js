import estado from "./core.js";
import { normalizar } from "./utils.js";
import { revelarProximo, revelarTodos } from "./grid.js";
import { atualizarInfo, mostrarResultado, esconderSugestoes } from "./ui.js";

export function tratarPalpite() {
    if (!estado.jogoAtivo) {
        return;
    }

    const input = document.getElementById("playerInput");
    const palpite = input.value.trim();
    if (!palpite) {
        return;
    }

    const palpiteNorm = normalizar(palpite);
    const nomeNorm = normalizar(estado.jogadorAtual.nome);

    input.value = "";
    esconderSugestoes();

    if (palpiteNorm === nomeNorm || nomeNorm.includes(palpiteNorm) || palpiteNorm.includes(nomeNorm)) {
        estado.jogoAtivo = false;
        revelarTodos();
        setTimeout(() => {
            mostrarResultado(true);
        }, estado.jogadorAtual.clubes.length * 80 + 400);
    } else {
        estado.erros++;
        atualizarInfo();

        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 500);

        // --- REVELAR PRÓXIMO CLUBE ---
        if (estado.clubesRevelados < estado.jogadorAtual.clubes.length) {
            revelarProximo();
        } else {
            estado.jogoAtivo = false;
            mostrarResultado(false);
        }
    }
}

export function pular() {
    if (!estado.jogoAtivo) {
        return;
    }

    estado.jogoAtivo = false;
    revelarTodos();
    setTimeout(() => {
        mostrarResultado(false);
    }, estado.jogadorAtual.clubes.length * 80 + 400);
}
