// --- PONTO DE ENTRADA DO FOOTBALL CARREIRAS ---

import { carregarDados, escolherJogador } from "./data.js";
import { criarGrid } from "./grid.js";
import { esconderResultado, esconderSugestoes, mostrarSugestoes } from "./ui.js";
import { tratarPalpite, pular } from "./logic.js";

function novoJogo() {
    esconderResultado();
    escolherJogador();
    criarGrid();
    document.getElementById("playerInput").value = "";
    document.getElementById("playerInput").focus();
    esconderSugestoes();
}

function configurarEventos() {
    const input             = document.getElementById("playerInput");
    const guessBtn          = document.getElementById("guessBtn");
    const skipBtn           = document.getElementById("skipBtn");
    const newGameBtn        = document.getElementById("newGameBtn");
    const resultCloseBtn    = document.getElementById("resultCloseBtn");

    guessBtn?.addEventListener("click", () => tratarPalpite());

    input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            tratarPalpite();
        }
    });

    input?.addEventListener("input", () => {
        mostrarSugestoes(input.value, () => tratarPalpite());
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".input-container") && !e.target.closest(".suggestions-container")) {
            esconderSugestoes();
        }
    });

    skipBtn?.addEventListener("click", () => pular());
    newGameBtn?.addEventListener("click", () => novoJogo());
    resultCloseBtn?.addEventListener("click", () => novoJogo());
}

async function iniciar() {
    try {
        await carregarDados();
        escolherJogador();
        criarGrid();
        configurarEventos();
    } catch (erro) {
        console.error(erro);
        alert(`Erro ao iniciar: ${erro.message}`);
    }
}

iniciar();
