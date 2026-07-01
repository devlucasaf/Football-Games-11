import { estado } from "./core.js";
import { carregarDados, escolherDuelo, obterPosicaoAtual } from "./data.js";
import {
    configurarDuelo,
    mostrarEscolha,
    registrarEscolha,
    colocarJogadorNoCampo,
    mostrarResultadoFinal
} from "./ui.js";

// --- REGISTRAR ESCOLHA DO JOGADOR ---
function verificarEscolha(escolha) {
    if (estado.respondido) {
        return;
    }
    estado.respondido = true;

    const posicao = obterPosicaoAtual();
    const time = escolha === "A" ? estado.dueloAtual.timeA : estado.dueloAtual.timeB;
    const jogador = escolha === "A" ? posicao.jogadorA : posicao.jogadorB;

    estado.escolhas.push({
        posicao: posicao.posicao,
        jogadorA: posicao.jogadorA,
        jogadorB: posicao.jogadorB,
        escolha,
        jogador,
        time: time.nome,
        temporada:  time.temporada,
        escudo:     time.escudo
    });

    registrarEscolha(escolha);
    colocarJogadorNoCampo(estado.posicaoIdx, jogador, escolha);

    setTimeout(() => {
        estado.posicaoIdx++;
        if (estado.posicaoIdx >= estado.totalPosicoes) {
            finalizar();
        } else {
            proximaPosicao();
        }
    }, 700);
}

// --- PRÓXIMA POSIÇÃO ---
function proximaPosicao() {
    estado.respondido = false;
    const posicao = obterPosicaoAtual();
    mostrarEscolha(posicao);
}

// --- FINALIZAR ---
function finalizar() {
    mostrarResultadoFinal();
}

// --- INICIAR DUELO ---
function iniciarDuelo() {
    estado.posicaoIdx = 0;
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
        window.location.href = "../../../index.html";
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
