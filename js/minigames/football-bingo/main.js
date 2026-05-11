import { carregarDados, selecionarJogadores, selecionarTimes } from "./data.js";
import { renderizarJogadores, renderizarGrid } from "./ui.js";

function gerarJogo() {
    selecionarJogadores();
    selecionarTimes();
    renderizarJogadores();
    renderizarGrid();
}

function configurarEventos() {
    const btnNovo = document.getElementById("novoJogoBtn");
    if (btnNovo) {
        btnNovo.addEventListener("click", () => gerarJogo());
    }
}

async function iniciar() {
    try {
        await carregarDados();
        gerarJogo();
        configurarEventos();
    } catch (erro) {
        console.error("Erro ao carregar dados do bingo:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => iniciar());
