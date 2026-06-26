import { estado } from "./core.js";
import { carregarDados, escolherDuelo, obterPosicaoAtual } from "./data.js";
import {
    configurarDuelo,
    mostrarEscolha,
    revelarResultado,
    colocarJogadorNoCampo,
    atualizarPontuacao,
    mostrarResultadoFinal
} from "./ui.js";

// --- VERIFICAR ESCOLHA ---
function verificarEscolha(escolha) {
    if (estado.respondido) {
        return;
    }
    estado.respondido = true;

    const posicao = obterPosicaoAtual();

    estado.escolhas.push({
        posicao: posicao.posicao,
        jogadorA: posicao.jogadorA,
        jogadorB: posicao.jogadorB,
        escolha
    });

    revelarResultado(escolha, posicao);

    colocarJogadorNoCampo(estado.posicaoIdx);

    setTimeout(() => {
        estado.posicaoIdx++;
        if (estado.posicaoIdx >= estado.totalPosicoes) {
            finalizar();
        } else {
            proximaPosicao();
        }
    }, 1200);
}

// --- PRÓXIMA POSIÇÃO ---
function proximaPosicao() {
    estado.respondido = false;
    const posicao = obterPosicaoAtual();
    mostrarEscolha(posicao);
}

// --- FINALIZAR ---
function finalizar() {
    if (estado.acertos >= 8) {
        if (window.registrarVitoria) {
            window.registrarVitoria();
        }
    } else {
        if (window.registrarDerrota) {
            window.registrarDerrota();
        }
    }
    mostrarResultadoFinal();
}

// --- INICIAR DUELO ---
function iniciarDuelo() {
    estado.posicaoIdx = 0;
    estado.acertos = 0;
    estado.respondido = false;
    estado.escolhas = [];

    estado.dueloAtual = escolherDuelo();
    if (!estado.dueloAtual) {
        estado.duelosUsados = [];
        estado.dueloAtual = escolherDuelo();
    }

    configurarDuelo(estado.dueloAtual);
    proximaPosicao();
}

// --- INIT ---
async function init() {
    await carregarDados();

    document.getElementById("cardA").addEventListener("click", () => verificarEscolha("A"));
    document.getElementById("cardB").addEventListener("click", () => verificarEscolha("B"));
    document.getElementById("btnRetry").addEventListener("click", () => {
        document.getElementById("finalResult").classList.add("hidden");
        iniciarDuelo();
    });
    document.getElementById("btnHome").addEventListener("click", () => {
        window.location.href = "../index.html";
    });

    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const gameKey = tutorialOverlay?.dataset.game;
    const skipKey = gameKey ? `tutorial_skip_${gameKey}` : null;

    if (skipKey && localStorage.getItem(skipKey)) {
        tutorialOverlay.classList.add("hidden");
        iniciarDuelo();
    } else if (tutorialOverlay) {
        document.getElementById("tutorialStartBtn").addEventListener("click", () => {
            tutorialOverlay.classList.add("hidden");
            iniciarDuelo();
        });
        document.getElementById("tutorialSkipBtn").addEventListener("click", () => {
            if (skipKey) {
                localStorage.setItem(skipKey, "true");
            }
            tutorialOverlay.classList.add("hidden");
            iniciarDuelo();
        });
    } else {
        iniciarDuelo();
    }
}

init();
