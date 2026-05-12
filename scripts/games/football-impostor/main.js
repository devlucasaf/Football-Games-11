import { carregarDados, escolherRodada } from "./data.js";
import { criarCards } from "./game.js";
import { atualizarPlacar, esconderResultado } from "./ui.js";

function proximaRodada() {
    esconderResultado();
    escolherRodada();
    criarCards();
}

async function init() {
    try {
        await carregarDados();
        escolherRodada();
        criarCards();
        atualizarPlacar();

        document.getElementById("nextRoundBtn").addEventListener("click", () => proximaRodada());
    } catch (erro) {
        console.error("Erro ao inicializar Football Impostor:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => init());
